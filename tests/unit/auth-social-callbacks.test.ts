import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Account, Profile, User } from "next-auth";
import type { JWT } from "@auth/core/jwt";

import {
  resolveSocialJwt,
  resolveSocialSignIn,
  SOCIAL_ERROR_CODES,
} from "@/lib/auth/social-callbacks";
import {
  EnsureUserBackendError,
  EnsureUserForbiddenError,
  type EnsuredUser,
} from "@/lib/auth/ensure-user";
import type { TokenPair } from "@/lib/auth/issue";

function jwtAccessToken(expSecs: number): string {
  const head = Buffer.from('{"alg":"RS256"}').toString("base64url");
  const body = Buffer.from(JSON.stringify({ exp: expSecs })).toString("base64url");
  return `${head}.${body}.sig`;
}

function googleAccount(overrides: Partial<Account> = {}): Account {
  return {
    provider: "google",
    providerAccountId: "google-sub-123",
    type: "oauth",
    ...overrides,
  } as Account;
}

function githubAccount(overrides: Partial<Account> = {}): Account {
  return {
    provider: "github",
    providerAccountId: "12345",
    type: "oauth",
    ...overrides,
  } as Account;
}

function credentialsAccount(): Account {
  return {
    provider: "credentials-post-auth",
    providerAccountId: "user-id",
    type: "credentials",
  } as Account;
}

function makeEnsuredUser(overrides: Partial<EnsuredUser> = {}): EnsuredUser {
  return {
    userId: "user-abc",
    email: "user@example.com",
    role: "member",
    created: true,
    ...overrides,
  };
}

function makeTokenPair(expSecs = Math.floor(Date.now() / 1000) + 600): TokenPair {
  return {
    accessToken: jwtAccessToken(expSecs),
    refreshToken: "refresh-abc",
    expiresAt: new Date(expSecs * 1000).toISOString(),
  };
}

describe("resolveSocialSignIn", () => {
  let user: User;

  beforeEach(() => {
    user = { email: "user@example.com" } as User;
  });

  it("returns true and no-op for credentials account", async () => {
    const ensure = vi.fn();
    const result = await resolveSocialSignIn({
      user,
      account: credentialsAccount(),
      ensureUserImpl: ensure as never,
    });
    expect(result).toBe(true);
    expect(ensure).not.toHaveBeenCalled();
  });

  it("returns true and no-op when account is null (session refresh)", async () => {
    const ensure = vi.fn();
    const result = await resolveSocialSignIn({
      user,
      account: null,
      ensureUserImpl: ensure as never,
    });
    expect(result).toBe(true);
    expect(ensure).not.toHaveBeenCalled();
  });

  it("calls ensureUser with Google account + profile email", async () => {
    const ensure = vi.fn(async () => makeEnsuredUser());
    const account = googleAccount();
    const profile: Profile = { email: "profile@example.com" } as Profile;

    const result = await resolveSocialSignIn({
      user,
      account,
      profile,
      ensureUserImpl: ensure as never,
    });

    expect(result).toBe(true);
    expect(ensure).toHaveBeenCalledWith({
      provider: "google",
      providerSubject: "google-sub-123",
      email: "profile@example.com",
    });
  });

  it("falls back to user.email when profile email is missing", async () => {
    const ensure = vi.fn(async () => makeEnsuredUser());
    user = { email: "fallback@example.com" } as User;

    await resolveSocialSignIn({
      user,
      account: googleAccount(),
      ensureUserImpl: ensure as never,
    });

    expect(ensure).toHaveBeenCalledWith(
      expect.objectContaining({ email: "fallback@example.com" }),
    );
  });

  it("mutates the user with ensured data (id / email / role / mustResetPassword)", async () => {
    const ensure = vi.fn(async () =>
      makeEnsuredUser({ userId: "u-1", email: "canon@example.com", role: "member" }),
    );

    await resolveSocialSignIn({
      user,
      account: googleAccount(),
      profile: { email: "profile@example.com" } as Profile,
      ensureUserImpl: ensure as never,
    });

    expect(user.id).toBe("u-1");
    expect(user.email).toBe("canon@example.com");
    expect(user.role).toBe("member");
    expect(user.mustResetPassword).toBe(false);
  });

  it("returns email-missing redirect when both profile and user email absent", async () => {
    const ensure = vi.fn();
    user = {} as User;

    const result = await resolveSocialSignIn({
      user,
      account: githubAccount(),
      profile: {} as Profile,
      ensureUserImpl: ensure as never,
    });

    expect(result).toBe(`/signin?error=${SOCIAL_ERROR_CODES.emailMissing}`);
    expect(ensure).not.toHaveBeenCalled();
  });

  it("returns forbidden redirect on EnsureUserForbiddenError", async () => {
    const ensure = vi.fn(async () => {
      throw new EnsureUserForbiddenError("user is not active");
    });

    const result = await resolveSocialSignIn({
      user,
      account: googleAccount(),
      profile: { email: "a@b.c" } as Profile,
      ensureUserImpl: ensure as never,
    });

    expect(result).toBe(`/signin?error=${SOCIAL_ERROR_CODES.forbidden}`);
  });

  it("returns generic failed redirect on backend error", async () => {
    const ensure = vi.fn(async () => {
      throw new EnsureUserBackendError(500);
    });

    const result = await resolveSocialSignIn({
      user,
      account: googleAccount(),
      profile: { email: "a@b.c" } as Profile,
      ensureUserImpl: ensure as never,
    });

    expect(result).toBe(`/signin?error=${SOCIAL_ERROR_CODES.failed}`);
  });

  it("returns generic failed redirect on validation/unauthorized errors too", async () => {
    const ensure = vi.fn(async () => {
      throw new Error("anything else");
    });

    const result = await resolveSocialSignIn({
      user,
      account: googleAccount(),
      profile: { email: "a@b.c" } as Profile,
      ensureUserImpl: ensure as never,
    });

    expect(result).toBe(`/signin?error=${SOCIAL_ERROR_CODES.failed}`);
  });

  it("works for GitHub just like Google", async () => {
    const ensure = vi.fn(async () => makeEnsuredUser({ userId: "gh-1" }));
    await resolveSocialSignIn({
      user,
      account: githubAccount(),
      profile: { email: "a@b.c" } as Profile,
      ensureUserImpl: ensure as never,
    });
    expect(ensure).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "github", providerSubject: "12345" }),
    );
  });
});

describe("resolveSocialJwt", () => {
  let token: JWT;
  let user: User;

  beforeEach(() => {
    token = {} as JWT;
    user = { id: "user-abc", email: "user@example.com", role: "member" } as User;
  });

  it("no-ops when account is null", async () => {
    const issue = vi.fn();
    const result = await resolveSocialJwt({
      token,
      user,
      account: null,
      issueTokensImpl: issue as never,
    });
    expect(result).toBe(token);
    expect(issue).not.toHaveBeenCalled();
  });

  it("no-ops on credentials account (credentials path handles its own tokens)", async () => {
    const issue = vi.fn();
    await resolveSocialJwt({
      token,
      user,
      account: credentialsAccount(),
      issueTokensImpl: issue as never,
    });
    expect(issue).not.toHaveBeenCalled();
  });

  it("stamps tokens + userId + role on social sign-in", async () => {
    const exp = Math.floor(Date.now() / 1000) + 600;
    const pair = makeTokenPair(exp);
    const issue = vi.fn(async () => pair);

    const result = await resolveSocialJwt({
      token,
      user,
      account: googleAccount(),
      issueTokensImpl: issue as never,
    });

    expect(issue).toHaveBeenCalledWith("user-abc");
    expect(result.accessToken).toBe(pair.accessToken);
    expect(result.refreshToken).toBe(pair.refreshToken);
    expect(result.accessTokenExpiresAt).toBe(exp);
    expect(result.userId).toBe("user-abc");
    expect(result.role).toBe("member");
    expect(result.mustResetPassword).toBe(false);
    expect(result.email).toBe("user@example.com");
    expect(result.error).toBeUndefined();
  });

  it("sets RefreshFailedError when user.id missing (defensive)", async () => {
    const issue = vi.fn();
    user = { email: "user@example.com" } as User;
    const result = await resolveSocialJwt({
      token,
      user,
      account: googleAccount(),
      issueTokensImpl: issue as never,
    });
    expect(result.error).toBe("RefreshFailedError");
    expect(issue).not.toHaveBeenCalled();
  });

  it("clears auth fields and sets RefreshFailedError on issueTokens failure", async () => {
    token.accessToken = "stale";
    const issue = vi.fn(async () => {
      throw new Error("backend down");
    });

    const result = await resolveSocialJwt({
      token,
      user,
      account: githubAccount(),
      issueTokensImpl: issue as never,
    });

    expect(result.accessToken).toBeUndefined();
    expect(result.refreshToken).toBeUndefined();
    expect(result.accessTokenExpiresAt).toBeUndefined();
    expect(result.error).toBe("RefreshFailedError");
  });

  it("sets RefreshFailedError when access token has no exp claim", async () => {
    const bad = `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(
      '{"no":"exp"}',
    ).toString("base64url")}.sig`;
    const issue = vi.fn(async () => ({
      accessToken: bad,
      refreshToken: "r",
      expiresAt: "2030-01-01T00:00:00Z",
    }));

    const result = await resolveSocialJwt({
      token,
      user,
      account: googleAccount(),
      issueTokensImpl: issue as never,
    });

    expect(result.error).toBe("RefreshFailedError");
    expect(result.accessToken).toBeUndefined();
  });

  it("clears previous error on successful social sign-in", async () => {
    token.error = "RefreshFailedError";
    const issue = vi.fn(async () => makeTokenPair());

    const result = await resolveSocialJwt({
      token,
      user,
      account: googleAccount(),
      issueTokensImpl: issue as never,
    });

    expect(result.error).toBeUndefined();
  });

  it("works for GitHub just like Google", async () => {
    const issue = vi.fn(async () => makeTokenPair());
    await resolveSocialJwt({
      token,
      user,
      account: githubAccount(),
      issueTokensImpl: issue as never,
    });
    expect(issue).toHaveBeenCalledWith("user-abc");
  });
});
