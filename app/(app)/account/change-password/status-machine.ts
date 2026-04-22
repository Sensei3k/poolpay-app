/**
 * Status machine for the change-password form.
 *
 * rhf owns field-level validity (zod resolver). This union owns the
 * submission lifecycle: idle → submitting → (auth-error | rate-limited |
 * network-error) → success.
 *
 * Mirrors the discriminated-union pattern from `app/signin/status-machine.ts`.
 */

export type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "auth-error"; message: string }
  | { kind: "rate-limited"; retryAfterSecs: number | null }
  | { kind: "network-error"; message: string }
  | { kind: "success" };

export type ActionErrorCode =
  | "bad_current"
  | "rate_limited"
  | "validation"
  | "backend_unavailable"
  | "service";

export const AUTH_ERROR_MESSAGE = "Current password is incorrect.";
export const RATE_LIMIT_MESSAGE =
  "Too many attempts. Please wait before trying again.";
export const NETWORK_ERROR_MESSAGE =
  "Something went wrong. We couldn't reach the server. Please try again in a moment.";
export const VALIDATION_ERROR_MESSAGE =
  "We couldn't process those details. Please review the fields and try again.";
export const SERVICE_ERROR_MESSAGE =
  "Password change is temporarily unavailable. Please try again shortly.";

/**
 * Read `Retry-After` from a response's headers and coerce to whole seconds.
 *
 * RFC 7231 allows an HTTP-date form too, but poolpay-api emits a seconds
 * integer. Returns null on missing/malformed/non-positive values so callers
 * fall back to a seconds-less rate-limited alert.
 */
export function parseRetryAfter(headers: Headers | undefined): number | null {
  const raw = headers?.get("Retry-After");
  if (!raw) return null;
  const secs = Number.parseInt(raw, 10);
  if (!Number.isFinite(secs) || secs <= 0) return null;
  return secs;
}

export function statusFromActionError(
  code: ActionErrorCode,
  retryAfterSecs: number | null = null,
): Status {
  switch (code) {
    case "bad_current":
      return { kind: "auth-error", message: AUTH_ERROR_MESSAGE };
    case "rate_limited":
      return { kind: "rate-limited", retryAfterSecs };
    case "validation":
      return { kind: "network-error", message: VALIDATION_ERROR_MESSAGE };
    case "service":
      return { kind: "network-error", message: SERVICE_ERROR_MESSAGE };
    case "backend_unavailable":
    default:
      return { kind: "network-error", message: NETWORK_ERROR_MESSAGE };
  }
}
