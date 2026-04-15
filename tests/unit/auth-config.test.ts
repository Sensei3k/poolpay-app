import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

const originalEnv = { ...process.env };

beforeEach(() => {
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
  delete process.env.NEXTAUTH_SECRET;
  delete process.env.AUTH_SECRET;
  process.env.NODE_ENV = "test";
});

afterEach(() => {
  process.env = { ...originalEnv };
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
    process.env.NODE_ENV = "production";
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
