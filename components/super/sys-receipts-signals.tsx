import type { SystemReceiptsAggregates } from '@/lib/view-models/super';

export interface SysReceiptsSignalsProps {
  aggregates: SystemReceiptsAggregates;
}

interface Card {
  kicker: string;
  value: string;
  detail: string;
  warn: boolean;
}

/**
 * Five-tile signal row above the system-wide receipts queue. Mirrors
 * the design source, the kicker is mono-uppercase, the value is the
 * 22px serif numeral, and the detail line is the small caption below.
 *
 * `warn` tiles bind to the amber accent (`--ajo-outstanding`); the
 * rest stay neutral on the cream surface.
 */
export function SysReceiptsSignals({ aggregates }: SysReceiptsSignalsProps) {
  const cards: ReadonlyArray<Card> = [
    {
      kicker: 'Pending',
      value: String(aggregates.pending),
      detail: `across ${aggregates.groups} groups`,
      warn: false,
    },
    {
      kicker: 'Stale · >24h',
      value: String(aggregates.stale),
      detail: aggregates.oldestLabel ? `oldest ${aggregates.oldestLabel}` : '-',
      warn: aggregates.stale > 0,
    },
    {
      kicker: 'No admin assigned',
      value: String(aggregates.noAdmin),
      detail: aggregates.noAdminPoolName ?? '-',
      warn: aggregates.noAdmin > 0,
    },
    {
      kicker: 'Confirmed · 7d',
      value: String(aggregates.confirmedLast7d),
      detail: `by ${aggregates.confirmedAdmins} admins`,
      warn: false,
    },
    {
      kicker: 'Auto-match rate',
      value: aggregates.autoMatchRateLabel ?? '-',
      detail: 'phone → member',
      warn: false,
    },
  ];

  return (
    <ul
      className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5"
      aria-label="System-wide receipts queue summary"
    >
      {cards.map((c) => (
        <li
          key={c.kicker}
          className="flex flex-col gap-0.5 rounded-[14px] border bg-d2-cream px-3.5 py-3"
          style={{
            borderColor: c.warn
              ? 'color-mix(in oklch, var(--ajo-outstanding) 35%, transparent)'
              : 'color-mix(in oklch, var(--d2-ink) 8%, transparent)',
          }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.06em]"
            style={{
              color: c.warn
                ? 'var(--ajo-outstanding-fg)'
                : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
            }}
          >
            {c.kicker}
          </span>
          <span className="font-mono text-[1.375rem] font-semibold tabular-nums">{c.value}</span>
          <span
            className="text-[11px]"
            style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
          >
            {c.detail}
          </span>
        </li>
      ))}
    </ul>
  );
}
