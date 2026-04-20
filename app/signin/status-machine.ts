import type { SignInCode } from "@/app/signin/actions";

export type SocialProvider = "google" | "github";

export type AuthErrorCause = "invalid-credentials" | "service" | "validation";

export type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "social-inflight"; provider: SocialProvider }
  | { kind: "field-error"; field: "email"; message: string }
  | { kind: "auth-error"; cause: AuthErrorCause; message: string }
  | { kind: "rate-limited"; retryAfterSecs: number | null }
  | { kind: "linking-conflict"; message: string };

export const AUTH_ERROR_DESCRIPTION: Record<AuthErrorCause, string> = {
  "invalid-credentials": "Double-check your credentials and try again.",
  service: "This is on our end. Please try again in a few minutes.",
  validation: "Please review the fields above and try again.",
};

// NextAuth v5 emits `OAuthAccountNotLinked` in the `error` query param when a
// social login tries to claim an email already bound to a different provider.
// `AccountLinkingRequired` is kept for any custom handler that may throw it.
export const LINKING_CONFLICT_ERROR_CODES: ReadonlySet<string> = new Set([
  "OAuthAccountNotLinked",
  "AccountLinkingRequired",
]);

export const LINKING_CONFLICT_MESSAGE =
  "Sign in with your password below, then link Google from Settings → Connected accounts.";

const GENERIC_SERVICE_MESSAGE =
  "Sign-in is temporarily unavailable. Please try again in a few minutes.";

export function messageForCode(
  code: SignInCode | undefined,
  retryAfterSecs: number | undefined,
): { status: Status } {
  switch (code) {
    case "rate_limited":
      return {
        status: {
          kind: "rate-limited",
          retryAfterSecs:
            typeof retryAfterSecs === "number" ? retryAfterSecs : null,
        },
      };
    case "field_validation":
      return {
        status: {
          kind: "auth-error",
          cause: "validation",
          message: "Email or password is too long.",
        },
      };
    case "backend_unavailable":
    case "post_auth_failed":
      return {
        status: {
          kind: "auth-error",
          cause: "service",
          message: GENERIC_SERVICE_MESSAGE,
        },
      };
    default:
      return {
        status: {
          kind: "auth-error",
          cause: "invalid-credentials",
          message: "Invalid email or password.",
        },
      };
  }
}

export function statusFromNextAuthError(rawError: string | null): Status {
  if (!rawError) return { kind: "idle" };
  if (LINKING_CONFLICT_ERROR_CODES.has(rawError)) {
    return { kind: "linking-conflict", message: LINKING_CONFLICT_MESSAGE };
  }
  return {
    kind: "auth-error",
    cause: "service",
    message: GENERIC_SERVICE_MESSAGE,
  };
}
