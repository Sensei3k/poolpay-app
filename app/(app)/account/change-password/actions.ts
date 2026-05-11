"use server";

import {
  BackendUnauthorizedError,
  secureAction,
} from "@/lib/auth/backend-fetch";
import { parseRetryAfter, type ActionErrorCode } from "./status-machine";

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; code: ActionErrorCode; retryAfterSecs?: number | null };

/**
 * POST /api/auth/change-password via the bearer-gated secureAction helper.
 *
 * Backend contract (poolpay-api#39):
 * - `204` on success.
 * - `400 + { code: "bad_current", message }` when `currentPassword` does not
 *   match the stored hash. We map this to a first-class `bad_current` domain
 *   code. Any other `400` is a shape/policy violation (legacy `{ error }`
 *   body) — treated as validation drift.
 * - `401` is now reserved for genuine token failures (expired / revoked /
 *   missing). When `secureAction`'s refresh-retry pipeline exhausts, the
 *   `BackendUnauthorizedError` bubbles out so the caller can redirect to
 *   `/signin?reauth=1`.
 */
export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  try {
    const result = await secureAction<undefined>("/api/auth/change-password", {
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      },
    });

    if (result.success) {
      return { ok: true };
    }

    // `secureAction` returns `{ success: false, error }` with `status`
    // undefined when a transport/timeout error collapses into its failure
    // tuple (see backend-fetch.ts). Map that to `backend_unavailable` so the
    // user sees the "couldn't reach the server" copy rather than the generic
    // "temporarily unavailable" service error.
    if (result.status === undefined) {
      return { ok: false, code: "backend_unavailable" };
    }
    if (result.status === 429) {
      return {
        ok: false,
        code: "rate_limited",
        retryAfterSecs: parseRetryAfter(result.headers),
      };
    }
    if (result.status === 400) {
      if (result.code === "bad_current") {
        return { ok: false, code: "bad_current" };
      }
      return { ok: false, code: "validation" };
    }
    return { ok: false, code: "service" };
  } catch (err) {
    if (err instanceof BackendUnauthorizedError) {
      throw err;
    }
    return { ok: false, code: "backend_unavailable" };
  }
}
