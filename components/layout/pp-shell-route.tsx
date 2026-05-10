"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PPShell } from "@/components/layout/pp-shell";
import type { PPShellProps } from "@/components/layout/pp-shell";
import type { SidebarItemId } from "@/components/layout/pp-sidebar";

interface RouteMatch {
  id: SidebarItemId;
  title: string;
  /** Optional crumb shown above the title for nested admin / super-admin paths. */
  crumbs?: string;
  /** Show the Quick-pay CTA on the topbar (member surfaces only). */
  showQuickPay?: boolean;
  /**
   * Mobile-only kicker rendered above the title in the mobile app bar.
   * Used for nested member surfaces (`/pools/:poolId`) where the topbar
   * has the page name but the design wants a "POOLS" eyebrow.
   */
  mobileCrumb?: string;
  /**
   * Mobile-only back affordance — when set, the brand glyph is replaced
   * by a chevron pointing at `href`. Used by nested member detail pages
   * (`/pools/:poolId`, `/pools/:poolId/pay`, `/profile`) so members can
   * pop without firing the bottom-tab navigation.
   */
  mobileBack?: { href: string; label: string };
  /** Hide the bottom tab bar for focused full-page flows (e.g. /pay). */
  hideMobileTabBar?: boolean;
}

/**
 * A route entry resolves a pathname into a `RouteMatch`. Static prefixes
 * use the `match` field directly; pattern-driven routes (e.g.
 * `/pools/:poolId/pay`) use `resolve` so they can interpolate the
 * extracted segment into `mobileBack.href`.
 */
interface StaticRouteEntry {
  prefix: string;
  match: RouteMatch;
}
interface PatternRouteEntry {
  /** Regex with one capture group per dynamic segment; must match anchored prefix. */
  pattern: RegExp;
  resolve: (captures: ReadonlyArray<string>) => RouteMatch;
}
type RouteEntry = StaticRouteEntry | PatternRouteEntry;

/**
 * Route → sidebar / topbar context map. Order matters — the first prefix
 * match wins, so the more specific routes (e.g. `/admin/receipts`) must
 * appear before their parents (`/admin`). Slices 2-6 will override these
 * defaults at the page level when richer copy/sub/actions are needed.
 */
const ROUTE_MAP: ReadonlyArray<RouteEntry> = [
  {
    prefix: "/admin/receipts",
    match: { id: "receipts", title: "Receipts queue", crumbs: "Administration" },
  },
  {
    prefix: "/admin",
    match: { id: "receipts", title: "Administration", crumbs: "Administration" },
  },
  {
    prefix: "/sys/groups",
    match: { id: "sys-groups", title: "Groups", crumbs: "System · super_admin" },
  },
  {
    prefix: "/sys/admins",
    match: { id: "sys-admins", title: "Admins", crumbs: "System · super_admin" },
  },
  {
    prefix: "/sys/whatsapp",
    match: { id: "sys-wa", title: "WhatsApp links", crumbs: "System · super_admin" },
  },
  // /pools/:poolId/pay — focused payment flow; hides the tab bar so the
  // mobile column reads as a single task.
  {
    pattern: /^\/pools\/([^/]+)\/pay\/?$/,
    resolve: ([poolId]) => ({
      id: "pools",
      title: "Pay contribution",
      crumbs: "Pools · Pay",
      mobileCrumb: "POOLS / PAY",
      mobileBack: { href: `/pools/${poolId}`, label: "Back to pool" },
      hideMobileTabBar: true,
    }),
  },
  // /pools/:poolId — pool detail page
  {
    pattern: /^\/pools\/([^/]+)\/?$/,
    resolve: () => ({
      id: "pools",
      title: "Pool",
      mobileCrumb: "POOLS",
      mobileBack: { href: "/home", label: "Back to home" },
      showQuickPay: true,
    }),
  },
  { prefix: "/pools", match: { id: "pools", title: "Pools", showQuickPay: true } },
  { prefix: "/activity", match: { id: "activity", title: "Activity" } },
  { prefix: "/people", match: { id: "people", title: "People" } },
  { prefix: "/inbox", match: { id: "inbox", title: "Inbox" } },
  { prefix: "/profile", match: { id: "settings", title: "Profile" } },
  { prefix: "/settings", match: { id: "settings", title: "Settings" } },
  { prefix: "/account", match: { id: "settings", title: "Settings" } },
  { prefix: "/home", match: { id: "home", title: "Home", showQuickPay: true } },
];

const DEFAULT_MATCH: RouteMatch = { id: "home", title: "Home", showQuickPay: true };

function matchRoute(pathname: string | null): RouteMatch {
  if (!pathname) return DEFAULT_MATCH;
  for (const entry of ROUTE_MAP) {
    if ("prefix" in entry) {
      if (pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)) {
        return entry.match;
      }
    } else {
      const result = entry.pattern.exec(pathname);
      if (result) return entry.resolve(result.slice(1));
    }
  }
  return DEFAULT_MATCH;
}

type ShellContext = Pick<
  PPShellProps,
  "role" | "user" | "pendingReceiptsCount" | "activeGroup"
>;

interface PPShellRouteProps extends ShellContext {
  children: ReactNode;
}

/**
 * Client wrapper that derives <PPShell>'s `current`, `title`, `crumbs`,
 * and `showQuickPay` from the active pathname. Used by `app/(app)/layout`
 * so every authenticated page boots with sensible shell chrome without
 * each page having to thread the same metadata through itself.
 *
 * Pages that need richer topbar context (sub-headings, page-level
 * actions, custom titles) will be migrated in slices 2-6 to render
 * `<PPShell>` directly.
 */
export function PPShellRoute({
  role,
  user,
  pendingReceiptsCount,
  activeGroup,
  children,
}: PPShellRouteProps) {
  const pathname = usePathname();
  const match = matchRoute(pathname);

  // Quick pay is a member-only affordance — admins / super_admins manage
  // pools rather than paying into them, so the CTA should never surface
  // on those surfaces even if the route map says otherwise.
  const showQuickPay = role === "member" && match.showQuickPay === true;

  return (
    <PPShell
      role={role}
      user={user}
      pendingReceiptsCount={pendingReceiptsCount}
      activeGroup={activeGroup}
      current={match.id}
      title={match.title}
      crumbs={match.crumbs}
      showQuickPay={showQuickPay}
      hideMobileTabBar={match.hideMobileTabBar}
      mobileAppBar={
        match.mobileCrumb || match.mobileBack
          ? { crumb: match.mobileCrumb, back: match.mobileBack }
          : undefined
      }
    >
      {children}
    </PPShell>
  );
}
