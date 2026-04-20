import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";

import {
  ensureUser,
  EnsureUserBackendError,
  EnsureUserForbiddenError,
  EnsureUserUnauthorizedError,
  EnsureUserValidationError,
  type EnsuredUser,
} from "@/lib/auth/ensure-user";

const SECRET = "x".repeat(32);

beforeEach(() => {
  process.env.NEXTAUTH_BACKEND_SECRET = SECRET;
  process.env.BACKEND_URL = "http://backend.test";
});

afterEach(() => {
  delete process.env.NEXTAUTH_BACKEND_SECRET;
  delete process.env.BACKEND_URL;
});

function mockFetch(response: Partial<Response>): typeof fetch {
  return vi.fn(async () => response as Response) as unknown as typeof fetch;
}

function mockFetchCapturing(response: Partial<Response>): {
  impl: typeof fetch;
  calls: Array<{ url: string; init: RequestInit }>;
} {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl = vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return response as Response;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const VALID_INPUT = {
  provider: "google" as const,
  providerSubject: "1234567890",
  email: "user@gmail.com",
};

describe("ensureUser", () => {
  it("returns { userId, email, role, created:true } on 200 new user", async () => {
    const payload: EnsuredUser = {
      userId: "abcd",
      email: "user@gmail.com",
      role: "member",
      created: true,
    };
    const fetchImpl = mockFetch({ status: 200, json: async () => payload });

    const result = await ensureUser(VALID_INPUT, fetchImpl);
    expect(result).toEqual(payload);
  });

  it("returns created:false on idempotent call", async () => {
    const payload: EnsuredUser = {
      userId: "abcd",
      email: "user@gmail.com",
      role: "member",
      created: false,
    };
    const fetchImpl = mockFetch({ status: 200, json: async () => payload });

    const result = await ensureUser(VALID_INPUT, fetchImpl);
    expect(result.created).toBe(false);
    expect(result.userId).toBe("abcd");
  });

  it("sends correct HMAC headers and Content-Type", async () => {
    const { impl, calls } = mockFetchCapturing({
      status: 200,
      json: async () => ({
        userId: "abcd",
        email: "user@gmail.com",
        role: "member",
        created: true,
      }),
    });

    await ensureUser(VALID_INPUT, impl);

    expect(calls).toHaveLength(1);
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-Timestamp"]).toMatch(/^\d+$/);
    expect(headers["X-Signature"]).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it("signs over timestamp + '.' + body (known vector)", async () => {
    const { impl, calls } = mockFetchCapturing({
      status: 200,
      json: async () => ({
        userId: "abcd",
        email: "user@gmail.com",
        role: "member",
        created: true,
      }),
    });

    await ensureUser(VALID_INPUT, impl);

    const { init } = calls[0];
    const headers = init.headers as Record<string, string>;
    const body = init.body as string;
    const expected = `sha256=${createHmac("sha256", SECRET)
      .update(`${headers["X-Timestamp"]}.${body}`, "utf8")
      .digest("hex")}`;
    expect(headers["X-Signature"]).toBe(expected);
  });

  it("POSTs to /api/auth/ensure-user at the configured backend", async () => {
    const { impl, calls } = mockFetchCapturing({
      status: 200,
      json: async () => ({
        userId: "abcd",
        email: "user@gmail.com",
        role: "member",
        created: true,
      }),
    });

    await ensureUser(VALID_INPUT, impl);

    expect(calls[0].url).toBe("http://backend.test/api/auth/ensure-user");
    expect(calls[0].init.method).toBe("POST");
  });

  it("rejects unsupported provider client-side", async () => {
    const fetchImpl = mockFetch({ status: 200 });
    await expect(
      ensureUser(
        {
          ...VALID_INPUT,
          provider: "facebook" as unknown as "google",
        },
        fetchImpl,
      ),
    ).rejects.toBeInstanceOf(EnsureUserValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects empty providerSubject client-side", async () => {
    const fetchImpl = mockFetch({ status: 200 });
    await expect(
      ensureUser({ ...VALID_INPUT, providerSubject: "" }, fetchImpl),
    ).rejects.toBeInstanceOf(EnsureUserValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects providerSubject over 255 chars client-side", async () => {
    const fetchImpl = mockFetch({ status: 200 });
    await expect(
      ensureUser(
        { ...VALID_INPUT, providerSubject: "s".repeat(256) },
        fetchImpl,
      ),
    ).rejects.toBeInstanceOf(EnsureUserValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects empty email client-side", async () => {
    const fetchImpl = mockFetch({ status: 200 });
    await expect(
      ensureUser({ ...VALID_INPUT, email: "" }, fetchImpl),
    ).rejects.toBeInstanceOf(EnsureUserValidationError);
  });

  it("rejects email over 320 chars client-side", async () => {
    const fetchImpl = mockFetch({ status: 200 });
    await expect(
      ensureUser({ ...VALID_INPUT, email: "e".repeat(321) }, fetchImpl),
    ).rejects.toBeInstanceOf(EnsureUserValidationError);
  });

  it("throws EnsureUserValidationError on 400 with backend error string", async () => {
    const fetchImpl = mockFetch({
      status: 400,
      json: async () => ({ error: "unsupported provider: xyz" }),
    });
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toMatchObject({
      name: "EnsureUserValidationError",
      backendMessage: "unsupported provider: xyz",
    });
  });

  it("throws EnsureUserUnauthorizedError on 401", async () => {
    const fetchImpl = mockFetch({ status: 401 });
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toBeInstanceOf(
      EnsureUserUnauthorizedError,
    );
  });

  it("throws EnsureUserForbiddenError on 403 (disabled/deleted user)", async () => {
    const fetchImpl = mockFetch({
      status: 403,
      json: async () => ({ error: "user is not active" }),
    });
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toBeInstanceOf(
      EnsureUserForbiddenError,
    );
  });

  it("throws EnsureUserBackendError(500) on 500", async () => {
    const fetchImpl = mockFetch({ status: 500 });
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toMatchObject({
      name: "EnsureUserBackendError",
      status: 500,
    });
  });

  it("throws EnsureUserBackendError on transport failure (TypeError)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toBeInstanceOf(
      EnsureUserBackendError,
    );
  });

  it("throws EnsureUserBackendError on AbortError (timeout)", async () => {
    const fetchImpl = vi.fn(async () => {
      const err = new Error("timeout");
      err.name = "AbortError";
      throw err;
    }) as unknown as typeof fetch;
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toBeInstanceOf(
      EnsureUserBackendError,
    );
  });

  it("re-throws unexpected non-transport errors", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new RangeError("programmer error");
    }) as unknown as typeof fetch;
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toBeInstanceOf(
      RangeError,
    );
  });

  it("throws EnsureUserBackendError(200) on unparseable body", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => {
        throw new SyntaxError("unexpected token");
      },
    });
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toMatchObject({
      name: "EnsureUserBackendError",
      status: 200,
    });
  });

  it("throws EnsureUserBackendError(200) when created field is missing", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => ({
        userId: "abcd",
        email: "user@gmail.com",
        role: "member",
        // created missing
      }),
    });
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toBeInstanceOf(
      EnsureUserBackendError,
    );
  });

  it("throws EnsureUserBackendError(200) when role is unknown", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => ({
        userId: "abcd",
        email: "user@gmail.com",
        role: "root",
        created: true,
      }),
    });
    await expect(ensureUser(VALID_INPUT, fetchImpl)).rejects.toBeInstanceOf(
      EnsureUserBackendError,
    );
  });

  it("wires AbortSignal.timeout on the fetch call", async () => {
    const { impl, calls } = mockFetchCapturing({
      status: 200,
      json: async () => ({
        userId: "abcd",
        email: "user@gmail.com",
        role: "member",
        created: true,
      }),
    });

    await ensureUser(VALID_INPUT, impl);
    expect(calls[0].init.signal).toBeInstanceOf(AbortSignal);
  });
});
