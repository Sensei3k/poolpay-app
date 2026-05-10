import type { ReactNode } from 'react';
import { PPSidebar, type PPSidebarProps } from '@/components/layout/pp-sidebar';
import { PPTopbar, type PPTopbarProps } from '@/components/layout/pp-topbar';
import {
  PPMobileAppBar,
  type PPMobileAppBarProps,
} from '@/components/layout/pp-mobile-app-bar';
import { PPMobileTabBar } from '@/components/layout/pp-mobile-tab-bar';

export interface PPShellProps
  extends Pick<PPSidebarProps, 'role' | 'current' | 'pendingReceiptsCount' | 'user' | 'activeGroup'>,
    Pick<PPTopbarProps, 'title' | 'sub' | 'crumbs' | 'showQuickPay' | 'actions'> {
  children: ReactNode;
  /**
   * Optional override for the mobile top app bar. When omitted, the bar
   * uses `title`, `sub`, and a default no-back / no-crumb config so most
   * pages don't have to think about it. Pages with a back affordance
   * (e.g. /pools/:poolId) pass `mobileAppBar={{ back: { href: ..., label: ... } }}`.
   */
  mobileAppBar?: Partial<PPMobileAppBarProps>;
  /**
   * When `true`, hides the bottom mobile tab bar. Used by the pay flow
   * which is full-page on mobile and wants a clean column without the
   * tab strip stealing height.
   */
  hideMobileTabBar?: boolean;
}

/**
 * Application shell — D2 sidebar + topbar + content panel on desktop;
 * a mobile top app bar + bottom tab bar below 768px. Both layouts cascade
 * D2 tokens (--d2-warm-bg, --d2-cream, --d2-ink, --d2-accent, etc.)
 * through every descendant.
 *
 * Pages mount their content as children; page-level headings (H1, etc.)
 * live inside that content area. The desktop topbar is the *shell* chrome
 * (title / sub / crumbs / search / bell / Quick-pay) and is intentionally
 * lightweight — pages don't pass arbitrary node trees there.
 *
 * Mobile chrome (< md): the desktop sidebar is hidden and the rounded
 * cream panel is replaced by an edge-to-edge layout with a fixed top app
 * bar + bottom tab bar. Both layouts use the same `<PPShell>` so the
 * responsive matrix renders one component tree across viewports.
 */
export function PPShell({
  role,
  current,
  pendingReceiptsCount,
  user,
  activeGroup,
  title,
  sub,
  crumbs,
  showQuickPay,
  actions,
  mobileAppBar,
  hideMobileTabBar,
  children,
}: PPShellProps) {
  const mobileBarProps: PPMobileAppBarProps = {
    title: mobileAppBar?.title ?? title,
    sub: mobileAppBar?.sub ?? sub,
    crumb: mobileAppBar?.crumb,
    back: mobileAppBar?.back,
  };

  return (
    <div className="d2 flex min-h-dvh w-full flex-col bg-d2-warm-bg text-d2-ink md:flex-row">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:contents">
        <PPSidebar
          role={role}
          current={current}
          pendingReceiptsCount={pendingReceiptsCount}
          user={user}
          activeGroup={activeGroup}
        />
      </div>

      {/* Mobile top app bar — visible only <md */}
      <PPMobileAppBar {...mobileBarProps} />

      <div className="flex min-w-0 flex-1 flex-col md:p-4 md:pl-0">
        <div
          className="flex flex-1 flex-col overflow-hidden bg-d2-cream md:rounded-[18px] md:border"
          style={{
            borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          {/* Desktop topbar — hidden on mobile */}
          <div className="hidden md:contents">
            <PPTopbar
              title={title}
              sub={sub}
              crumbs={crumbs}
              showQuickPay={showQuickPay}
              actions={actions}
            />
          </div>
          {/*
            Scroll container for page content. Intentionally NOT given
            `id="main-content"` — each page renders its own <main> with
            that id, which is the correct semantic target for the
            skip-link. Keeping the id off this wrapper avoids duplicate
            ids in the DOM and lets pages stay landmark-correct.
          */}
          <div className="flex-1 overflow-auto px-4 pb-6 pt-4 md:px-7 md:pb-8 md:pt-6">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar — visible only <md */}
      {!hideMobileTabBar && (
        <PPMobileTabBar
          role={role}
          current={current}
          pendingReceiptsCount={pendingReceiptsCount}
        />
      )}
    </div>
  );
}
