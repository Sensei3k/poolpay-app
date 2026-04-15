import { cookies } from "next/headers";
import { decode } from "@auth/core/jwt";
import type { JWT } from "@auth/core/jwt";
import { getAuthSecret, sessionCookieName } from "@/lib/auth/auth-config";

export { sessionCookieName };

/**
 * Reads and decodes the NextAuth session JWT from the HttpOnly cookie.
 *
 * Returns `null` when the cookie is absent, cannot be decoded, or carries a
 * `RefreshFailedError` sentinel from FE-2's silent-refresh path. Throws only
 * on server-boot misconfiguration (missing `NEXTAUTH_SECRET`).
 *
 * Server-only — must be called from a Server Component, Server Action, or
 * Route Handler.
 */
export async function getServerToken(): Promise<JWT | null> {
  const cookieName = sessionCookieName();
  const store = await cookies();
  const raw = store.get(cookieName)?.value;
  if (!raw) return null;

  const secret = getAuthSecret();

  try {
    const token = await decode<JWT>({
      token: raw,
      secret,
      salt: cookieName,
    });
    if (!token) return null;
    if (token.error === "RefreshFailedError") return null;
    return token;
  } catch {
    return null;
  }
}

/**
 * Convenience wrapper around `getServerToken()` returning just the access
 * token string, or `null` when no usable session exists.
 */
export async function getAccessToken(): Promise<string | null> {
  const token = await getServerToken();
  return token?.accessToken ?? null;
}
