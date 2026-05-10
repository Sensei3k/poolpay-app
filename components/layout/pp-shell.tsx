import type { ReactNode } from 'react';
import { PPSidebar, type PPSidebarProps } from '@/components/layout/pp-sidebar';
import { PPTopbar, type PPTopbarProps } from '@/components/layout/pp-topbar';

export interface PPShellProps
  extends Pick<PPSidebarProps, 'role' | 'current' | 'pendingReceiptsCount' | 'user' | 'activeGroup'>,
    Pick<PPTopbarProps, 'title' | 'sub' | 'crumbs' | 'showQuickPay' | 'actions'> {
  children: ReactNode;
}

/**
 * Application shell — D2 sidebar + topbar + content panel.
 *
 * Composes <PPSidebar> and <PPTopbar> inside the d2 visual context so D2
 * tokens (--d2-warm-bg, --d2-cream, --d2-ink, --d2-accent, etc.) cascade
 * through every descendant. The shell takes the full viewport height and
 * delegates content scrolling to the inner panel.
 *
 * Pages mount their content as children; page-level headings (H1, etc.)
 * live inside that content area, beside the page-specific UI. The topbar
 * is the *shell* chrome (title / sub / crumbs / search / bell / Quick-pay)
 * and is intentionally lightweight — pages don't pass arbitrary node
 * trees here.
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
  children,
}: PPShellProps) {
  return (
    <div className="d2 flex min-h-dvh w-full flex-row bg-d2-warm-bg text-d2-ink">
      <PPSidebar
        role={role}
        current={current}
        pendingReceiptsCount={pendingReceiptsCount}
        user={user}
        activeGroup={activeGroup}
      />
      <div className="flex min-w-0 flex-1 flex-col p-4 pl-0">
        <div
          className="flex flex-1 flex-col overflow-hidden rounded-[18px] bg-d2-cream"
          style={{ border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)' }}
        >
          <PPTopbar
            title={title}
            sub={sub}
            crumbs={crumbs}
            showQuickPay={showQuickPay}
            actions={actions}
          />
          {/*
            Scroll container for page content. Intentionally NOT given
            `id="main-content"` — each page renders its own <main> with
            that id, which is the correct semantic target for the
            skip-link. Keeping the id off this wrapper avoids duplicate
            ids in the DOM and lets pages stay landmark-correct.
          */}
          <div className="flex-1 overflow-auto px-7 pb-8 pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
