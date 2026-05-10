import type { Role } from "@/lib/auth/verify-credentials";

const ADMIN_RECEIPTS_PATH = "/admin/receipts";
const HOME_PATH = "/home";

/**
 * Result of the post-signin landing decision. The path is always a
 * relative URL safe for `router.push()` — never an absolute URL or
 * arbitrary user input. Callers that received a `?callbackUrl=` should
 * still pass it through `safeCallbackUrl` separately; this helper does
 * NOT consider callback URLs (it answers "where does the user *belong*"
 * not "where did they ask to go").
 */
export interface PostSignInRedirect {
  /** Absolute path to redirect to, e.g. `/admin/receipts` or `/home`. */
  path: string;
  /**
   * Why this path was chosen. Logged at the call site for observability;
   * also keeps the helper unit-testable without asserting on free-form
   * strings.
   */
  reason: "admin-pending-receipts" | "default-home";
}

export interface PostSignInRedirectInput {
  role: Role;
  /**
   * Pending-receipt count for admins. Pass `undefined` for non-admins
   * (we'll skip the receipts query entirely) or when the count couldn't
   * be fetched — in which case we fall back to the default landing.
   * Pass `0` to explicitly signal "queue is empty"; callers should
   * NEVER pass `null` here.
   */
  pendingReceiptsCount?: number;
}

/**
 * Decide where a user lands after signing in.
 *
 * The handoff (`docs/design-handoff/HANDOFF.md` §5.3 "signal-driven
 * landing") says admins with a non-empty receipts queue should land on
 * `/admin/receipts` instead of `/home`. This is the "do the work that's
 * waiting" rule — admins that have nothing to confirm see the same home
 * surface members do, optionally with an inbox-clear pill.
 *
 * Pure function; no side effects. The receipts count must be supplied
 * by the caller (RSC + API call against the admin's scoped groups).
 *
 * NOTE FOR SLICE 1: `/home` does not exist yet — slice 2 builds it. The
 * `signInAction` callsite still uses `safeCallbackUrl`-driven redirects
 * for now. Once `/home` and the pending-count API are in place, swap the
 * action over to call this helper. The helper itself is unit-tested and
 * ready.
 */
export function postSignInRedirect({
  role,
  pendingReceiptsCount,
}: PostSignInRedirectInput): PostSignInRedirect {
  const isAdmin = role === "admin" || role === "super_admin";
  if (
    isAdmin &&
    typeof pendingReceiptsCount === "number" &&
    Number.isFinite(pendingReceiptsCount) &&
    pendingReceiptsCount > 0
  ) {
    return { path: ADMIN_RECEIPTS_PATH, reason: "admin-pending-receipts" };
  }
  return { path: HOME_PATH, reason: "default-home" };
}
