import Link from 'next/link';
import { Check } from 'lucide-react';

export interface AdminEmptyPillProps {
  /** Total number of groups the admin scopes to. */
  groupCount: number;
}

/**
 * "Receipts queue is empty" pill shown above member-home content when an
 * admin lands on `/home` instead of `/admin/receipts` (handoff section
 * 5.3). The pill is informational only — the user can still reach the
 * full queue via the sidebar Receipts link or the in-pill button.
 */
export function AdminEmptyPill({ groupCount }: AdminEmptyPillProps) {
  // An admin landing on /home with zero scoped groups is rare (a brand-new
  // grant that hasn't been linked to a pool yet, or a freshly-revoked
  // admin whose session hasn't refreshed), but it's reachable; the
  // "0 groups" phrasing reads awkwardly so we swap to a generic message.
  const descriptor =
    groupCount === 0
      ? 'in any of the groups you administer'
      : `across your ${groupCount === 1 ? '1 group' : `${groupCount} groups`}`;
  return (
    <div
      role="status"
      aria-label="Receipts queue is empty"
      className="mb-4 flex items-center gap-3 rounded-[14px] p-3"
      style={{
        background: 'var(--ajo-paid-subtle)',
        border: '1px solid color-mix(in oklch, var(--ajo-paid) 30%, transparent)',
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: 'var(--ajo-paid)' }}
      >
        <Check size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="text-[14px] font-semibold"
          style={{ color: 'var(--ajo-paid)' }}
        >
          Receipts queue is empty
        </div>
        <div className="text-[12px] text-d2-ink/60">
          No pending submissions {descriptor}. You{"'"}re seeing this as a
          member now. Receipts link stays available in the sidebar.
        </div>
      </div>
      <Link
        href="/admin/receipts"
        className="hidden shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-d2-ink/5 sm:inline-flex"
        style={{
          borderColor: 'color-mix(in oklch, var(--ajo-paid) 40%, transparent)',
          color: 'var(--ajo-paid)',
        }}
      >
        Confirmed history →
      </Link>
    </div>
  );
}
