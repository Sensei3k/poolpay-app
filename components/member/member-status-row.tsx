import { cn } from '@/lib/utils';
import type { PoolDetailMemberRow } from '@/lib/view-models/member';

export interface MemberStatusRowProps {
  row: PoolDetailMemberRow;
  /** When `true`, the row hides its bottom border — used on the last row. */
  isLast?: boolean;
}

const PILL_STYLES: Record<
  PoolDetailMemberRow['label'],
  { background: string; color: string }
> = {
  paid: {
    background: 'var(--ajo-paid-subtle)',
    color: 'var(--ajo-paid)',
  },
  pending: {
    background: 'var(--ajo-outstanding-subtle)',
    color: 'var(--ajo-outstanding)',
  },
  overdue: {
    background: 'color-mix(in oklch, var(--destructive) 14%, transparent)',
    color: 'var(--destructive)',
  },
};

/**
 * Single-row member status entry used in `/pools/:poolId`. Wraps the
 * shared `.status-row` primitive (gradient wash keyed off `data-tone`)
 * so the row's left edge picks up the design's gradient treatment.
 *
 * Borrowed across desktop and mobile — the row is full-width on mobile
 * (no per-cell padding) and grid-aligned on desktop. Avatar uses the
 * existing `.avatar` primitive from `globals.css`.
 */
export function MemberStatusRow({ row, isLast }: MemberStatusRowProps) {
  const { member, tone, label, isPayoutRecipient, amountLabel } = row;
  const initial = member.name.trim().charAt(0).toUpperCase() || '·';
  const pillStyles = PILL_STYLES[label];
  return (
    <div
      className={cn(
        'status-row grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 text-[13px] md:grid-cols-[auto_1fr_auto_auto]',
        !isLast && 'border-b',
      )}
      data-tone={tone}
      style={{
        borderColor: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
      }}
    >
      <span
        className="avatar"
        style={{
          background: 'var(--d2-coral)',
          color: 'white',
          border: 'none',
        }}
      >
        {initial}
      </span>
      <div className="min-w-0">
        <div className="truncate font-medium text-d2-ink">
          {member.name}
          {isPayoutRecipient && (
            <span
              className="ml-2 inline-block rounded px-1.5 py-px font-mono text-[10px] font-medium"
              style={{
                background: 'var(--d2-accent-soft)',
                color: 'var(--d2-accent)',
              }}
            >
              payout this cycle
            </span>
          )}
        </div>
      </div>
      <span
        className="rounded-full px-2 py-px font-mono text-[10px] tracking-wide"
        style={pillStyles}
      >
        {label}
      </span>
      <span className="hidden font-mono text-[12px] text-d2-ink/55 tabular-nums md:inline">
        {amountLabel}
      </span>
    </div>
  );
}
