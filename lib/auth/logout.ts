import { getBackendUrl } from "@/lib/config";
import { MUTATION_TIMEOUT_MS } from "@/lib/http";

export class LogoutFailedError extends Error {
  constructor() {
    super("logout failed");
    this.name = "LogoutFailedError";
  }
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
 *                        trap the user in a signed-in UI state).
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
  } catch {
    return;
  }

  if (res.status !== 204) {
    throw new LogoutFailedError();
  }
}
