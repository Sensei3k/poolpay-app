"use server";

import { signIn } from "@/auth";
import {
  BackendError,
  CredentialFieldError,
  InvalidCredentialsError,
  RateLimitedError,
  verifyCredentials,
} from "@/lib/auth/verify-credentials";
import {
  IssueBackendError,
  IssueFailedError,
  IssueValidationError,
  issueTokens,
} from "@/lib/auth/issue";
import { readJwtExpSecs } from "@/lib/auth/jwt-exp";
import { safeCallbackUrl } from "@/lib/auth/safe-callback-url";

export type SignInCode =
  | "invalid_credentials"
  | "rate_limited"
  | "field_validation"
  | "backend_unavailable"
  | "post_auth_failed";

export type SignInResult =
  | { ok: true; redirectTo: string }
  | { ok: false; code: SignInCode; retryAfterSecs?: number };

export async function signInAction(
  input: { email: string; password: string; callbackUrl: string | null },
): Promise<SignInResult> {
  const email = typeof input.email === "string" ? input.email : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || !password) {
    return { ok: false, code: "invalid_credentials" };
  }

  let user;
  try {
    user = await verifyCredentials(email, password);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return { ok: false, code: "invalid_credentials" };
    }
    if (err instanceof RateLimitedError) {
      return {
        ok: false,
        code: "rate_limited",
        retryAfterSecs: err.retryAfterSecs ?? undefined,
      };
    }
    if (err instanceof CredentialFieldError) {
      return { ok: false, code: "field_validation" };
    }
    if (err instanceof BackendError) {
      return { ok: false, code: "backend_unavailable" };
    }
    return { ok: false, code: "backend_unavailable" };
  }

  let pair;
  try {
    pair = await issueTokens(user.userId);
  } catch (err) {
    if (err instanceof IssueFailedError) {
      return { ok: false, code: "backend_unavailable" };
    }
    if (err instanceof IssueValidationError) {
      return { ok: false, code: "backend_unavailable" };
    }
    if (err instanceof IssueBackendError) {
      return { ok: false, code: "backend_unavailable" };
    }
    return { ok: false, code: "backend_unavailable" };
  }

  const accessExp = readJwtExpSecs(pair.accessToken);
  if (!accessExp) {
    return { ok: false, code: "backend_unavailable" };
  }

  try {
    await signIn("credentials-post-auth", {
      userId: user.userId,
      email: user.email,
      role: user.role,
      mustResetPassword: String(user.mustResetPassword),
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      accessTokenExpiresAt: String(accessExp),
      redirect: false,
    });
  } catch {
    return { ok: false, code: "post_auth_failed" };
  }

  return { ok: true, redirectTo: safeCallbackUrl(input.callbackUrl) };
}
