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
  process.env.NODE_ENV = "test";
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockReset();
  cookieStore.get.mockReset();
  cookieStore.set.mockReset();
  encodeMock.mockClear();
  getServerTokenMock.mockReset();
  refreshTokensMock.mockReset();
  readJwtExpMock.mockReset();
});

afterEach(() => {
  process.env = { ...originalEnv };
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
    expect((init.headers as Record<string, string>).Authorization).toBe(
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
      .headers as Record<string, string>;
    expect(retryHeaders.Authorization).toBe("Bearer tok-new");
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

  it("returns fallback on 2xx with unparseable body", async () => {
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
    expect(result).toEqual({ ok: true, status: 200, data: "default" });
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
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
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
});
