import type { ReactNode } from 'react';
import { PPShell } from '@/components/layout/pp-shell';
import type { PPShellProps } from '@/components/layout/pp-shell';
import type { SidebarItemId } from '@/components/layout/pp-sidebar';

const PREVIEW_USER = {
  name: 'Ngozi Okoye',
  email: 'ngozi@chamasave.ng',
  initial: 'N',
};

const PREVIEW_ACTIVE_GROUP = {
  name: 'Lagos Rent Q2',
  meta: '10 of 12 cycles · weekly',
  balance: '₦84,000',
  memberCount: 5,
};

interface PreviewChromeProps {
  /** Active sidebar / mobile-tab id. */
  current: SidebarItemId;
  /** Topbar title. */
  title: string;
  sub?: string;
  crumbs?: string;
  showQuickPay?: boolean;
  hideMobileTabBar?: boolean;
  mobileAppBar?: PPShellProps['mobileAppBar'];
  children: ReactNode;
}

/**
 * Member preview wrapper, mounts `<PPShell>` with a fake member user
 * and a stable active-group context so the preview routes can render
 * without driving real auth + scoped DB fixtures.
 *
 * The previews are dev-only, every preview route gates on
 * `process.env.NODE_ENV !== 'production'` and 404s otherwise. This file
 * is just shared chrome; the gate lives at each route.
 */
export function MemberPreviewChrome({
  current,
  title,
  sub,
  crumbs,
  showQuickPay,
  hideMobileTabBar,
  mobileAppBar,
  children,
}: PreviewChromeProps) {
  return (
    <PPShell
      role="member"
      current={current}
      user={PREVIEW_USER}
      activeGroup={PREVIEW_ACTIVE_GROUP}
      title={title}
      sub={sub}
      crumbs={crumbs}
      showQuickPay={showQuickPay}
      hideMobileTabBar={hideMobileTabBar}
      mobileAppBar={mobileAppBar}
    >
      {children}
    </PPShell>
  );
}
