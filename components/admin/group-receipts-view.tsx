'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';
import type { ReceiptQueueRow } from '@/lib/view-models/admin';
import { confirmReceiptAction } from '@/lib/actions/receipts';
import { ModalReceiptDetail } from './modal-receipt-detail';

export interface GroupReceiptsViewProps {
  /** Receipts scoped to the current group. */
  rows: ReadonlyArray<ReceiptQueueRow>;
  /**
   * Cross-group queue count for the callout. The per-group total is
   * derived from `rows.length`.
   */
  crossGroupCount: number;
}

/**
 * Receipts tab body. Surfaces the receipts scoped to *this group* with
 * an amber callout pointing at the cross-group queue. Confirm + reject
 * affordances reuse the queue store so the optimistic state matches the
 * main `/admin/receipts` table.
 */
export function GroupReceiptsView({
  rows,
  crossGroupCount,
}: GroupReceiptsViewProps) {
  const router = useRouter();
  const optimistic = useReceiptsQueueStore((s) => s.optimisticallyConfirmed);
  const selectReceipt = useReceiptsQueueStore((s) => s.selectReceipt);
  const markConfirm = useReceiptsQueueStore((s) => s.markOptimisticallyConfirmed);
  const clearConfirm = useReceiptsQueueStore(
    (s) => s.clearOptimisticallyConfirmed,
  );
  const selectedReceiptId = useReceiptsQueueStore((s) => s.selectedReceiptId);
  const selectedRow = rows.find((r) => r.receiptId === selectedReceiptId);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (id: string) => {
    markConfirm(id);
    startTransition(async () => {
      try {
        const result = await confirmReceiptAction(id);
        if (result.ok) {
          router.refresh();
          return;
        }
        clearConfirm(id);
      } catch (err) {
        clearConfirm(id);
        throw err;
      }
    });
  };

  const groupCount = rows.length;
  const hasRows = groupCount > 0;
  return (
    <div className="flex flex-col gap-3.5">
      {hasRows && (
        <div
          className="flex flex-col items-start gap-2 rounded-[10px] border px-3.5 py-2.5 sm:flex-row sm:items-center sm:gap-3"
          style={{
            background: 'var(--ajo-outstanding-subtle)',
            borderColor:
              'color-mix(in oklch, var(--ajo-outstanding) 30%, transparent)',
            color: 'var(--ajo-outstanding-fg)',
          }}
          role="status"
        >
          <Inbox size={16} aria-hidden="true" />
          <p className="flex-1 text-[13px]">
            <span className="font-semibold">
              {groupCount} receipt{groupCount === 1 ? '' : 's'} need
              {groupCount === 1 ? 's' : ''} your review in this group.
            </span>{' '}
            The sidebar count ({crossGroupCount}) is cross-group.
          </p>
          <Link
            href="/admin/receipts"
            className="rounded-md bg-d2-cream px-2.5 py-1 text-[12px] font-medium"
            style={{ color: 'var(--ajo-outstanding-fg)' }}
          >
            Open full queue →
          </Link>
        </div>
      )}
      {hasRows ? (
        <div
          className="overflow-hidden rounded-[14px] border"
          style={{
            borderColor:
              'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <div
            role="row"
            className="kicker-mono grid grid-cols-[1.3fr_1fr_1fr_1.4fr_auto] items-center gap-3.5 px-4 py-2.5 text-[10px]"
            style={{
              background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)',
              borderBottom:
                '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
            }}
          >
            <span>From · cycle</span>
            <span>Amount</span>
            <span>Submitted</span>
            <span>Note</span>
            <span className="text-right">Action</span>
          </div>
          <ul>
            {rows.map((row, i) => {
              const isLast = i === rows.length - 1;
              const isOptimistic = optimistic.has(row.receiptId);
              return (
                <li
                  key={row.receiptId}
                  data-tone="pending"
                  className="grid grid-cols-[1.3fr_1fr_1fr_1.4fr_auto] items-center gap-3.5 px-4 py-3 text-[13px]"
                  style={{
                    borderBottom: isLast
                      ? 'none'
                      : '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                    opacity: isOptimistic ? 0.55 : 1,
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {row.memberName ?? 'unmatched'}
                    </div>
                    <div className="font-mono text-[11px] text-d2-ink/55">
                      {row.cycleLabel}
                    </div>
                  </div>
                  <span className="font-mono font-medium">
                    {row.amountLabel}
                  </span>
                  <span className="font-mono text-[12px] text-d2-ink/55">
                    {row.submittedLabel}
                  </span>
                  <span className="truncate text-[12px] text-d2-ink/65">
                    {row.note}
                  </span>
                  <div className="flex gap-1 justify-self-end">
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
                        background:
                          'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
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
      ) : (
        <div
          role="status"
          className="rounded-[14px] border bg-d2-cream p-6 text-center text-[13px] text-d2-ink/65"
          style={{
            borderColor:
              'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          No receipts pending for this group.
        </div>
      )}
      {selectedRow && <ModalReceiptDetail row={selectedRow} />}
    </div>
  );
}
