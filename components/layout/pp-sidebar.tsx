import Link from 'next/link';
import {
  Bell,
  Contact,
  House,
  Layers,
  LogOut,
  MessageSquare,
  ReceiptText,
  Settings,
  ShieldCheck,
  Square,
  UsersRound,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/auth/verify-credentials';

/**
 * Identifier for the currently active sidebar entry. Pages opt-in by
 * passing the matching id to <PPShell current="…" />. The set is
 * deliberately narrow (one per route) so a typo at the page level fails
 * type-checking instead of silently leaving every entry inactive.
 */
export type SidebarItemId =
  | 'home'
  | 'pools'
  | 'activity'
  | 'people'
  | 'inbox'
  | 'settings'
  | 'receipts'
  | 'sys-groups'
  | 'sys-admins'
  | 'sys-wa';

interface NavItem {
  id: SidebarItemId;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Right-aligned numeric badge (member surfaces) */
  count?: number;
}

interface ActiveGroupContext {
  name: string;
  /** e.g. "10 of 12 cycles · weekly" */
  meta: string;
  /** Pre-formatted balance with currency symbol; e.g. "₦84,000" */
  balance: string;
  /** Total members in the active group */
  memberCount: number;
}

export interface PPSidebarProps {
  role: Role;
  current: SidebarItemId;
  /**
   * Receipts queue badge. Pass the live pending count for admins;
   * `undefined` (the default) hides the badge for members and shows a
   * neutral "0" otherwise.
   */
  pendingReceiptsCount?: number;
  user: {
    name: string;
    email: string;
    initial: string;
  };
  activeGroup?: ActiveGroupContext;
}

const PRIMARY_NAV: ReadonlyArray<NavItem> = [
  { id: 'home', label: 'Home', href: '/', icon: House },
  { id: 'pools', label: 'Pools', href: '/pools', icon: UsersRound },
  { id: 'activity', label: 'Activity', href: '/activity', icon: Waves },
  { id: 'people', label: 'People', href: '/people', icon: Contact },
  { id: 'inbox', label: 'Inbox', href: '/inbox', icon: Bell },
];

const SYSTEM_NAV: ReadonlyArray<NavItem> = [
  { id: 'sys-groups', label: 'Groups', href: '/sys/groups', icon: Layers },
  { id: 'sys-admins', label: 'Admins', href: '/sys/admins', icon: ShieldCheck },
  { id: 'sys-wa', label: 'WhatsApp links', href: '/sys/whatsapp', icon: MessageSquare },
];

const ROLE_PILL_STYLES: Record<
  Role,
  { label: string; background: string; color: string }
> = {
  member: {
    label: 'member',
    background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
    color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
  },
  admin: {
    label: 'admin',
    background: 'var(--d2-accent-soft)',
    color: 'var(--d2-accent)',
  },
  super_admin: {
    label: 'super_admin',
    background: 'oklch(0.55 0.18 265 / 14%)',
    color: 'oklch(0.55 0.18 265)',
  },
};

function NavLink({
  item,
  current,
}: {
  item: NavItem;
  current: SidebarItemId;
}) {
  const isActive = item.id === current;
  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-d2-ink text-d2-warm-bg'
          : 'text-d2-ink/75 hover:bg-d2-ink/5 hover:text-d2-ink',
      )}
    >
      <item.icon size={17} aria-hidden="true" className={cn(isActive ? 'text-d2-warm-bg' : 'text-d2-ink/60')} />
      <span className="flex-1">{item.label}</span>
      {item.count != null && (
        <span className="font-mono text-[0.6875rem] opacity-70 tabular-nums">
          {item.count}
        </span>
      )}
    </Link>
  );
}

export function PPSidebar({
  role,
  current,
  pendingReceiptsCount,
  user,
  activeGroup,
}: PPSidebarProps) {
  const showAdminSection = role === 'admin' || role === 'super_admin';
  const showSystemSection = role === 'super_admin';
  const rolePill = ROLE_PILL_STYLES[role];
  const showReceiptsBadge =
    showAdminSection && typeof pendingReceiptsCount === 'number' && pendingReceiptsCount > 0;

  return (
    <aside
      aria-label="Primary navigation"
      className="flex w-[280px] shrink-0 flex-col gap-3.5 bg-d2-warm-bg p-4"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 py-1 text-[1.0625rem] font-semibold tracking-tight">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] text-sm font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, var(--d2-accent), var(--d2-lav))',
            boxShadow: '0 4px 12px color-mix(in oklch, var(--d2-accent) 35%, transparent)',
          }}
          aria-hidden="true"
        >
          P
        </span>
        <span>PoolPay</span>
      </div>

      {/* Active-pool context card */}
      {activeGroup && (
        <div
          className="flex flex-col gap-2.5 rounded-[14px] bg-d2-cream p-3.5"
          style={{
            border: '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)',
          }}
        >
          <div
            className="flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.08em]"
            style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
          >
            <span>Active pool</span>
            <span
              className="rounded-[4px] px-1.5 py-px font-sans text-xs font-medium normal-case tracking-normal"
              style={{
                background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                color: 'var(--d2-ink)',
              }}
            >
              Switch
            </span>
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight">{activeGroup.name}</div>
            <div className="kicker-mono mt-0.5 text-[0.6875rem]">{activeGroup.meta}</div>
          </div>
          <div className="text-3xl font-semibold leading-none tracking-tighter tabular-nums">
            {activeGroup.balance}
          </div>
          <div
            className="text-xs"
            style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
          >
            {activeGroup.memberCount} {activeGroup.memberCount === 1 ? 'member' : 'members'}
          </div>
        </div>
      )}

      {/* Primary nav */}
      <nav aria-label="Primary" className="flex flex-col gap-0.5">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.id} item={item} current={current} />
        ))}
        <NavLink
          item={{ id: 'settings', label: 'Settings', href: '/account', icon: Settings }}
          current={current}
        />
      </nav>

      {/* Admin section — visible to admin + super_admin */}
      {showAdminSection && (
        <>
          <div
            className="my-1 h-px"
            style={{ background: 'color-mix(in oklch, var(--d2-ink) 8%, transparent)' }}
          />
          <div className="kicker-mono px-3 py-1 text-[0.625rem]">
            Administration
            {role === 'admin' && (
              <span className="ml-1.5 normal-case tracking-normal opacity-70">· scoped</span>
            )}
          </div>
          <nav aria-label="Administration" className="flex flex-col gap-0.5">
            <Link
              href="/admin/receipts"
              aria-current={current === 'receipts' ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors',
                current === 'receipts'
                  ? 'bg-d2-ink text-d2-warm-bg'
                  : 'text-d2-ink/75 hover:bg-d2-ink/5 hover:text-d2-ink',
              )}
            >
              <ReceiptText
                size={17}
                aria-hidden="true"
                className={current === 'receipts' ? 'text-d2-warm-bg' : 'text-d2-ink/60'}
              />
              <span className="flex-1">Receipts queue</span>
              {showReceiptsBadge && (
                <span
                  className="font-mono text-[0.6875rem] font-semibold tabular-nums"
                  style={{ color: 'var(--ajo-outstanding)' }}
                >
                  {pendingReceiptsCount}
                </span>
              )}
            </Link>
          </nav>
        </>
      )}

      {/* System section — super_admin only */}
      {showSystemSection && (
        <>
          <div
            className="my-1 h-px"
            style={{ background: 'color-mix(in oklch, var(--d2-ink) 8%, transparent)' }}
          />
          <div
            className="kicker-mono px-3 py-1 text-[0.625rem]"
            style={{ color: 'oklch(0.55 0.18 265)' }}
          >
            System · super_admin
          </div>
          <nav aria-label="System" className="flex flex-col gap-0.5">
            {SYSTEM_NAV.map((item) => (
              <NavLink key={item.id} item={item} current={current} />
            ))}
          </nav>
        </>
      )}

      {/* User foot */}
      <div
        className="mt-auto flex items-center gap-2.5 px-2 pt-2.5"
        style={{ borderTop: '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)' }}
      >
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[0.8125rem] font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, var(--d2-coral), var(--d2-lav))',
          }}
          aria-hidden="true"
        >
          {user.initial}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1.5 truncate text-[0.8125rem] font-medium">
            {user.name}
            <span
              className="rounded-[3px] px-1.5 py-px font-mono text-[0.5625rem] font-medium tracking-wider"
              style={{ background: rolePill.background, color: rolePill.color }}
            >
              {rolePill.label}
            </span>
          </span>
          <span
            className="truncate font-mono text-[0.6875rem]"
            style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
          >
            {user.email}
          </span>
        </div>
        <Link
          href="/signout"
          aria-label="Sign out"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-d2-ink/5"
          style={{ color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}
        >
          <LogOut size={15} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
