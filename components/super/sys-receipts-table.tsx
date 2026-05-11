import { PoolGlyph } from '@/components/admin/pool-glyph';
import type { SystemReceiptRow } from '@/lib/view-models/super';

export interface SysReceiptsTableProps {
  rows: ReadonlyArray<SystemReceiptRow>;
}

const GRID =
  'grid grid-cols-[24px_1.4fr_1.1fr_1fr_0.8fr_0.9fr_0.9fr_auto] gap-3.5 px-4 items-center';

/**
 * Desktop system-wide receipts table. Rows use the shared `.status-row`
 * primitive in `globals.css` so the left-edge gradient picks up the
 * row's `data-tone` automatically.
 *
 * Slice 4 ships the visual surface only — the "Reassign" / "View"
 * buttons are deliberately disabled because the BE has no system-wide
 * receipts mutation endpoints yet (deviation #2). The
 * disabled-with-explanatory-title pattern matches the slice-3 receipts
 * confirm-button approach: the affordance is visible so reviewers see
 * it tested visually, but cannot be triggered.
 */
export function SysReceiptsTable({ rows }: SysReceiptsTableProps) {
  return (
    <div
      className="overflow-hidden rounded-[14px] border bg-card"
      style={{
        borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      }}
    >
      <div
        role="row"
        className={`${GRID} kicker-mono py-2.5 text-[10px]`}
        style={{
          background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)',
          borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
        }}
      >
        <span aria-hidden="true" />
        <span>Group</span>
        <span>Admin on duty</span>
        <span>From</span>
        <span>Amount</span>
        <span>Submitted</span>
        <span>Waiting</span>
        <span className="text-right">Actions</span>
      </div>
      <ul role="rowgroup" className="flex flex-col">
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const isNoAdmin = row.flag === 'no-admin';
          return (
            <li
              key={row.receiptId}
              role="row"
              data-tone={row.tone}
              className={`${GRID} status-row py-3 text-[13px]`}
              style={{
                borderBottom: isLast
                  ? 'none'
                  : '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              }}
            >
              <span aria-hidden="true">
                <input
                  type="checkbox"
                  aria-label={`Select receipt ${row.receiptId}`}
                  className="h-[15px] w-[15px] cursor-pointer accent-d2-ink"
                  readOnly
                />
              </span>
              <div className="flex min-w-0 items-center gap-2.5">
                <PoolGlyph initial={row.poolInitial} swatch={row.poolSwatch} />
                <span className="truncate font-medium">{row.poolName}</span>
              </div>
              <span
                className="truncate text-[12px]"
                style={{
                  color: isNoAdmin ? 'var(--destructive)' : 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
                  fontStyle: isNoAdmin ? 'italic' : 'normal',
                }}
              >
                {row.adminName ?? '— unassigned'}
              </span>
              <span className="truncate">{row.fromName}</span>
              <span className="font-mono font-medium">{row.amountLabel}</span>
              <span
                className="font-mono text-[12px]"
                style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
              >
                {row.submittedLabel}
              </span>
              <span
                className="font-mono text-[12px]"
                style={{
                  color: row.flag === 'stale'
                    ? 'var(--ajo-outstanding-fg)'
                    : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
                  fontWeight: row.flag === 'stale' ? 600 : 400,
                }}
              >
                {row.waitingLabel}
              </span>
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  disabled
                  title="Reassign wires when BE-9 ships system-wide reassign"
                  aria-label="Reassign receipt (disabled until BE-9)"
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                  }}
                >
                  Reassign
                </button>
                <button
                  type="button"
                  disabled
                  title="System-wide receipt detail wires in slice 5"
                  aria-label="View receipt detail (disabled until slice 5)"
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                  }}
                >
                  View
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
