"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { getServerToken } from "@/lib/auth/server-token";
import { revokeRefreshFamily } from "@/lib/auth/logout";

/**
 * Server action wiring the sign-out button to the backend logout contract.
 *
 * Flow:
 *   1. Read the current session JWT (may be absent after an earlier silent
 *      refresh failure — treat as "already signed out locally").
 *   2. Best-effort call to `/api/auth/logout` to revoke the refresh-token
 *      family on the backend. All failures are swallowed — see fail-open
 *      rule below.
 *   3. Clear the NextAuth HttpOnly session cookie.
 *   4. Redirect to `/signin`.
 *
 * Fail-open: cookie clear + redirect always run, even if the backend call or
 * cookie read throws. A dead backend must not trap the user in a signed-in
 * UI state. Worst case is a narrow window where the refresh family is still
 * valid until its TTL expires.
 */
export async function signOutAction(): Promise<void> {
  let refreshToken: string | undefined;
  try {
    const token = await getServerToken();
    refreshToken = token?.refreshToken;
  } catch {
    refreshToken = undefined;
  }

  if (refreshToken) {
    try {
      await revokeRefreshFamily(refreshToken);
    } catch {
      // Fail-open — backend revoke is best-effort; local cookie clear below
      // is what actually signs the user out of the UI.
    }
  }

  await signOut({ redirect: false });
  redirect("/signin");
}
