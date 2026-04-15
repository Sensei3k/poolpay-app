/**
 * Shared NextAuth configuration constants.
 *
 * `server-token.ts` and `backend-fetch.ts` both need the raw session-cookie
 * name and signing secret to decode / re-encode the HttpOnly JWT cookie.
 * Centralising here prevents drift if the env-var precedence or cookie-prefix
 * logic ever changes.
 */

const SECURE_COOKIE_NAME = "__Secure-authjs.session-token";
const INSECURE_COOKIE_NAME = "authjs.session-token";

function useSecureCookies(): boolean {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (url) return url.startsWith("https://");
  return process.env.NODE_ENV === "production";
}

/**
 * Returns the active NextAuth session-cookie name.
 *
 * Matches `defaultCookies(useSecureCookies)` from
 * `@auth/core/lib/utils/cookie` — the cookie name doubles as the JWT
 * encryption salt, so `encode()` / `decode()` callers must use this helper.
 */
export function sessionCookieName(): string {
  return useSecureCookies() ? SECURE_COOKIE_NAME : INSECURE_COOKIE_NAME;
}

/**
 * Whether the active cookie is `__Secure-` prefixed and therefore requires
 * the `secure: true` cookie attribute when written back via `cookies().set()`.
 */
export function isSecureSessionCookie(): boolean {
  return sessionCookieName().startsWith("__Secure-");
}

/**
 * Resolves the NextAuth signing secret.
 *
 * Throws on misconfiguration — this is a server-boot invariant, not a user
 * error, so fail loudly rather than silently returning null.
 */
export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET (or AUTH_SECRET) is not set");
  }
  return secret;
}
