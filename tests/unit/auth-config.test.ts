import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAuthSecret,
  isSecureSessionCookie,
  sessionCookieName,
} from "@/lib/auth/auth-config";

// Pin against the literals from @auth/core/lib/utils/cookie.js `defaultCookies`.
// If a next-auth upgrade changes either string, this guard fires before the
// silent-refresh path breaks production.
const AUTHJS_INSECURE_SESSION_COOKIE = "authjs.session-token";
const AUTHJS_SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";

// Keys this suite mutates — restored per-key in afterEach rather than
// reassigning process.env (which swaps Node's special env proxy).
// NODE_ENV is managed via vi.stubEnv because TS types it as read-only.
const MANAGED_ENV_KEYS = [
  "AUTH_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "AUTH_SECRET",
] as const;
const originalEnv: Record<string, string | undefined> = Object.fromEntries(
  MANAGED_ENV_KEYS.map((k) => [k, process.env[k]]),
);

beforeEach(() => {
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
  delete process.env.NEXTAUTH_SECRET;
  delete process.env.AUTH_SECRET;
  vi.stubEnv("NODE_ENV", "test");
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
});

describe("sessionCookieName", () => {
  it("matches the @auth/core insecure default in dev", () => {
    expect(sessionCookieName()).toBe(AUTHJS_INSECURE_SESSION_COOKIE);
  });

  it("matches the @auth/core secure default when AUTH_URL is https", () => {
    process.env.AUTH_URL = "https://app.example.com";
    expect(sessionCookieName()).toBe(AUTHJS_SECURE_SESSION_COOKIE);
  });

  it("uses AUTH_URL precedence over NEXTAUTH_URL", () => {
    process.env.AUTH_URL = "http://dev.local";
    process.env.NEXTAUTH_URL = "https://prod.example.com";
    expect(sessionCookieName()).toBe("authjs.session-token");
  });

  it("falls back to NEXTAUTH_URL when AUTH_URL is unset", () => {
    process.env.NEXTAUTH_URL = "https://prod.example.com";
    expect(sessionCookieName()).toBe("__Secure-authjs.session-token");
  });

  it("falls back to NODE_ENV=production when no URL is set", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(sessionCookieName()).toBe("__Secure-authjs.session-token");
  });
});

describe("isSecureSessionCookie", () => {
  it("is false in dev", () => {
    expect(isSecureSessionCookie()).toBe(false);
  });

  it("is true when cookie is __Secure- prefixed", () => {
    process.env.AUTH_URL = "https://app.example.com";
    expect(isSecureSessionCookie()).toBe(true);
  });
});

describe("getAuthSecret", () => {
  it("reads NEXTAUTH_SECRET", () => {
    process.env.NEXTAUTH_SECRET = "abc";
    expect(getAuthSecret()).toBe("abc");
  });

  it("falls back to AUTH_SECRET", () => {
    process.env.AUTH_SECRET = "xyz";
    expect(getAuthSecret()).toBe("xyz");
  });

  it("prefers NEXTAUTH_SECRET over AUTH_SECRET", () => {
    process.env.NEXTAUTH_SECRET = "primary";
    process.env.AUTH_SECRET = "fallback";
    expect(getAuthSecret()).toBe("primary");
  });

  it("throws when neither is set", () => {
    expect(() => getAuthSecret()).toThrow(/NEXTAUTH_SECRET/);
  });
});
