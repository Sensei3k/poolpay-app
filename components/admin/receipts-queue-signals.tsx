import type { QueueAggregates } from '@/lib/view-models/admin';

export interface ReceiptsQueueSignalsProps {
  aggregates: QueueAggregates;
}

type SignalTone = 'pending' | 'muted' | 'out' | 'paid';

interface SignalCard {
  kicker: string;
  value: string;
  tone: SignalTone;
}

const TONE_STYLE: Record<SignalTone, { background: string; borderColor: string; valueColor?: string }> = {
  pending: {
    background: 'var(--status-pending-subtle)',
    borderColor: 'color-mix(in oklch, var(--status-pending) 30%, transparent)',
    valueColor: 'var(--status-pending-fg)',
  },
  muted: {
    background: 'color-mix(in oklch, var(--ink) 4%, var(--surface-card))',
    borderColor: 'color-mix(in oklch, var(--ink) 8%, transparent)',
  },
  out: {
    background: 'color-mix(in oklch, var(--destructive) 10%, transparent)',
    borderColor: 'color-mix(in oklch, var(--destructive) 25%, transparent)',
    valueColor: 'var(--destructive)',
  },
  paid: {
    background: 'var(--status-paid-subtle)',
    borderColor: 'color-mix(in oklch, var(--status-paid) 30%, transparent)',
    valueColor: 'var(--status-paid)',
  },
};

/**
 * Four-card signal row above the receipts queue. Renders the queue-level
 * aggregates returned by `toQueueAggregates`. Pure presentation, the
 * caller decides which numbers to feature.
 */
export function ReceiptsQueueSignals({ aggregates }: ReceiptsQueueSignalsProps) {
  const cards: ReadonlyArray<SignalCard> = [
    {
      kicker: 'Awaiting you',
      value: String(aggregates.awaiting),
      tone: aggregates.awaiting > 0 ? 'pending' : 'muted',
    },
    {
      kicker: 'Today',
      value: String(aggregates.today),
      tone: 'muted',
    },
    {
      kicker: 'Oldest',
      value: aggregates.oldestLabel ?? '-',
      tone: aggregates.oldestLabel ? 'out' : 'muted',
    },
    {
      kicker: 'Confirmed · this wk',
      value: String(aggregates.confirmedThisWeek),
      tone: 'paid',
    },
  ];

  return (
    <ul
      className="grid grid-cols-2 gap-2.5 md:grid-cols-4"
      aria-label="Receipts queue summary"
    >
      {cards.map((c) => {
        const style = TONE_STYLE[c.tone];
        return (
          <li
            key={c.kicker}
            className="flex flex-col gap-0.5 rounded-[14px] border p-3.5"
            style={{ background: style.background, borderColor: style.borderColor }}
          >
            <span className="kicker-mono text-[10px]">{c.kicker}</span>
            <span
              className="font-mono text-[1.375rem] font-semibold tabular-nums"
              style={style.valueColor ? { color: style.valueColor } : undefined}
            >
              {c.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
