import { PoolGlyph } from '@/components/admin/pool-glyph';
import type { SystemReceiptRow } from '@/lib/view-models/super';

export interface SysReceiptsCardsProps {
  rows: ReadonlyArray<SystemReceiptRow>;
}

/**
 * Tablet card-collapse fallback for the system-wide receipts table.
 *
 * Slice-4 deviation #5: the mobile redirect lives at <768px so the
 * tablet band is 768px..1023px. The full table would compress past
 * usability under 1024px, so this card layout renders instead.
 * Driven by Tailwind responsive classes on the parent page: the
 * table is `hidden lg:block`; this list is `lg:hidden md:block`.
 */
export function SysReceiptsCards({ rows }: SysReceiptsCardsProps) {
  return (
    <ul className="flex flex-col gap-2.5" aria-label="System receipts list">
      {rows.map((row) => {
        const isNoAdmin = row.flag === 'no-admin';
        return (
          <li
            key={row.receiptId}
            data-tone={row.tone}
            className="status-row flex flex-col gap-2 rounded-[14px] border bg-d2-cream p-4"
            style={{
              borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <PoolGlyph initial={row.poolInitial} swatch={row.poolSwatch} size="sm" />
                <div className="min-w-0">
                  <div className="truncate font-medium">{row.poolName}</div>
                  <div className="font-mono text-[11px] text-d2-ink/55">{row.submittedLabel}</div>
                </div>
              </div>
              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">{row.amountLabel}</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
              <dt className="font-mono uppercase tracking-wider text-d2-ink/55">From</dt>
              <dd className="text-right">{row.fromName}</dd>
              <dt className="font-mono uppercase tracking-wider text-d2-ink/55">Admin</dt>
              <dd
                className="text-right"
                style={{
                  color: isNoAdmin ? 'var(--destructive)' : undefined,
                  fontStyle: isNoAdmin ? 'italic' : 'normal',
                }}
              >
                {row.adminName ?? 'unassigned'}
              </dd>
              <dt className="font-mono uppercase tracking-wider text-d2-ink/55">Waiting</dt>
              <dd
                className="text-right font-mono"
                style={{
                  color: row.flag === 'stale' ? 'var(--ajo-outstanding-fg)' : undefined,
                  fontWeight: row.flag === 'stale' ? 600 : 400,
                }}
              >
                {row.waitingLabel}
              </dd>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
