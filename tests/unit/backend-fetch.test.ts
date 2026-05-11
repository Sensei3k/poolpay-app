import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookieStore,
  encodeMock,
  getServerTokenMock,
  refreshTokensMock,
  readJwtExpMock,
} = vi.hoisted(() => ({
  cookieStore: { get: vi.fn(), set: vi.fn() },
  encodeMock: vi.fn(async () => "encoded-cookie"),
  getServerTokenMock: vi.fn(),
  refreshTokensMock: vi.fn(),
  readJwtExpMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock("@auth/core/jwt", () => ({
  encode: encodeMock,
  decode: vi.fn(),
}));

vi.mock("@/lib/auth/server-token", () => ({
  getServerToken: getServerTokenMock,
  sessionCookieName: () => "authjs.session-token",
}));

vi.mock("@/lib/auth/refresh", async (orig) => {
  const actual = await orig<typeof import("@/lib/auth/refresh")>();
  return {
    ...actual,
    refreshTokens: refreshTokensMock,
  };
});

vi.mock("@/lib/auth/jwt-exp", () => ({
  readJwtExpSecs: readJwtExpMock,
}));

import {
  BackendUnauthorizedError,
  secureAction,
  secureFetch,
} from "@/lib/auth/backend-fetch";
import { RefreshFailedError } from "@/lib/auth/refresh";

const fetchMock = vi.fn();

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
  process.env.BACKEND_URL = "http://backend.test";
  vi.stubEnv("NODE_ENV", "test");
  vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
  fetchMock.mockReset();
  cookieStore.get.mockReset();
  cookieStore.set.mockReset();
  encodeMock.mockClear();
  getServerTokenMock.mockReset();
  refreshTokensMock.mockReset();
  readJwtExpMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `status ${status}`,
    json: async () => body,
  } as unknown as Response;
}

describe("secureFetch", () => {
  it("returns data on 200 happy path without invoking refresh", async () => {
    getServerTokenMock.mockResolvedValueOnce({ accessToken: "tok-1", refreshToken: "ref-1" });
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { hello: "world" }));

    const result = await secureFetch<{ hello: string }>(
      "/api/admin/groups",
      { hello: "" },
    );

    expect(result).toEqual({
      ok: true,
      status: 200,
      data: { hello: "world" },
    });
    expect(refreshTokensMock).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/admin/groups");
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer tok-1",
    );
  });

  it("retries once after 401 → refresh success → 200", async () => {
    getServerTokenMock
      .mockResolvedValueOnce({ accessToken: "tok-old", refreshToken: "ref-1" });
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { error: "unauthorized" }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: 1 }));
    refreshTokensMock.mockResolvedValueOnce({
      accessToken: "tok-new",
      refreshToken: "ref-2",
      expiresAt: "2026-04-16T00:00:00Z",
    });
    readJwtExpMock.mockReturnValueOnce(2_000_000_000);

    const result = await secureFetch<{ ok: number }>("/api/admin/groups", { ok: 0 });

    expect(result).toEqual({ ok: true, status: 200, data: { ok: 1 } });
    expect(refreshTokensMock).toHaveBeenCalledOnce();
    expect(cookieStore.set).toHaveBeenCalledOnce();
    expect(encodeMock).toHaveBeenCalledOnce();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = (fetchMock.mock.calls[1][1] as RequestInit)
      .headers as Headers;
    expect(retryHeaders.get("Authorization")).toBe("Bearer tok-new");
  });

  it("throws retry_exhausted when second call also returns 401", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok-old",
      refreshToken: "ref-1",
    });
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { error: "unauthorized" }))
      .mockResolvedValueOnce(jsonResponse(401, { error: "unauthorized" }));
    refreshTokensMock.mockResolvedValueOnce({
      accessToken: "tok-new",
      refreshToken: "ref-2",
      expiresAt: "x",
    });
    readJwtExpMock.mockReturnValueOnce(2_000_000_000);

    await expect(secureFetch("/api/admin/groups", null)).rejects.toMatchObject({
      name: "BackendUnauthorizedError",
      reason: "retry_exhausted",
    });
  });

  it("throws refresh_failed when refresh throws RefreshFailedError", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok-old",
      refreshToken: "ref-1",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { error: "unauthorized" }));
    refreshTokensMock.mockRejectedValueOnce(new RefreshFailedError());

    await expect(secureFetch("/api/admin/groups", null)).rejects.toMatchObject({
      name: "BackendUnauthorizedError",
      reason: "refresh_failed",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("throws refresh_failed when rotated access token has no exp", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok-old",
      refreshToken: "ref-1",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { error: "unauthorized" }));
    refreshTokensMock.mockResolvedValueOnce({
      accessToken: "tok-new",
      refreshToken: "ref-2",
      expiresAt: "x",
    });
    readJwtExpMock.mockReturnValueOnce(null);

    await expect(secureFetch("/api/admin/groups", null)).rejects.toMatchObject({
      reason: "refresh_failed",
    });
  });

  it("throws no_session when getServerToken returns null", async () => {
    getServerTokenMock.mockResolvedValueOnce(null);

    await expect(secureFetch("/api/admin/groups", null)).rejects.toMatchObject({
      reason: "no_session",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws no_session when token has no accessToken", async () => {
    getServerTokenMock.mockResolvedValueOnce({ refreshToken: "r" });
    await expect(secureFetch("/api/admin/groups", null)).rejects.toMatchObject({
      reason: "no_session",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns ok:false with fallback on non-401 error status", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { error: "boom" }));

    const result = await secureFetch("/x", { fallback: true });
    expect(result).toEqual({ ok: false, status: 500, data: { fallback: true } });
    expect(refreshTokensMock).not.toHaveBeenCalled();
  });

  it("returns ok:false with fallback when fetch throws a transport error", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockRejectedValueOnce(new TypeError("network down"));

    const result = await secureFetch("/x", { fallback: true });
    expect(result).toEqual({ ok: false, status: 0, data: { fallback: true } });
  });

  it("returns ok:true with fallback on 204 No Content", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: "No Content",
      json: async () => {
        throw new Error("no body");
      },
    } as unknown as Response);

    const result = await secureFetch("/x", { fallback: true });
    expect(result).toEqual({ ok: true, status: 204, data: { fallback: true } });
  });

  it("returns ok:false on 2xx with unparseable body", async () => {
    // A 2xx with malformed JSON (HTML error page, truncated response) is a
    // backend regression, not a success — surface as ok:false so callers do
    // not render the fallback as if it were fresh data.
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => {
        throw new SyntaxError("unexpected end of JSON input");
      },
    } as unknown as Response);

    const result = await secureFetch<string>("/x", "default");
    expect(result).toEqual({ ok: false, status: 200, data: "default" });
  });

  it("rethrows unexpected non-transport errors so misconfig fails loudly", async () => {
    // A programmer/config error (e.g. getServerToken() throwing when the
    // auth secret is missing) must not be masked as a benign `{ ok: false }`
    // fallback — the operator needs to see the real cause.
    getServerTokenMock.mockRejectedValueOnce(
      new Error("NEXTAUTH_SECRET is not set"),
    );

    await expect(secureFetch("/x", null)).rejects.toThrow(
      "NEXTAUTH_SECRET is not set",
    );
  });

  it("throws refresh_failed when cookie write fails", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok-old",
      refreshToken: "ref-1",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { error: "unauthorized" }));
    refreshTokensMock.mockResolvedValueOnce({
      accessToken: "tok-new",
      refreshToken: "ref-2",
      expiresAt: "x",
    });
    readJwtExpMock.mockReturnValueOnce(2_000_000_000);
    cookieStore.set.mockImplementationOnce(() => {
      throw new Error("cookies().set() called from RSC");
    });

    await expect(secureFetch("/x", null)).rejects.toMatchObject({
      reason: "refresh_failed",
    });
  });
});

describe("secureAction", () => {
  it("returns success: true and parses JSON body", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: "g1" }));

    const result = await secureAction<{ id: string }>("/api/admin/groups", {
      body: { name: "Test" },
    });
    expect(result).toEqual({ success: true, data: { id: "g1" } });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "Test" }));
    expect((init.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("defaults to POST when neither method nor body is supplied", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: "No Content",
      json: async () => {
        throw new Error("no body");
      },
    } as unknown as Response);

    const result = await secureAction("/api/auth/logout");
    expect(result).toEqual({ success: true });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBeUndefined();
  });

  it("returns success on 204 with no body", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: "No Content",
      json: async () => {
        throw new Error("no body");
      },
    } as unknown as Response);

    const result = await secureAction("/api/admin/groups/g1", { method: "DELETE" });
    expect(result).toEqual({ success: true });
  });

  it("returns success: false with backend error message on non-ok", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(409, { error: "conflict" }));

    const result = await secureAction("/api/admin/groups", { body: {} });
    expect(result).toEqual({
      success: false,
      error: "conflict",
      status: 409,
    });
  });

  it("propagates BackendUnauthorizedError from no_session", async () => {
    getServerTokenMock.mockResolvedValueOnce(null);
    await expect(secureAction("/x", { body: {} })).rejects.toBeInstanceOf(
      BackendUnauthorizedError,
    );
  });

  it("returns success:false with error message when fetch throws a transport error", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockRejectedValueOnce(new TypeError("network down"));

    const result = await secureAction("/x", { body: {} });
    expect(result).toEqual({ success: false, error: "network down" });
  });

  it("rethrows unexpected non-transport errors so misconfig fails loudly", async () => {
    getServerTokenMock.mockRejectedValueOnce(
      new Error("NEXTAUTH_SECRET is not set"),
    );

    await expect(secureAction("/x", { body: {} })).rejects.toThrow(
      "NEXTAUTH_SECRET is not set",
    );
  });

  it("attaches response headers on failure so callers can read Retry-After", async () => {
    // change-password's /api/auth/change-password emits 429 + Retry-After; the
    // Server Action needs the header value to drive the rate-limit countdown.
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    const headers = new Headers({ "Retry-After": "23" });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      headers,
      json: async () => ({ error: "too many requests" }),
    } as unknown as Response);

    const result = await secureAction("/api/auth/change-password", {
      body: { currentPassword: "x", newPassword: "y" },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("too many requests");
      expect(result.status).toBe(429);
      expect(result.headers?.get("Retry-After")).toBe("23");
    }
  });

  it("attaches response headers on success as well", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    const headers = new Headers({ "X-Request-Id": "req-42" });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: "No Content",
      headers,
      json: async () => {
        throw new Error("no body");
      },
    } as unknown as Response);

    const result = await secureAction("/api/auth/change-password", {
      body: { currentPassword: "x", newPassword: "y" },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.headers?.get("X-Request-Id")).toBe("req-42");
    }
  });

  it("surfaces a `code` field from a coded error body (poolpay-api#39)", async () => {
    // Backend emits two error shapes — legacy `{ error }` and the newer
    // coded `{ code, message }`. secureAction must pass the code through so
    // callers can branch on a stable slug without parsing human copy. The
    // legacy `error` field is absent on coded errors, so `message` takes
    // over as the user-facing string.
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      headers: new Headers(),
      json: async () => ({
        code: "bad_current",
        message: "Current password is incorrect.",
      }),
    } as unknown as Response);

    const result = await secureAction("/api/auth/change-password", {
      body: { currentPassword: "x", newPassword: "y" },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(result.code).toBe("bad_current");
      expect(result.error).toBe("Current password is incorrect.");
    }
  });

  it("omits the `code` field entirely when the error body is legacy `{ error }`", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(409, { error: "conflict" }));

    const result = await secureAction("/api/admin/groups", { body: {} });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("conflict");
      expect(result.status).toBe(409);
      expect("code" in result).toBe(false);
    }
  });

  it("returns invalid_json_response when a 2xx body fails to parse", async () => {
    // A malformed 2xx body is a backend regression — surface as failure
    // instead of returning { success: true, data: undefined } and masking it.
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => {
        throw new SyntaxError("unexpected end of JSON input");
      },
    } as unknown as Response);

    const result = await secureAction("/x", { body: {} });
    expect(result).toEqual({
      success: false,
      error: "invalid_json_response",
      status: 200,
    });
  });
});

describe("buildRequest behaviour", () => {
  it("preserves caller-supplied Headers instance entries alongside Authorization", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const headers = new Headers();
    headers.set("Accept", "application/vnd.poolpay+json");
    headers.set("If-Match", "etag-42");

    await secureFetch("/x", {}, { headers });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const sent = init.headers as Headers;
    expect(sent.get("Accept")).toBe("application/vnd.poolpay+json");
    expect(sent.get("If-Match")).toBe("etag-42");
    expect(sent.get("Authorization")).toBe("Bearer tok");
  });

  it("forces Content-Type: application/json when body is provided, overriding caller-supplied Content-Type", async () => {
    // buildRequest always JSON.stringify's the body, so honouring a
    // caller-supplied non-JSON Content-Type would ship a header that
    // mismatches the wire payload. Force our Content-Type instead.
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await secureAction("/x", {
      body: { name: "Test" },
      headers: { "Content-Type": "text/plain" },
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("honours a caller-provided AbortSignal instead of the default timeout signal", async () => {
    getServerTokenMock.mockResolvedValueOnce({
      accessToken: "tok",
      refreshToken: "ref",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const controller = new AbortController();
    await secureFetch("/x", {}, { signal: controller.signal });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBe(controller.signal);
  });
});
