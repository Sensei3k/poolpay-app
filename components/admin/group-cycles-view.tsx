import { ChevronRight } from 'lucide-react';
import type { AdminCycleRow } from '@/lib/view-models/admin';

export interface GroupCyclesViewProps {
  rows: ReadonlyArray<AdminCycleRow>;
}

const PILL_STYLE: Record<
  AdminCycleRow['pillLabel'],
  { background: string; color: string }
> = {
  closed: {
    background: 'var(--ajo-paid-subtle)',
    color: 'var(--ajo-paid)',
  },
  open: {
    background: 'var(--ajo-outstanding-subtle)',
    color: 'var(--ajo-outstanding-fg)',
  },
  future: {
    background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
    color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
  },
};

/**
 * Cycles tab body. Desktop-only — mobile shows the read-only prompt
 * because editing rotation order is a 5-column-wide affordance.
 *
 * Slice 3 ships the static markup. The "Edit rotation" entry point
 * wires to a modal in slice 5.
 */
export function GroupCyclesView({ rows }: GroupCyclesViewProps) {
  const counts = rows.reduce(
    (acc, r) => {
      acc[r.pillLabel] += 1;
      return acc;
    },
    { closed: 0, open: 0, future: 0 } as Record<
      AdminCycleRow['pillLabel'],
      number
    >,
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            Cycles · {rows.length}
          </h3>
          <p className="text-[12px] text-d2-ink/55">
            Weekly rotation · {counts.closed} closed, {counts.open} open,{' '}
            {counts.future} upcoming
          </p>
        </div>
        {/* TODO(slice-5): wire editRotationAction here */}
        <button
          type="button"
          disabled
          aria-label="Edit rotation — lands in slice 5"
          title="Rotation editing lands in slice 5"
          className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
          }}
        >
          Edit rotation
        </button>
      </div>

      <div
        className="overflow-hidden rounded-[14px] border"
        style={{
          borderColor:
            'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <div
          role="row"
          className="kicker-mono grid grid-cols-[60px_1.5fr_1fr_1fr_1fr_0.9fr_auto] items-center gap-3.5 px-4 py-2.5 text-[10px]"
          style={{
            background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)',
            borderBottom:
              '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <span>Cycle</span>
          <span>Recipient</span>
          <span>Amount</span>
          <span>Collected</span>
          <span>Window</span>
          <span>Status</span>
          <span aria-hidden="true" />
        </div>
        <ul>
          {rows.map((row, i) => {
            const isLast = i === rows.length - 1;
            const pill = PILL_STYLE[row.pillLabel];
            const collectedColor =
              row.pillLabel === 'future'
                ? 'color-mix(in oklch, var(--d2-ink) 40%, transparent)'
                : 'var(--d2-ink)';
            return (
              <li
                key={`cycle-${row.cycleNumber}`}
                data-tone={row.tone === 'muted' ? undefined : row.tone}
                className="grid grid-cols-[60px_1.5fr_1fr_1fr_1fr_0.9fr_auto] items-center gap-3.5 px-4 py-2.5 text-[13px]"
                style={{
                  borderBottom: isLast
                    ? 'none'
                    : '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                }}
              >
                <span className="font-mono text-[12px] text-d2-ink/55">
                  #{row.cycleNumber}
                </span>
                <span
                  className="truncate"
                  style={{
                    fontWeight: row.pillLabel === 'open' ? 600 : 500,
                  }}
                >
                  {row.recipientName}
                </span>
                <span className="font-mono text-[12px]">{row.amountLabel}</span>
                <span
                  className="font-mono text-[12px]"
                  style={{ color: collectedColor }}
                >
                  {row.collectedLabel}
                </span>
                <span className="font-mono text-[12px] text-d2-ink/55">
                  {row.windowLabel}
                </span>
                <span
                  className="font-mono text-[10px] font-medium"
                  style={{
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: pill.background,
                    color: pill.color,
                  }}
                >
                  {row.pillLabel}
                </span>
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  className="text-d2-ink/40"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
