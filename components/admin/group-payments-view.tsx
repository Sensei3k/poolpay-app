import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { AdminPaymentRow } from '@/lib/view-models/admin';

export interface GroupPaymentsViewProps {
  rows: ReadonlyArray<AdminPaymentRow>;
}

const PILL_STYLE: Record<
  AdminPaymentRow['status'],
  { background: string; color: string; label: string }
> = {
  confirmed: {
    background: 'var(--status-paid-subtle)',
    color: 'var(--status-paid)',
    label: 'confirmed',
  },
  pending: {
    background: 'var(--status-pending-subtle)',
    color: 'var(--status-pending-fg)',
    label: 'pending',
  },
  overdue: {
    background: 'color-mix(in oklch, var(--destructive) 12%, transparent)',
    color: 'var(--destructive)',
    label: 'overdue',
  },
  payout: {
    background: 'var(--status-paid-subtle)',
    color: 'var(--status-paid)',
    label: 'payout',
  },
};

/**
 * Payments tab, ledger of contributions (incoming) + payouts
 * (outgoing) for the group. Read-only on every viewport; Export CSV and
 * the filter dropdown land in slice 5.
 */
export function GroupPaymentsView({ rows }: GroupPaymentsViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            Payments · {rows.length}
          </h3>
          <p className="text-[12px] text-ink/55">
            Ledger of contributions + payouts
          </p>
        </div>
        <div className="flex gap-2">
          {/* TODO(slice-5): wire paymentFilterAction here */}
          <button
            type="button"
            disabled
            aria-label="Filter (coming soon)"
            title="Coming soon"
            className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              background:
                'color-mix(in oklch, var(--ink) 6%, transparent)',
            }}
          >
            Filter ▾
          </button>
          {/* TODO(slice-5): wire exportPaymentsAction here */}
          <button
            type="button"
            disabled
            aria-label="Export CSV (coming soon)"
            title="Coming soon"
            className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              background:
                'color-mix(in oklch, var(--ink) 6%, transparent)',
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-[14px] border"
        style={{
          borderColor:
            'color-mix(in oklch, var(--ink) 7%, transparent)',
        }}
      >
        <div
          role="row"
          className="kicker-mono hidden grid-cols-[24px_1.4fr_1fr_1.1fr_0.9fr_0.8fr] items-center gap-3.5 px-4 py-2.5 text-[10px] md:grid"
          style={{
            background: 'color-mix(in oklch, var(--ink) 3%, transparent)',
            borderBottom:
              '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <span aria-hidden="true" />
          <span>Who · cycle</span>
          <span>Amount</span>
          <span>When</span>
          <span>Confirmed by</span>
          <span>Status</span>
        </div>
        <ul>
          {rows.map((row, i) => {
            const isLast = i === rows.length - 1;
            const pill = PILL_STYLE[row.status];
            const Icon = row.isPayout ? ArrowUpRight : ArrowDownLeft;
            const amountColor = row.isPayout
              ? 'var(--accent-primary)'
              : 'var(--ink)';
            const amountPrefix = row.isPayout ? '−' : '+';
            return (
              <li
                key={row.id}
                data-tone={row.tone}
                className="grid grid-cols-[24px_1fr_auto] items-center gap-3 px-4 py-3 text-[13px] md:grid-cols-[24px_1.4fr_1fr_1.1fr_0.9fr_0.8fr] md:gap-3.5"
                style={{
                  borderBottom: isLast
                    ? 'none'
                    : '1px solid color-mix(in oklch, var(--ink) 6%, transparent)',
                }}
              >
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md"
                  style={{
                    background: row.isPayout
                      ? 'var(--accent-violet-subtle)'
                      : 'color-mix(in oklch, var(--ink) 6%, transparent)',
                    color: row.isPayout
                      ? 'var(--accent-violet)'
                      : 'color-mix(in oklch, var(--ink) 60%, transparent)',
                  }}
                >
                  <Icon size={13} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium">{row.whoName}</div>
                  <div className="font-mono text-[11px] text-ink/55">
                    {row.cycleLabel}
                  </div>
                </div>
                <span
                  className="hidden font-mono text-[13px] font-medium md:inline"
                  style={{ color: amountColor }}
                >
                  {amountPrefix} {row.amountLabel}
                </span>
                <span className="hidden font-mono text-[12px] text-ink/55 md:inline">
                  {row.whenLabel}
                </span>
                <span className="hidden font-mono text-[12px] text-ink/55 md:inline">
                  {row.confirmedByLabel}
                </span>
                <span
                  className="justify-self-end font-mono text-[10px] font-medium md:justify-self-start"
                  style={{
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: pill.background,
                    color: pill.color,
                  }}
                >
                  {pill.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
