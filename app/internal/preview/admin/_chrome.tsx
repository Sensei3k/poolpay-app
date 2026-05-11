import type { ReactNode } from 'react';
import { PPShell } from '@/components/layout/pp-shell';
import type { PPShellProps } from '@/components/layout/pp-shell';
import type { SidebarItemId } from '@/components/layout/pp-sidebar';
import type { Role } from '@/lib/auth/verify-credentials';

const PREVIEW_USER = {
  name: 'Adaeze O.',
  email: 'adaeze@chamasave.ng',
  initial: 'A',
};

const PREVIEW_ACTIVE_GROUP = {
  name: 'Lagos Rent Q2',
  meta: '10 of 12 cycles · weekly',
  balance: '₦84,000',
  memberCount: 5,
};

interface AdminPreviewChromeProps {
  current: SidebarItemId;
  title: string;
  sub?: string;
  crumbs?: string;
  pendingReceiptsCount?: number;
  role?: Role;
  hideMobileTabBar?: boolean;
  mobileAppBar?: PPShellProps['mobileAppBar'];
  children: ReactNode;
}

/**
 * Admin preview wrapper — mounts `<PPShell>` with a fake admin user and
 * a stable active-group context so the slice-3 screenshot matrix can
 * capture admin surfaces without driving real auth + scoped DB
 * fixtures through every variant.
 *
 * Like the member chrome, the production gate lives at each route file
 * (`process.env.NODE_ENV !== 'production'` → `notFound()`). This file is
 * shared chrome only and ships no gating itself.
 */
export function AdminPreviewChrome({
  current,
  title,
  sub,
  crumbs = 'Administration',
  pendingReceiptsCount = 3,
  role = 'admin',
  hideMobileTabBar,
  mobileAppBar,
  children,
}: AdminPreviewChromeProps) {
  return (
    <PPShell
      role={role}
      current={current}
      user={PREVIEW_USER}
      activeGroup={PREVIEW_ACTIVE_GROUP}
      pendingReceiptsCount={pendingReceiptsCount}
      title={title}
      sub={sub}
      crumbs={crumbs}
      hideMobileTabBar={hideMobileTabBar}
      mobileAppBar={mobileAppBar}
    >
      {children}
    </PPShell>
  );
}
