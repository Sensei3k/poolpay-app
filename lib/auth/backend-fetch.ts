import { cookies } from "next/headers";
import { encode } from "@auth/core/jwt";
import type { JWT } from "@auth/core/jwt";
import { getBackendUrl } from "@/lib/config";
import { FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS } from "@/lib/http";
import {
  getAuthSecret,
  isSecureSessionCookie,
  sessionCookieName,
  SESSION_MAX_AGE_SECS,
} from "@/lib/auth/auth-config";
import { readJwtExpSecs } from "@/lib/auth/jwt-exp";
import { refreshTokens, RefreshFailedError } from "@/lib/auth/refresh";
import { getServerToken } from "@/lib/auth/server-token";
import { isTransportError } from "@/lib/auth/transport-error";

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

  let pair: Awaited<ReturnType<typeof refreshTokens>>;
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
}

/**
 * Merge caller-supplied headers (any valid `HeadersInit`: plain object,
 * `Headers` instance, or tuple array) with our required `Authorization` and
 * `Content-Type`. Using `Headers` as the accumulator avoids silently dropping
 * entries when a caller passes a non-plain-object shape.
 *
 * When `hasJsonBody` is true we always force `Content-Type: application/json`
 * — `buildRequest` calls `JSON.stringify(body)` unconditionally, so honouring
 * a caller-supplied non-JSON Content-Type would ship a mismatched header and
 * confuse the backend. If a caller ever needs a non-JSON body, they should
 * reach for `apiFetch` / `apiAction` directly.
 */
function mergeHeaders(
  provided: HeadersInit | undefined,
  hasJsonBody: boolean,
  token: string,
): Headers {
  const merged = new Headers(provided);
  merged.set("Authorization", `Bearer ${token}`);
  if (hasJsonBody) {
    merged.set("Content-Type", "application/json");
  }
  return merged;
}

function buildRequest(
  path: string,
  opts: SecureFetchOptions,
  token: string,
  defaultTimeoutMs: number,
): ResolvedRequest {
  const { body, timeoutMs, headers, method, signal, ...rest } = opts;
  const hasJsonBody = body !== undefined;
  const finalHeaders = mergeHeaders(headers, hasJsonBody, token);
  // Honour a caller-provided signal when present so call sites can cancel
  // from outside; otherwise fall back to a timeout-bound signal. Matches
  // `apiFetch`'s override semantics.
  const finalSignal = signal ?? AbortSignal.timeout(timeoutMs ?? defaultTimeoutMs);
  return {
    url: `${getBackendUrl()}${path}`,
    init: {
      cache: "no-store",
      method: method ?? (hasJsonBody ? "POST" : "GET"),
      ...rest,
      headers: finalHeaders,
      signal: finalSignal,
      ...(hasJsonBody ? { body: JSON.stringify(body) } : {}),
    },
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
    // /signin. Known transport/timeout failures (TypeError, AbortError)
    // collapse into the documented `{ ok: false }` fallback shape so callers
    // never see a raw throw from a read helper. Anything else (e.g. missing
    // auth secret, programmer bug) rethrows so misconfig fails loudly
    // instead of masquerading as a benign network failure.
    if (err instanceof BackendUnauthorizedError) throw err;
    if (!isTransportError(err)) throw err;
    return { ok: false, status: 0, data: fallback };
  }

  if (!res.ok) {
    return { ok: false, status: res.status, data: fallback };
  }

  // 204 No Content is a valid success response with no body.
  if (res.status === 204) {
    return { ok: true, status: res.status, data: fallback };
  }

  // A 2xx body that fails to parse as JSON signals a backend regression
  // (HTML error page, truncated response, wrong Content-Type). Surface as
  // `ok: false` with the fallback so callers don't silently render stale
  // state as if it were fresh data.
  try {
    const data = (await res.json()) as T;
    return { ok: true, status: res.status, data };
  } catch {
    return { ok: false, status: res.status, data: fallback };
  }
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
  // Mirror `apiAction`'s POST-by-default: `buildRequest` otherwise falls
  // back to GET when no body is supplied, which would silently send the
  // wrong verb for mutation endpoints that expect POST (e.g. logout).
  const actionOpts: SecureFetchOptions = { method: "POST", ...opts };
  let res: Response;
  try {
    res = await executeWithRetry(path, actionOpts, MUTATION_TIMEOUT_MS);
  } catch (err) {
    // Auth failures bubble up so callers can redirect to /signin. Known
    // transport errors collapse into the action failure tuple, matching
    // `apiAction`'s behaviour — Server Actions render `error` into form state.
    // Unexpected errors (misconfig, programmer bug) rethrow so the operator
    // sees the real cause instead of a user-facing "network_error" lie.
    if (err instanceof BackendUnauthorizedError) throw err;
    if (!isTransportError(err)) throw err;
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

  // A malformed 2xx body is a backend regression — surface as a failure
  // rather than silently returning `{ success: true, data: undefined }`
  // and masking the problem downstream.
  try {
    const data = (await res.json()) as T;
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: "invalid_json_response",
      status: res.status,
    };
  }
}
