/**
 * Sanitize an optional `?callbackUrl=` query value into a safe internal
 * redirect target. Accepts only single-leading-slash internal paths.
 * External URLs, protocol-relative URLs (`//evil.com`), `javascript:`
 * URIs, and bare relative paths all collapse to `"/"`.
 *
 * Note: a literal `"/"` is intentionally treated as "no explicit
 * callback" by callers. Every role-default landing computed by
 * `postSignInRedirect` is strictly more specific than `"/"`, so a bare
 * root callback would never out-rank the role landing anyway. Callers
 * that need to disambiguate "missing/unsafe" from "explicit `/`" must
 * inspect the raw input themselves before passing it in.
 */
export function safeCallbackUrl(raw: string | null): string {
  if (!raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}
