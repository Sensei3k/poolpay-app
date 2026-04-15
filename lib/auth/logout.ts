import { getBackendUrl } from "@/lib/config";
import { MUTATION_TIMEOUT_MS } from "@/lib/http";

export class LogoutFailedError extends Error {
  constructor() {
    super("logout failed");
    this.name = "LogoutFailedError";
  }
}

/**
 * Classify an error thrown from `fetch()` as a recoverable transport failure
 * (dead backend, DNS, timeout) vs. a programmer/configuration bug. Mirrors the
 * same narrowing used by `lib/auth/backend-fetch.ts` so logout fails open for
 * network issues but still surfaces genuine bugs.
 *
 * - `TypeError`    → fetch network failure (DNS, connection reset, CORS)
 * - `AbortError`   → `AbortSignal.timeout(...)` fired or caller aborted
 * - `TimeoutError` → some runtimes throw this name instead of AbortError
 */
function isTransportError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    return err.name === "AbortError" || err.name === "TimeoutError";
  }
  return false;
}

/**
 * Revoke the refresh-token family bound to the supplied token.
 *
 * The backend (`POST /api/auth/logout`) always returns 204, even when the
 * token is unknown or the body is malformed — logout cannot be used as an
 * oracle to probe token validity. Callers treat this as fire-and-forget and
 * always clear the session cookie regardless of the outcome.
 *
 * - 204                → resolves `void`.
 * - Any other status   → throws `LogoutFailedError`.
 * - Transport failure  → resolves `void` (fail-open; a dead backend must not
 *                        trap the user in a signed-in UI state). Only
 *                        `TypeError` / `AbortError` / `TimeoutError` are
 *                        treated as transport failures — anything else
 *                        propagates so real bugs surface.
 * - Empty token        → throws `LogoutFailedError` without touching the
 *                        network.
 */
export async function revokeRefreshFamily(
  refreshToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  if (!refreshToken) {
    throw new LogoutFailedError();
  }

  let res: Response;
  try {
    res = await fetchImpl(`${getBackendUrl()}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(MUTATION_TIMEOUT_MS),
    });
  } catch (err) {
    if (!isTransportError(err)) throw err;
    return;
  }

  if (res.status !== 204) {
    throw new LogoutFailedError();
  }
}
