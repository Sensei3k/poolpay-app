import type { ReactNode } from 'react';
import { PPShell } from '@/components/layout/pp-shell';
import type { PPShellProps } from '@/components/layout/pp-shell';
import type { SidebarItemId } from '@/components/layout/pp-sidebar';

const PREVIEW_USER = {
  name: 'Ada Okonkwo',
  email: 'ada@poolpay.io',
  initial: 'A',
};

interface SuperPreviewChromeProps {
  current: SidebarItemId;
  title: string;
  sub?: string;
  crumbs?: string;
  hideMobileTabBar?: boolean;
  mobileAppBar?: PPShellProps['mobileAppBar'];
  children: ReactNode;
}

/**
 * Super-admin preview wrapper — mounts `<PPShell>` with a fake
 * super_admin session so the slice-4 screenshot matrix can capture
 * the `/sys/*` surfaces without driving real auth.
 *
 * Production gate lives at each route file
 * (`process.env.NODE_ENV !== 'production'` → `notFound()`); this file
 * ships chrome only.
 */
export function SuperPreviewChrome({
  current,
  title,
  sub,
  crumbs = 'System · super_admin',
  hideMobileTabBar,
  mobileAppBar,
  children,
}: SuperPreviewChromeProps) {
  return (
    <PPShell
      role="super_admin"
      current={current}
      user={PREVIEW_USER}
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
