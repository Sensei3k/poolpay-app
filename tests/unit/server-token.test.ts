import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, decodeMock } = vi.hoisted(() => ({
  cookieStore: { get: vi.fn() },
  decodeMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock("@auth/core/jwt", () => ({
  decode: decodeMock,
}));

import {
  getAccessToken,
  getServerToken,
  sessionCookieName,
} from "@/lib/auth/server-token";

// Keys this suite mutates — restored per-key in afterEach rather than
// reassigning process.env (which swaps Node's special env proxy).
// NODE_ENV is managed via vi.stubEnv because TS types it as read-only.
const MANAGED_ENV_KEYS = [
  "NEXTAUTH_SECRET",
  "AUTH_SECRET",
  "AUTH_URL",
  "NEXTAUTH_URL",
] as const;
const originalEnv: Record<string, string | undefined> = Object.fromEntries(
  MANAGED_ENV_KEYS.map((k) => [k, process.env[k]]),
);

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
  vi.stubEnv("NODE_ENV", "test");
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
  cookieStore.get.mockReset();
  decodeMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  for (const key of MANAGED_ENV_KEYS) {
    const original = originalEnv[key];
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
  vi.restoreAllMocks();
});

describe("sessionCookieName", () => {
  it("returns insecure name in dev", () => {
    expect(sessionCookieName()).toBe("authjs.session-token");
  });

  it("returns secure name when AUTH_URL is https", () => {
    process.env.AUTH_URL = "https://app.example.com";
    expect(sessionCookieName()).toBe("__Secure-authjs.session-token");
  });

  it("returns secure name in production without explicit URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(sessionCookieName()).toBe("__Secure-authjs.session-token");
  });
});

describe("getServerToken", () => {
  it("returns null when cookie is missing", async () => {
    cookieStore.get.mockReturnValueOnce(undefined);
    const token = await getServerToken();
    expect(token).toBeNull();
    expect(decodeMock).not.toHaveBeenCalled();
  });

  it("decodes the cookie and returns the JWT", async () => {
    cookieStore.get.mockReturnValueOnce({ value: "encoded.cookie.value" });
    decodeMock.mockResolvedValueOnce({
      userId: "u1",
      accessToken: "access-token",
    });

    const token = await getServerToken();
    expect(token).toEqual({ userId: "u1", accessToken: "access-token" });

    const args = decodeMock.mock.calls[0][0];
    expect(args.token).toBe("encoded.cookie.value");
    expect(args.salt).toBe("authjs.session-token");
    expect(args.secret).toBe("test-secret-0123456789abcdef0123456789abcdef");
  });

  it("returns null when token has RefreshFailedError", async () => {
    cookieStore.get.mockReturnValueOnce({ value: "x" });
    decodeMock.mockResolvedValueOnce({
      accessToken: "a",
      error: "RefreshFailedError",
    });
    expect(await getServerToken()).toBeNull();
  });

  it("returns null when decode throws", async () => {
    cookieStore.get.mockReturnValueOnce({ value: "malformed" });
    decodeMock.mockRejectedValueOnce(new Error("bad"));
    expect(await getServerToken()).toBeNull();
  });

  it("returns null when decode resolves to null", async () => {
    cookieStore.get.mockReturnValueOnce({ value: "x" });
    decodeMock.mockResolvedValueOnce(null);
    expect(await getServerToken()).toBeNull();
  });

  it("throws when NEXTAUTH_SECRET is missing", async () => {
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.AUTH_SECRET;
    cookieStore.get.mockReturnValueOnce({ value: "x" });
    await expect(getServerToken()).rejects.toThrow(/NEXTAUTH_SECRET/);
  });
});

describe("getAccessToken", () => {
  it("returns the access token when present", async () => {
    cookieStore.get.mockReturnValueOnce({ value: "x" });
    decodeMock.mockResolvedValueOnce({ accessToken: "the-token" });
    expect(await getAccessToken()).toBe("the-token");
  });

  it("returns null when token has no accessToken field", async () => {
    cookieStore.get.mockReturnValueOnce({ value: "x" });
    decodeMock.mockResolvedValueOnce({ userId: "u1" });
    expect(await getAccessToken()).toBeNull();
  });

  it("returns null when getServerToken returns null", async () => {
    cookieStore.get.mockReturnValueOnce(undefined);
    expect(await getAccessToken()).toBeNull();
  });
});
