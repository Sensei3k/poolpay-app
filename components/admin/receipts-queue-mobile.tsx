'use client';

import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';
import type { ReceiptQueueRow } from '@/lib/view-models/admin';
import { PoolGlyph } from './pool-glyph';

export interface ReceiptsQueueMobileProps {
  rows: ReadonlyArray<ReceiptQueueRow>;
}

/**
 * Mobile-only receipts queue list. Compact one-row-per-receipt layout
 * matching the AM_Receipts artboard. Admins on mobile triage (confirm
 * or view) — full configuration stays on desktop.
 */
export function ReceiptsQueueMobile({ rows }: ReceiptsQueueMobileProps) {
  const optimistic = useReceiptsQueueStore((s) => s.optimisticallyConfirmed);
  const selectReceipt = useReceiptsQueueStore((s) => s.selectReceipt);

  return (
    <ul
      className="overflow-hidden rounded-[14px] border bg-d2-cream"
      style={{
        borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      }}
      aria-label="Receipts list"
    >
      {rows.map((row, i) => {
        const isLast = i === rows.length - 1;
        const isOptimistic = optimistic.has(row.receiptId);
        const senderLabel = row.memberName ?? 'unmatched';
        const subline = `${row.poolName} · ${row.note}`;
        // Shorten the "Xh ago · WhatsApp" submittedLabel to just the
        // relative slice for the mobile column.
        const compactWhen = row.submittedLabel.split(' · ')[0];
        return (
          <li
            key={row.receiptId}
            data-tone={row.tone}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 px-3.5 py-2.5"
            style={{
              borderBottom: isLast
                ? 'none'
                : '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              opacity: isOptimistic ? 0.55 : 1,
            }}
          >
            <PoolGlyph
              initial={row.poolInitial}
              swatch={row.poolSwatch}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 text-[13px] font-semibold">
                <span className="truncate">{senderLabel}</span>
                <span className="shrink-0 font-mono text-[11px] font-normal text-d2-ink/55">
                  · {row.amountLabel}
                </span>
              </div>
              <div className="truncate text-[11px] text-d2-ink/55">
                {subline}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[10px] text-d2-ink/50">
                {compactWhen}
              </span>
              <div className="flex gap-1">
                {/* TODO(slice-5): wire confirmReceiptAction here */}
                <button
                  type="button"
                  disabled
                  title="Confirm action wires in slice 5"
                  aria-label={`Confirm receipt from ${senderLabel} (action wires in slice 5)`}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'var(--ajo-paid)' }}
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => selectReceipt(row.receiptId)}
                  className="rounded-md px-2 py-1 text-[11px] font-medium transition-colors hover:bg-d2-ink/10"
                  style={{
                    background: 'color-mix(in oklch, var(--d2-ink) 8%, transparent)',
                  }}
                >
                  View
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
