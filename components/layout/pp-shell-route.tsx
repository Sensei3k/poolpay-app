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
}

/**
 * Route → sidebar / topbar context map. Order matters — the first prefix
 * match wins, so the more specific routes (e.g. `/admin/receipts`) must
 * appear before their parents (`/admin`). Slices 2-6 will override these
 * defaults at the page level when richer copy/sub/actions are needed.
 */
const ROUTE_MAP: ReadonlyArray<{ prefix: string; match: RouteMatch }> = [
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
  { prefix: "/pools", match: { id: "pools", title: "Pools", showQuickPay: true } },
  { prefix: "/activity", match: { id: "activity", title: "Activity" } },
  { prefix: "/people", match: { id: "people", title: "People" } },
  { prefix: "/inbox", match: { id: "inbox", title: "Inbox" } },
  { prefix: "/account", match: { id: "settings", title: "Settings" } },
  { prefix: "/home", match: { id: "home", title: "Home", showQuickPay: true } },
];

const DEFAULT_MATCH: RouteMatch = { id: "home", title: "Home", showQuickPay: true };

function matchRoute(pathname: string | null): RouteMatch {
  if (!pathname) return DEFAULT_MATCH;
  for (const { prefix, match } of ROUTE_MAP) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return match;
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

  return (
    <PPShell
      role={role}
      user={user}
      pendingReceiptsCount={pendingReceiptsCount}
      activeGroup={activeGroup}
      current={match.id}
      title={match.title}
      crumbs={match.crumbs}
      showQuickPay={match.showQuickPay}
    >
      {children}
    </PPShell>
  );
}
