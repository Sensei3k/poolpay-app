import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BackendError,
  CredentialFieldError,
  InvalidCredentialsError,
  RateLimitedError,
  verifyCredentials,
} from "@/lib/auth/verify-credentials";

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

describe("verifyCredentials", () => {
  it("returns the user row on 200", async () => {
    const user = {
      userId: "abcd",
      email: "admin@example.com",
      role: "super_admin" as const,
      mustResetPassword: false,
    };
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => user,
    });

    const result = await verifyCredentials(
      "admin@example.com",
      "pw",
      fetchImpl,
    );
    expect(result).toEqual(user);
  });

  it("throws BackendError when 200 body has unknown role", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => ({
        userId: "abcd",
        email: "a@b.c",
        role: "root",
        mustResetPassword: false,
      }),
    });
    await expect(verifyCredentials("a@b.c", "pw", fetchImpl)).rejects.toBeInstanceOf(
      BackendError,
    );
  });

  it("throws BackendError when 200 body is missing fields", async () => {
    const fetchImpl = mockFetch({
      status: 200,
      json: async () => ({ userId: "abcd" }),
    });
    await expect(verifyCredentials("a@b.c", "pw", fetchImpl)).rejects.toBeInstanceOf(
      BackendError,
    );
  });

  it("signs the request with the documented headers", async () => {
    const fetchImpl = vi.fn(
      async () =>
        ({
          status: 200,
          json: async () => ({
            userId: "abcd",
            email: "admin@example.com",
            role: "super_admin",
            mustResetPassword: false,
          }),
        }) as Response,
    ) as unknown as typeof fetch;

    await verifyCredentials("admin@example.com", "pw", fetchImpl);

    const call = (fetchImpl as unknown as { mock: { calls: unknown[][] } })
      .mock.calls[0];
    const [url, init] = call as [string, RequestInit];
    expect(url).toBe("http://backend.test/api/auth/verify-credentials");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["X-Signature"]).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(headers["X-Timestamp"]).toMatch(/^\d+$/);
    expect(init.body).toBe(
      JSON.stringify({ email: "admin@example.com", password: "pw" }),
    );
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws CredentialFieldError with the backend message on 400", async () => {
    const fetchImpl = mockFetch({
      status: 400,
      json: async () => ({ error: "email too long" }),
    });
    try {
      await verifyCredentials("a@b.c", "pw", fetchImpl);
      expect.fail("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(CredentialFieldError);
      expect((err as CredentialFieldError).backendMessage).toBe("email too long");
    }
  });

  it("pre-checks email cap without calling the backend", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(
      verifyCredentials("a".repeat(321), "pw", fetchImpl),
    ).rejects.toBeInstanceOf(CredentialFieldError);
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls,
    ).toHaveLength(0);
  });

  it("pre-checks password cap without calling the backend", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(
      verifyCredentials("a@b.c", "p".repeat(1025), fetchImpl),
    ).rejects.toBeInstanceOf(CredentialFieldError);
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[][] } }).mock.calls,
    ).toHaveLength(0);
  });

  it("throws InvalidCredentialsError on 401", async () => {
    const fetchImpl = mockFetch({
      status: 401,
      json: async () => ({ error: "unauthorized" }),
    });
    await expect(verifyCredentials("a@b.c", "pw", fetchImpl)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it("throws RateLimitedError with Retry-After on 429", async () => {
    const fetchImpl = mockFetch({
      status: 429,
      headers: new Headers({ "Retry-After": "42" }),
      json: async () => ({ error: "too many requests" }),
    });

    try {
      await verifyCredentials("a@b.c", "pw", fetchImpl);
      expect.fail("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitedError);
      expect((err as RateLimitedError).retryAfterSecs).toBe(42);
    }
  });

  it("surfaces null retryAfter when header is missing or non-numeric", async () => {
    const fetchImpl = mockFetch({
      status: 429,
      headers: new Headers(),
      json: async () => ({}),
    });
    try {
      await verifyCredentials("a@b.c", "pw", fetchImpl);
      expect.fail("expected throw");
    } catch (err) {
      expect((err as RateLimitedError).retryAfterSecs).toBeNull();
    }
  });

  it("throws BackendError on unexpected status", async () => {
    const fetchImpl = mockFetch({ status: 500 });
    await expect(
      verifyCredentials("a@b.c", "pw", fetchImpl),
    ).rejects.toBeInstanceOf(BackendError);
  });
});
