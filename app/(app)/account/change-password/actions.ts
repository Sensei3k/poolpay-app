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
 * `secureAction` transparently retries once on a 401 (refreshing the access
 * token first). For this endpoint that means a wrong `currentPassword`
 * surfaces as a `retry_exhausted` sentinel rather than a first-class 401
 * response — the refresh itself succeeds (valid session) but the retry gets
 * rejected for the same reason. We map that sentinel to `bad_current` here.
 *
 * `no_session` / `refresh_failed` still bubble up so the caller can redirect
 * to `/signin?reauth=1`.
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

    if (result.status === 429) {
      return {
        ok: false,
        code: "rate_limited",
        retryAfterSecs: parseRetryAfter(result.headers),
      };
    }
    if (result.status === 400) {
      return { ok: false, code: "validation" };
    }
    return { ok: false, code: "service" };
  } catch (err) {
    if (err instanceof BackendUnauthorizedError) {
      if (err.reason === "retry_exhausted") {
        return { ok: false, code: "bad_current" };
      }
      throw err;
    }
    return { ok: false, code: "backend_unavailable" };
  }
}
