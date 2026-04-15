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

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
  process.env.NODE_ENV = "test";
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
  cookieStore.get.mockReset();
  decodeMock.mockReset();
});

afterEach(() => {
  process.env = { ...originalEnv };
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
    process.env.NODE_ENV = "production";
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
