import Link from 'next/link';
import type { AdminGroupTabId } from '@/lib/view-models/admin';

export interface GroupTabsNavProps {
  /** Pool id; combined with the tab to build `?tab=` hrefs. */
  poolId: string;
  /** Active tab, `null` is treated as "overview". */
  active: AdminGroupTabId;
  /** Per-tab badge counts. Pass `null` to omit a tab's badge. */
  counts: {
    members?: number | null;
    cycles?: number | null;
    payments?: number | null;
    receipts?: number | null;
  };
}

interface TabConfig {
  id: AdminGroupTabId;
  label: string;
  countKey?: keyof GroupTabsNavProps['counts'];
  /** When true, the badge takes the amber treatment (pending work). */
  hot?: boolean;
}

const TABS: ReadonlyArray<TabConfig> = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members', countKey: 'members' },
  { id: 'cycles', label: 'Cycles', countKey: 'cycles' },
  { id: 'payments', label: 'Payments', countKey: 'payments' },
  { id: 'receipts', label: 'Receipts', countKey: 'receipts', hot: true },
  { id: 'settings', label: 'Settings' },
];

/**
 * Tab nav strip for the admin group page. Uses `?tab=…` search-param
 * routing so the page is one server component that picks the active
 * panel from the URL, back/forward navigation, browser refresh, and
 * deep links all stay correct.
 *
 * On mobile the strip becomes horizontally scrollable rather than
 * stacking, which preserves the design.
 */
export function GroupTabsNav({ poolId, active, counts }: GroupTabsNavProps) {
  return (
    <nav
      aria-label="Group sections"
      className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
      style={{
        borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      }}
    >
      <ul className="inline-flex min-w-full gap-0.5 whitespace-nowrap">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const count = tab.countKey ? counts[tab.countKey] : null;
          const showBadge = count != null && count > 0;
          const href =
            tab.id === 'overview'
              ? `/admin/groups/${poolId}`
              : `/admin/groups/${poolId}?tab=${tab.id}`;
          return (
            <li key={tab.id}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] transition-colors"
                style={{
                  color: isActive
                    ? 'var(--d2-ink)'
                    : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
                  fontWeight: isActive ? 600 : 500,
                  borderBottom: isActive
                    ? '2px solid var(--d2-ink)'
                    : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {tab.label}
                {showBadge && (
                  <span
                    className="rounded font-mono text-[10px] font-medium"
                    style={{
                      padding: '1px 6px',
                      background: tab.hot
                        ? 'var(--ajo-outstanding-subtle)'
                        : 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                      color: tab.hot
                        ? 'var(--ajo-outstanding-fg)'
                        : 'color-mix(in oklch, var(--d2-ink) 65%, transparent)',
                    }}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
