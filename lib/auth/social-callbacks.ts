import type { Account, Profile, User } from "next-auth";
import type { JWT } from "@auth/core/jwt";

import {
  ensureUser as defaultEnsureUser,
  EnsureUserForbiddenError,
  type EnsureUserProvider,
} from "@/lib/auth/ensure-user";
import {
  issueTokens as defaultIssueTokens,
  type TokenPair,
} from "@/lib/auth/issue";
import { readJwtExpSecs } from "@/lib/auth/jwt-exp";

export const SOCIAL_PROVIDERS = ["google", "github"] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export const SOCIAL_ERROR_CODES = {
  emailMissing: "EnsureUserEmailMissing",
  forbidden: "EnsureUserForbidden",
  failed: "EnsureUserFailed",
} as const;

export function isSocialProvider(value: string | undefined): value is SocialProvider {
  return typeof value === "string" && (SOCIAL_PROVIDERS as readonly string[]).includes(value);
}

type EnsureUserFn = typeof defaultEnsureUser;
type IssueTokensFn = typeof defaultIssueTokens;

function redirectToSignIn(code: string): string {
  return `/signin?error=${code}`;
}

// Mutates `user` so the subsequent `jwt` callback (which receives the same
// User reference on the first call after sign-in) can read userId/role
// without relying on a side channel. This is the idiomatic NextAuth pattern.
export async function resolveSocialSignIn(params: {
  user: User;
  account: Account | null | undefined;
  profile?: Profile;
  ensureUserImpl?: EnsureUserFn;
}): Promise<boolean | string> {
  const { user, account, profile } = params;

  if (!account || !isSocialProvider(account.provider)) {
    return true;
  }

  const email = profile?.email ?? user.email ?? null;
  if (!email) {
    return redirectToSignIn(SOCIAL_ERROR_CODES.emailMissing);
  }

  const impl = params.ensureUserImpl ?? defaultEnsureUser;

  try {
    const ensured = await impl({
      provider: account.provider as EnsureUserProvider,
      providerSubject: account.providerAccountId,
      email,
    });
    user.id = ensured.userId;
    user.email = ensured.email;
    user.role = ensured.role;
    user.mustResetPassword = false;
    return true;
  } catch (err) {
    if (err instanceof EnsureUserForbiddenError) {
      return redirectToSignIn(SOCIAL_ERROR_CODES.forbidden);
    }
    return redirectToSignIn(SOCIAL_ERROR_CODES.failed);
  }
}

// Called from the `jwt` callback on the first invocation after a social
// sign-in (trigger === "signIn" and account.provider in SOCIAL_PROVIDERS).
// Mints the backend token pair via `/api/auth/issue` and stamps the same
// shape onto the JWT that the credentials-post-auth path produces.
export async function resolveSocialJwt(params: {
  token: JWT;
  user: User;
  account: Account | null | undefined;
  issueTokensImpl?: IssueTokensFn;
}): Promise<JWT> {
  const { token, user, account } = params;

  if (!account || !isSocialProvider(account.provider)) {
    return token;
  }
  if (!user.id) {
    token.error = "RefreshFailedError";
    return token;
  }

  const impl = params.issueTokensImpl ?? defaultIssueTokens;

  let pair: TokenPair;
  try {
    pair = await impl(user.id);
  } catch {
    clearTokenAuthFields(token);
    token.error = "RefreshFailedError";
    return token;
  }

  const exp = readJwtExpSecs(pair.accessToken);
  if (!exp) {
    clearTokenAuthFields(token);
    token.error = "RefreshFailedError";
    return token;
  }

  token.userId = user.id;
  token.role = user.role;
  token.mustResetPassword = user.mustResetPassword ?? false;
  if (user.email) token.email = user.email;
  token.accessToken = pair.accessToken;
  token.refreshToken = pair.refreshToken;
  token.accessTokenExpiresAt = exp;
  delete token.error;
  return token;
}

function clearTokenAuthFields(token: JWT): void {
  token.accessToken = undefined;
  token.refreshToken = undefined;
  token.accessTokenExpiresAt = undefined;
}
