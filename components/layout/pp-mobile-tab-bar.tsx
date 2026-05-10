import Link from 'next/link';
import {
  Bell,
  CircleUserRound,
  House,
  ReceiptText,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/lib/auth/verify-credentials';
import type { SidebarItemId } from '@/components/layout/pp-sidebar';
import { cn } from '@/lib/utils';

interface MobileTab {
  id: SidebarItemId;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional notification badge — number shown at the top-right of the icon. */
  badge?: number;
}

const MEMBER_TABS: ReadonlyArray<MobileTab> = [
  { id: 'home', label: 'Home', href: '/home', icon: House },
  { id: 'pools', label: 'Pools', href: '/pools', icon: UsersRound },
  { id: 'inbox', label: 'Inbox', href: '/inbox', icon: Bell },
  { id: 'settings', label: 'Me', href: '/profile', icon: CircleUserRound },
];

const ADMIN_TABS: ReadonlyArray<MobileTab> = [
  { id: 'receipts', label: 'Queue', href: '/admin/receipts', icon: ReceiptText },
  { id: 'pools', label: 'Groups', href: '/pools', icon: UsersRound },
  { id: 'inbox', label: 'Inbox', href: '/inbox', icon: Bell },
  { id: 'settings', label: 'Me', href: '/profile', icon: CircleUserRound },
];

export interface PPMobileTabBarProps {
  role: Role;
  current: SidebarItemId;
  /**
   * Optional pending count for the admin "Queue" tab. Members never see
   * this badge because the receipts tab is admin-only.
   */
  pendingReceiptsCount?: number;
  /** Optional unread count for the inbox tab. */
  inboxBadge?: number;
}

/**
 * Bottom tab bar — mobile-only chrome (visible <768px). Mirrors the
 * design's `MWTabBar` from `member-mobile.jsx` and the admin variant from
 * `admin-mobile.jsx`. Sits inside `<PPShell>` so token cascade and the
 * skip-link target stay intact.
 *
 * Uses the existing `SidebarItemId` so a typo at the page level fails
 * type-checking against the same identifier set used by the sidebar.
 */
export function PPMobileTabBar({
  role,
  current,
  pendingReceiptsCount,
  inboxBadge,
}: PPMobileTabBarProps) {
  const tabs = role === 'member' ? MEMBER_TABS : ADMIN_TABS;
  const showReceiptsBadge =
    typeof pendingReceiptsCount === 'number' && pendingReceiptsCount > 0;
  const showInboxBadge = typeof inboxBadge === 'number' && inboxBadge > 0;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="flex shrink-0 items-stretch border-t bg-d2-warm-bg px-0 py-1.5 md:hidden"
      style={{ borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === current;
        const badge =
          tab.id === 'receipts' && showReceiptsBadge
            ? pendingReceiptsCount
            : tab.id === 'inbox' && showInboxBadge
              ? inboxBadge
              : undefined;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium',
              isActive ? 'text-d2-ink' : 'text-d2-ink/55',
            )}
          >
            <tab.icon
              size={19}
              aria-hidden="true"
              strokeWidth={isActive ? 2.1 : 1.75}
            />
            <span className={cn('text-[10px]', isActive && 'font-semibold')}>
              {tab.label}
            </span>
            {badge !== undefined && (
              <span
                className="absolute right-[calc(50%-18px)] top-0 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 font-mono text-[9px] font-semibold text-white"
                style={{ background: 'var(--destructive)' }}
                aria-label={`${badge} unread`}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
