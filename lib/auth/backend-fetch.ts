import { cookies } from "next/headers";
import { encode } from "@auth/core/jwt";
import type { JWT } from "@auth/core/jwt";
import { getBackendUrl } from "@/lib/config";
import { FETCH_TIMEOUT_MS, MUTATION_TIMEOUT_MS } from "@/lib/http";
import { readJwtExpSecs } from "@/lib/auth/jwt-exp";
import { refreshTokens, RefreshFailedError } from "@/lib/auth/refresh";
import { getServerToken, sessionCookieName } from "@/lib/auth/server-token";

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

function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET (or AUTH_SECRET) is not set");
  }
  return secret;
}

function isSecureCookie(name: string): boolean {
  return name.startsWith("__Secure-");
}

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
      secure: isSecureCookie(cookieName),
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

export async function secureFetch<T>(
  path: string,
  fallback: T,
  opts: SecureFetchOptions = {},
): Promise<SecureFetchResult<T>> {
  const res = await executeWithRetry(path, opts, FETCH_TIMEOUT_MS);
  if (!res.ok) {
    return { ok: false, status: res.status, data: fallback };
  }
  const data = (await res.json()) as T;
  return { ok: true, status: res.status, data };
}

export async function secureAction<T = undefined>(
  path: string,
  opts: SecureFetchOptions = {},
): Promise<SecureActionResult<T>> {
  const res = await executeWithRetry(path, opts, MUTATION_TIMEOUT_MS);

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
