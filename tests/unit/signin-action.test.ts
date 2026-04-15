import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  signIn: vi.fn(async () => undefined),
}));

vi.mock("@/lib/auth/verify-credentials", async (orig) => {
  const actual = await orig<typeof import("@/lib/auth/verify-credentials")>();
  return {
    ...actual,
    verifyCredentials: vi.fn(),
  };
});

vi.mock("@/lib/auth/issue", async (orig) => {
  const actual = await orig<typeof import("@/lib/auth/issue")>();
  return {
    ...actual,
    issueTokens: vi.fn(),
  };
});

import { signIn } from "@/auth";
import {
  InvalidCredentialsError,
  RateLimitedError,
  CredentialFieldError,
  BackendError,
  verifyCredentials,
} from "@/lib/auth/verify-credentials";
import { issueTokens, IssueFailedError } from "@/lib/auth/issue";
import { signInAction } from "@/app/signin/actions";

const verifyMock = verifyCredentials as unknown as ReturnType<typeof vi.fn>;
const issueMock = issueTokens as unknown as ReturnType<typeof vi.fn>;
const signInMock = signIn as unknown as ReturnType<typeof vi.fn>;

function makeAccessJwt(expSecs: number): string {
  const head = Buffer.from('{"alg":"RS256"}').toString("base64url");
  const body = Buffer.from(JSON.stringify({ exp: expSecs })).toString("base64url");
  return `${head}.${body}.sig`;
}

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
  verifyMock.mockReset();
  issueMock.mockReset();
  signInMock.mockReset();
  signInMock.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("signInAction", () => {
  it("returns ok:true with redirect on happy path", async () => {
    verifyMock.mockResolvedValue({
      userId: "abcd",
      email: "a@b.c",
      role: "super_admin",
      mustResetPassword: false,
    });
    const exp = Math.floor(Date.now() / 1000) + 900;
    issueMock.mockResolvedValue({
      accessToken: makeAccessJwt(exp),
      refreshToken: "r",
      expiresAt: "2026-04-16T00:00:00Z",
    });

    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: "/admin",
    });

    expect(result).toEqual({ ok: true, redirectTo: "/admin" });
    expect(signInMock).toHaveBeenCalledWith(
      "credentials-post-auth",
      expect.objectContaining({
        userId: "abcd",
        email: "a@b.c",
        role: "super_admin",
        mustResetPassword: "false",
        accessTokenExpiresAt: String(exp),
        postAuthNonce: expect.stringMatching(/^[0-9a-f]{64}$/),
        postAuthIssuedAt: expect.stringMatching(/^\d+$/),
        redirect: false,
      }),
    );
  });

  it("falls back to root when callbackUrl is external", async () => {
    verifyMock.mockResolvedValue({
      userId: "abcd",
      email: "a@b.c",
      role: "super_admin",
      mustResetPassword: false,
    });
    const exp = Math.floor(Date.now() / 1000) + 900;
    issueMock.mockResolvedValue({
      accessToken: makeAccessJwt(exp),
      refreshToken: "r",
      expiresAt: "2026-04-16T00:00:00Z",
    });

    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: "https://evil.example.com/",
    });

    expect(result).toEqual({ ok: true, redirectTo: "/" });
  });

  it("returns invalid_credentials when email or password is empty", async () => {
    const result = await signInAction({
      email: "",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({ ok: false, code: "invalid_credentials" });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("maps InvalidCredentialsError → invalid_credentials", async () => {
    verifyMock.mockRejectedValue(new InvalidCredentialsError());
    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({ ok: false, code: "invalid_credentials" });
  });

  it("maps RateLimitedError and threads retryAfterSecs", async () => {
    verifyMock.mockRejectedValue(new RateLimitedError(42));
    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({
      ok: false,
      code: "rate_limited",
      retryAfterSecs: 42,
    });
  });

  it("RateLimitedError with null retry-after omits the field", async () => {
    verifyMock.mockRejectedValue(new RateLimitedError(null));
    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({ ok: false, code: "rate_limited" });
  });

  it("maps CredentialFieldError → field_validation", async () => {
    verifyMock.mockRejectedValue(new CredentialFieldError("email too long"));
    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({ ok: false, code: "field_validation" });
  });

  it("maps BackendError → backend_unavailable", async () => {
    verifyMock.mockRejectedValue(new BackendError(500));
    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({ ok: false, code: "backend_unavailable" });
  });

  it("maps IssueFailedError → backend_unavailable", async () => {
    verifyMock.mockResolvedValue({
      userId: "abcd",
      email: "a@b.c",
      role: "super_admin",
      mustResetPassword: false,
    });
    issueMock.mockRejectedValue(new IssueFailedError());
    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({ ok: false, code: "backend_unavailable" });
  });

  it("returns backend_unavailable when access token has no exp", async () => {
    verifyMock.mockResolvedValue({
      userId: "abcd",
      email: "a@b.c",
      role: "super_admin",
      mustResetPassword: false,
    });
    issueMock.mockResolvedValue({
      accessToken: "not.a.jwt",
      refreshToken: "r",
      expiresAt: "2026-04-16T00:00:00Z",
    });
    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({ ok: false, code: "backend_unavailable" });
  });

  it("returns post_auth_failed when signIn throws", async () => {
    verifyMock.mockResolvedValue({
      userId: "abcd",
      email: "a@b.c",
      role: "super_admin",
      mustResetPassword: false,
    });
    const exp = Math.floor(Date.now() / 1000) + 900;
    issueMock.mockResolvedValue({
      accessToken: makeAccessJwt(exp),
      refreshToken: "r",
      expiresAt: "2026-04-16T00:00:00Z",
    });
    signInMock.mockRejectedValue(new Error("nextauth boom"));
    const result = await signInAction({
      email: "a@b.c",
      password: "pw",
      callbackUrl: null,
    });
    expect(result).toEqual({ ok: false, code: "post_auth_failed" });
  });
});
