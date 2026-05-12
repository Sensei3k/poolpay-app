import type { ReactNode } from 'react';
import { Bell, Plus, Search } from 'lucide-react';

export interface PPTopbarProps {
  /** Page title, typically the section heading (e.g. "Home", "Receipts queue"). */
  title: string;
  /** Optional sub-line under the title. Kept short, the design caps at one line. */
  sub?: string;
  /**
   * Optional breadcrumb path rendered above the title in mono. The
   * design uses this for nested admin/super-admin surfaces; member
   * surfaces leave it undefined.
   */
  crumbs?: string;
  /** Show the "Quick pay" CTA on the right (member home + pool detail). */
  showQuickPay?: boolean;
  /**
   * Slot for page-specific topbar actions (e.g. an "Add admin" button on
   * /sys/admins). Renders between the bell and the optional Quick-pay CTA.
   */
  actions?: ReactNode;
}

/**
 * Shell topbar, title / sub / crumbs on the left, search + bell + actions
 * + optional Quick-pay CTA on the right. Lives inside the rounded
 * main-inner panel from <PPShell>.
 *
 * Search and Bell are presentational placeholders, both remain disabled
 * affordances until the global search palette and notification dropdown
 * are wired as a post-redesign follow-up (TODO(post-redesign)).
 */
export function PPTopbar({ title, sub, crumbs, showQuickPay = false, actions }: PPTopbarProps) {
  return (
    <div
      className="hidden h-14 shrink-0 items-center gap-2 px-5 md:flex"
      style={{ borderBottom: '1px solid color-mix(in oklch, var(--ink) 7%, transparent)' }}
    >
      <div className="min-w-0">
        {crumbs && (
          <div
            className="mb-0.5 font-mono text-[0.6875rem] tracking-[0.03em]"
            style={{ color: 'color-mix(in oklch, var(--ink) 55%, transparent)' }}
          >
            {crumbs}
          </div>
        )}
        <div className="text-[0.9375rem] font-semibold tracking-tight">{title}</div>
        {sub && (
          <div
            className="text-xs"
            style={{ color: 'color-mix(in oklch, var(--ink) 55%, transparent)' }}
          >
            {sub}
          </div>
        )}
      </div>
      <div className="flex-1" />
      {/* TODO(post-redesign): wire the global search palette. */}
      <button
        type="button"
        disabled
        aria-label="Search (coming soon)"
        title="Search (coming soon)"
        className="hidden min-w-[200px] items-center gap-2 rounded-full px-3 py-1.5 text-[0.8125rem] sm:inline-flex"
        style={{
          background: 'color-mix(in oklch, var(--ink) 4%, transparent)',
          color: 'color-mix(in oklch, var(--ink) 55%, transparent)',
        }}
      >
        <Search size={14} aria-hidden="true" />
        Search
      </button>
      {/* TODO(post-redesign): wire the notifications dropdown. */}
      <button
        type="button"
        disabled
        aria-label="Notifications (coming soon)"
        title="Notifications (coming soon)"
        className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{ color: 'color-mix(in oklch, var(--ink) 65%, transparent)' }}
      >
        <Bell size={17} aria-hidden="true" />
      </button>
      {actions}
      {showQuickPay && (
        // TODO(post-redesign): wire the quick-pay flow.
        <button
          type="button"
          disabled
          aria-label="Quick pay (coming soon)"
          title="Quick pay (coming soon)"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[0.8125rem] font-semibold text-surface-page disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={14} aria-hidden="true" />
          Quick pay
        </button>
      )}
    </div>
  );
}
