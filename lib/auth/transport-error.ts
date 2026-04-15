/**
 * Classify an unknown error thrown from `fetch()` as a recoverable transport
 * failure (dead backend, DNS, timeout) vs. a programmer/configuration bug we
 * must fail loudly on. Shared between `backend-fetch.ts` and `logout.ts` so
 * the two call sites can't drift when new runtime error names appear.
 *
 * - `TypeError`    → fetch network failure (DNS, connection reset, CORS)
 * - `AbortError`   → `AbortSignal.timeout(...)` fired or caller aborted
 * - `TimeoutError` → some runtimes throw this name instead of AbortError
 *
 * Anything else (e.g. `getAuthSecret()` throwing on a missing env var, or a
 * genuine programming error) should propagate so the operator sees the real
 * cause rather than a silent fallback.
 */
export function isTransportError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    return err.name === "AbortError" || err.name === "TimeoutError";
  }
  return false;
}
