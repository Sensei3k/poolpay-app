'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';
import type { ReceiptQueueRow } from '@/lib/view-models/admin';
import { confirmReceiptAction } from '@/lib/actions/receipts';
import { PoolGlyph } from './pool-glyph';

export interface ReceiptsQueueTableProps {
  rows: ReadonlyArray<ReceiptQueueRow>;
}

type RowTone = ReceiptQueueRow['tone'];

const TONE_BG: Record<RowTone, string> = {
  paid: 'transparent',
  pending: 'transparent',
  stale: 'color-mix(in oklch, var(--destructive) 4%, transparent)',
  out: 'color-mix(in oklch, var(--destructive) 6%, transparent)',
};

/**
 * Desktop receipts queue table. Renders the joined queue rows produced
 * by `toReceiptQueueRow` with confirm + view affordances. The view
 * action surfaces the row in the detail modal via `selectReceipt`.
 *
 * The row-level confirm button is the fast-path shortcut for the most
 * common admin action; reject + flag still go through the modal where
 * the reason input lives. On confirm, the row enters the optimistic
 * "in-flight" state via `markOptimisticallyConfirmed` and clears on
 * server response (success or failure). On success we revalidate via
 * `router.refresh` so the polling cadence doesn't leave a confirmed row
 * sitting in the queue for up to five seconds.
 */
export function ReceiptsQueueTable({ rows }: ReceiptsQueueTableProps) {
  const router = useRouter();
  const optimistic = useReceiptsQueueStore((s) => s.optimisticallyConfirmed);
  const selectReceipt = useReceiptsQueueStore((s) => s.selectReceipt);
  const markConfirm = useReceiptsQueueStore((s) => s.markOptimisticallyConfirmed);
  const clearConfirm = useReceiptsQueueStore(
    (s) => s.clearOptimisticallyConfirmed,
  );
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (id: string) => {
    markConfirm(id);
    startTransition(async () => {
      try {
        const result = await confirmReceiptAction(id);
        if (result.ok) {
          router.refresh();
          // Safety clear: router.refresh() re-fetches the RSC payload and
          // the next render normally drops the row entirely (status moves
          // off the queue filter). If the BE read momentarily lags the
          // write the row could otherwise stay dimmed indefinitely. The
          // 3s window is well past any plausible same-region BE latency.
          window.setTimeout(() => clearConfirm(id), 3000);
          return;
        }
        clearConfirm(id);
      } catch (err) {
        clearConfirm(id);
        throw err;
      }
    });
  };

  return (
    <div
      className="overflow-hidden rounded-[14px] border"
      style={{
        borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      }}
    >
      <div
        role="row"
        className="kicker-mono hidden grid-cols-[24px_1.4fr_1.2fr_0.8fr_1fr_1.1fr_auto] items-center gap-3.5 px-4 py-2.5 text-[10px] md:grid"
        style={{
          background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)',
          borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <span aria-hidden="true" />
        <span>Group · cycle</span>
        <span>From</span>
        <span>Amount</span>
        <span>Submitted</span>
        <span>Note</span>
        <span className="text-right">Action</span>
      </div>
      <ul role="rowgroup" className="flex flex-col">
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const isOptimistic = optimistic.has(row.receiptId);
          return (
            <li
              key={row.receiptId}
              role="row"
              data-tone={row.tone}
              className="grid grid-cols-[1fr_auto] items-center gap-3.5 px-4 py-3 text-[13px] md:grid-cols-[24px_1.4fr_1.2fr_0.8fr_1fr_1.1fr_auto]"
              style={{
                background: TONE_BG[row.tone],
                borderBottom: isLast
                  ? 'none'
                  : '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                opacity: isOptimistic ? 0.55 : 1,
              }}
            >
              <span aria-hidden="true" className="hidden md:inline-flex">
                <input
                  type="checkbox"
                  aria-label={`Select receipt ${row.receiptId}`}
                  className="h-[15px] w-[15px] cursor-pointer accent-d2-ink"
                  readOnly
                />
              </span>
              <div className="flex min-w-0 items-center gap-2.5">
                <PoolGlyph initial={row.poolInitial} swatch={row.poolSwatch} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{row.poolName}</div>
                  <div className="font-mono text-[11px] text-d2-ink/55">
                    {row.cycleLabel}
                  </div>
                </div>
              </div>
              <div className="hidden min-w-0 md:block">
                <div className="truncate">{row.memberName ?? 'unmatched'}</div>
                <div className="font-mono text-[11px] text-d2-ink/55">
                  {row.memberPhoneMasked}
                </div>
              </div>
              <span className="hidden font-mono font-medium md:inline">
                {row.amountLabel}
              </span>
              <span className="hidden font-mono text-[12px] text-d2-ink/55 md:inline">
                {row.submittedLabel}
              </span>
              <span className="hidden truncate text-[12px] text-d2-ink/65 md:inline">
                {row.note}
              </span>
              <div className="flex items-center gap-1 justify-self-end">
                <button
                  type="button"
                  onClick={() => handleConfirm(row.receiptId)}
                  disabled={isPending || isOptimistic}
                  aria-label={`Confirm receipt from ${row.memberName ?? 'unmatched sender'}`}
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'var(--ajo-paid)' }}
                >
                  {isOptimistic ? 'Confirming…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => selectReceipt(row.receiptId)}
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-d2-ink/10"
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
