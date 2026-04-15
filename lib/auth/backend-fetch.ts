import { cookies } from "next/headers";
import { encode } from "@auth/core/jwt";
import type { JWT } from "@auth/core/jwt";
import { getBackendUrl } from "@/lib/config";
import { FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS } from "@/lib/http";
import {
  getAuthSecret,
  isSecureSessionCookie,
  sessionCookieName,
} from "@/lib/auth/auth-config";
import { readJwtExpSecs } from "@/lib/auth/jwt-exp";
import { refreshTokens, RefreshFailedError } from "@/lib/auth/refresh";
import { getServerToken } from "@/lib/auth/server-token";

export type BackendUnauthorizedReason =
  | "no_session"
  | "refresh_failed"
  | "retry_exhausted";

export class BackendUnauthorizedError extends Error {
  constructor(public readonly reason: BackendUnauthorizedReason) {
    super(`backend_unauthorized:${reason}`);
    this.name = "BackendUnauthorizedError";
  }
}

export interface SecureFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
}

export type SecureFetchResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: T };

export type SecureActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string; status?: number };

const SESSION_MAX_AGE_SECS = 30 * 24 * 60 * 60;

async function writeSessionCookie(token: JWT): Promise<void> {
  const cookieName = sessionCookieName();
  const encoded = await encode({
    token,
    secret: getAuthSecret(),
    salt: cookieName,
    maxAge: SESSION_MAX_AGE_SECS,
  });
  const store = await cookies();
  try {
    store.set(cookieName, encoded, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isSecureSessionCookie(),
      maxAge: SESSION_MAX_AGE_SECS,
    });
  } catch {
    // cookies().set() throws when called from a Server Component.
    // secureFetch must run in a Server Action or Route Handler so the rotated
    // cookie reaches the browser. Surface as refresh_failed so the caller
    // redirects to /signin instead of silently serving a stale token.
    throw new BackendUnauthorizedError("refresh_failed");
  }
}

async function forceJwtRefresh(current: JWT): Promise<JWT> {
  if (!current.refreshToken) {
    throw new BackendUnauthorizedError("refresh_failed");
  }

  let pair;
  try {
    pair = await refreshTokens(current.refreshToken);
  } catch (err) {
    if (err instanceof RefreshFailedError) {
      throw new BackendUnauthorizedError("refresh_failed");
    }
    throw err;
  }

  const newExp = readJwtExpSecs(pair.accessToken);
  if (!newExp) {
    throw new BackendUnauthorizedError("refresh_failed");
  }

  const next: JWT = {
    ...current,
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    accessTokenExpiresAt: newExp,
  };
  delete next.error;

  await writeSessionCookie(next);
  return next;
}

interface ResolvedRequest {
  url: string;
  init: RequestInit;
  hasJsonBody: boolean;
}

function buildRequest(
  path: string,
  opts: SecureFetchOptions,
  token: string,
  defaultTimeoutMs: number,
): ResolvedRequest {
  const { body, timeoutMs, headers, method, ...rest } = opts;
  const hasJsonBody = body !== undefined;
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
    Authorization: `Bearer ${token}`,
    ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
  };
  return {
    url: `${getBackendUrl()}${path}`,
    init: {
      cache: "no-store",
      method: method ?? (hasJsonBody ? "POST" : "GET"),
      ...rest,
      headers: finalHeaders,
      signal: AbortSignal.timeout(timeoutMs ?? defaultTimeoutMs),
      ...(hasJsonBody ? { body: JSON.stringify(body) } : {}),
    },
    hasJsonBody,
  };
}

async function executeWithRetry(
  path: string,
  opts: SecureFetchOptions,
  defaultTimeoutMs: number,
): Promise<Response> {
  let token = await getServerToken();
  if (!token?.accessToken) {
    throw new BackendUnauthorizedError("no_session");
  }

  const first = buildRequest(path, opts, token.accessToken, defaultTimeoutMs);
  let res = await fetch(first.url, first.init);
  if (res.status !== 401) return res;

  token = await forceJwtRefresh(token);
  if (!token.accessToken) {
    throw new BackendUnauthorizedError("refresh_failed");
  }

  const retry = buildRequest(path, opts, token.accessToken, defaultTimeoutMs);
  res = await fetch(retry.url, retry.init);
  if (res.status === 401) {
    throw new BackendUnauthorizedError("retry_exhausted");
  }
  return res;
}

/**
 * Server-side backend read helper for JWT-gated endpoints.
 *
 * Attaches `Authorization: Bearer <access-token>` from the NextAuth cookie.
 * On a 401 response, transparently rotates the token via `/api/auth/refresh`,
 * writes the rotated pair back to the cookie, and retries once. Non-401
 * errors surface as `{ ok: false, data: fallback }`.
 *
 * Throws `BackendUnauthorizedError` when no session exists, refresh fails,
 * or a second 401 follows refresh — the caller should redirect to
 * `/signin?reauth=1`.
 *
 * Server Action / Route Handler only — `cookies().set()` is unavailable in
 * Server Components.
 */
export async function secureFetch<T>(
  path: string,
  fallback: T,
  opts: SecureFetchOptions = {},
): Promise<SecureFetchResult<T>> {
  let res: Response;
  try {
    res = await executeWithRetry(path, opts, FETCH_TIMEOUT_MS);
  } catch (err) {
    // Auth failures are a distinct control-flow signal — caller redirects to
    // /signin. Transport/timeout failures (TypeError, AbortError) collapse
    // into the documented `{ ok: false }` fallback shape so callers never see
    // a raw throw from a read helper.
    if (err instanceof BackendUnauthorizedError) throw err;
    return { ok: false, status: 0, data: fallback };
  }

  if (!res.ok) {
    return { ok: false, status: res.status, data: fallback };
  }

  // 204 No Content and empty 2xx bodies are valid responses — treat them as
  // success with the caller-supplied fallback rather than throwing on JSON
  // parse.
  if (res.status === 204) {
    return { ok: true, status: res.status, data: fallback };
  }

  const data = (await res.json().catch(() => fallback)) as T;
  return { ok: true, status: res.status, data };
}

/**
 * Server-side backend mutation helper for JWT-gated endpoints.
 *
 * Same Bearer-attach + single-401-retry-via-refresh semantics as
 * `secureFetch`. Non-ok statuses (other than 401) return
 * `{ success: false, error, status }` so Server Actions can pipe them into
 * form state. Unlike `apiAction`, auth failures **throw**
 * `BackendUnauthorizedError` rather than returning a failure tuple — callers
 * typically want to redirect to `/signin?reauth=1` for auth errors but
 * render the `error` string for validation / conflict responses.
 *
 * Server Action / Route Handler only.
 */
export async function secureAction<T = undefined>(
  path: string,
  opts: SecureFetchOptions = {},
): Promise<SecureActionResult<T>> {
  let res: Response;
  try {
    res = await executeWithRetry(path, opts, MUTATION_TIMEOUT_MS);
  } catch (err) {
    // Auth failures bubble up so callers can redirect to /signin. Other
    // transport errors collapse into the action failure tuple, matching
    // `apiAction`'s behaviour — Server Actions render `error` into form state.
    if (err instanceof BackendUnauthorizedError) throw err;
    const message = err instanceof Error ? err.message : "network_error";
    return { success: false, error: message };
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message =
      (payload as { error?: string }).error ??
      `${res.status} ${res.statusText}`;
    return { success: false, error: message, status: res.status };
  }

  if (res.status === 204) {
    return { success: true };
  }

  const data = (await res.json().catch(() => undefined)) as T | undefined;
  return { success: true, data };
}
