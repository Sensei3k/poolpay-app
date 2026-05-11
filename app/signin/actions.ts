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
import { signPostAuthNonce } from "@/lib/auth/post-auth-nonce";
import { postSignInRedirect } from "@/lib/auth/post-signin-redirect";
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
  input: {
    email: string;
    password: string;
    callbackUrl: string | null;
  },
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
    pair = await issueTokens(user.userId, fetch);
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

  const accessTokenExpiresAt = String(accessExp);
  const mustResetPassword = String(user.mustResetPassword);
  const { nonce, issuedAt } = signPostAuthNonce({
    userId: user.userId,
    email: user.email,
    role: user.role,
    mustResetPassword,
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    accessTokenExpiresAt,
  });

  try {
    await signIn("credentials-post-auth", {
      userId: user.userId,
      email: user.email,
      role: user.role,
      mustResetPassword,
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      accessTokenExpiresAt,
      postAuthNonce: nonce,
      postAuthIssuedAt: issuedAt,
      redirect: false,
    });
  } catch {
    return { ok: false, code: "post_auth_failed" };
  }

  // Honour an explicit, *safe* `?callbackUrl=` when the caller supplied
  // one that resolves to a real internal path. `safeCallbackUrl` rejects
  // external URLs and protocol-relative tricks by collapsing them to "/",
  // so a sanitized "/" tells us either "no callback", "unsafe input", or
  // "explicit `/`". All three are intentionally collapsed to the same
  // fallthrough here because every role-default landing is more specific
  // than "/", so an explicit `callbackUrl=/` would never out-rank the
  // role landing anyway. See `safeCallbackUrl`'s JSDoc.
  //
  // For the common case (no callback / unsafe callback / bare `/`),
  // route via `postSignInRedirect()` so admins with a non-empty receipts
  // queue land on /admin/receipts and everyone else lands on /home.
  //
  // TODO: thread `pendingReceiptsCount` into `postSignInRedirect` once
  // the inbox count is available at sign-in. Without it, the helper treats
  // admins as "queue empty / unknown" and routes them to /home instead of
  // /admin/receipts even when their queue is non-empty.
  const sanitizedCallback = safeCallbackUrl(input.callbackUrl);
  if (sanitizedCallback !== "/") {
    return { ok: true, redirectTo: sanitizedCallback };
  }
  const { path } = postSignInRedirect({ role: user.role });
  return { ok: true, redirectTo: path };
}
