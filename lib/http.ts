import { BACKEND_URL } from '@/lib/config';
import type { ActionResult } from '@/lib/types';

// ─── Timeouts ──────────────────────────────────────────────────────────────────

// Configurable via env — 5 s is long enough for a cold backend, short enough
// to surface a down server quickly.
export const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS ?? 5_000);
export const MUTATION_TIMEOUT_MS = Number(process.env.MUTATION_TIMEOUT_MS ?? 10_000);

// ─── Types ─────────────────────────────────────────────────────────────────────

export type FetchResult<T> = { data: T; ok: true } | { data: T; ok: false };

// Transient server/infra errors that are safe to retry.
// 4xx client errors are never retried — the request is definitionally broken.
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

// ─── Internal retry helper ─────────────────────────────────────────────────────

async function withRetry(
  fn: () => Promise<Response>,
  retries: number,
  backoffMs: number,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, attempt * backoffMs));
    try {
      const res = await fn();
      if (!RETRYABLE_STATUSES.has(res.status)) return res;
      lastErr = new Error(`${res.status} ${res.statusText}`);
    } catch (err) {
      // Only retry on network failures (TypeError). Timeout/abort DOMExceptions propagate immediately.
      if (!(err instanceof TypeError)) throw err;
      lastErr = err;
    }
  }
  throw lastErr;
}

// ─── apiFetch — read operations ────────────────────────────────────────────────
// Defaults: 5 s timeout, up to 2 retries with 300 ms linear backoff.

export async function apiFetch<T>(
  path: string,
  fallback: T,
  opts?: RequestInit & { token?: string; retries?: number; backoffMs?: number },
): Promise<FetchResult<T>> {
  const { token, retries = 2, backoffMs = 300, ...fetchOpts } = opts ?? {};

  const headers: Record<string, string> = {
    ...(fetchOpts.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await withRetry(
      () =>
        fetch(`${BACKEND_URL}${path}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          ...fetchOpts,
          headers,
        }),
      retries,
      backoffMs,
    );
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return { data: await res.json(), ok: true };
  } catch (err) {
    console.error(`[http] fetch ${path} failed:`, err);
    return { data: fallback, ok: false };
  }
}

// ─── apiAction — mutation operations ───────────────────────────────────────────
// Defaults: 10 s timeout, no retries (mutations are not idempotent by default).
// Pass token explicitly — no default so non-admin callers don't inadvertently
// attach ADMIN_TOKEN to public endpoints.

export interface ApiActionOptions {
  method?: string;    // default 'POST'
  body?: unknown;
  token?: string;     // attaches Authorization: Bearer when provided
  retries?: number;   // default 0
  backoffMs?: number; // default 300
}

export async function apiAction(
  path: string,
  opts: ApiActionOptions = {},
): Promise<ActionResult> {
  const { method = 'POST', body, token, retries = 0, backoffMs = 300 } = opts;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await withRetry(
      () =>
        fetch(`${BACKEND_URL}${path}`, {
          method,
          headers,
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
          signal: AbortSignal.timeout(MUTATION_TIMEOUT_MS),
        }),
      retries,
      backoffMs,
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = (data as { error?: string }).error ?? `${res.status} ${res.statusText}`;
      return { success: false, error: message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
