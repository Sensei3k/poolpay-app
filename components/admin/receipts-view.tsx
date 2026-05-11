'use client';

import { useReceiptsQueuePoll } from '@/app/(app)/admin/receipts/_hooks/use-receipts-queue-poll';
import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';
import type {
  QueueAggregates,
  ReceiptQueueRow,
} from '@/lib/view-models/admin';
import { ModalReceiptDetail } from './modal-receipt-detail';
import { ReceiptsQueueMobile } from './receipts-queue-mobile';
import { ReceiptsQueueSignals } from './receipts-queue-signals';
import { ReceiptsQueueTable } from './receipts-queue-table';

export interface ReceiptsViewProps {
  rows: ReadonlyArray<ReceiptQueueRow>;
  aggregates: QueueAggregates;
  /** Total groups the admin scopes to, quoted in the page sub-line. */
  groupCount: number;
}

/**
 * Receipts queue page body. Renders the four-card signal row, the
 * desktop table / mobile list, and mounts the receipt-detail modal so
 * the queue store's `selectedReceiptId` resolves into a visible dialog.
 *
 * The component is presentational, the page component owns data
 * fetching and passes already-joined rows. Slice 5 will replace the
 * mock fixture with the real RSC query.
 */
export function ReceiptsView({ rows, aggregates, groupCount }: ReceiptsViewProps) {
  const selectedReceiptId = useReceiptsQueueStore((s) => s.selectedReceiptId);
  const selectedRow = rows.find((r) => r.receiptId === selectedReceiptId);

  // Re-fetches the RSC page every 5s so newly-ingested WhatsApp
  // receipts surface without a manual reload. Pauses while the tab is
  // hidden, see the hook for the visibility-change semantics.
  useReceiptsQueuePoll();

  const groupLabel = groupCount === 1 ? '1 group' : `${groupCount} groups`;
  const subLine = `${aggregates.awaiting} awaiting review across ${groupLabel}`;
  const hasRows = rows.length > 0;

  return (
    <main
      id="main-content"
      aria-labelledby="receipts-title"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h1
          id="receipts-title"
          className="text-[1.5rem] font-semibold tracking-tight text-d2-ink"
        >
          Receipts queue
        </h1>
        <p className="text-[13px] text-d2-ink/55">{subLine}</p>
      </header>

      <ReceiptsQueueSignals aggregates={aggregates} />

      {hasRows ? (
        <>
          <div className="hidden md:block">
            <ReceiptsQueueTable rows={rows} />
          </div>
          <div className="md:hidden">
            <ReceiptsQueueMobile rows={rows} />
          </div>
        </>
      ) : (
        <div
          role="status"
          className="rounded-[14px] border p-8 text-center text-[13px] text-d2-ink/65"
          style={{
            background: 'var(--d2-cream)',
            borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          No receipts in the queue right now. New WhatsApp submissions land
          here automatically.
        </div>
      )}

      <p className="text-center font-mono text-[11px] text-d2-ink/45 md:text-left">
        triage on mobile · configure groups on desktop
      </p>

      {selectedRow && <ModalReceiptDetail row={selectedRow} />}
    </main>
  );
}
