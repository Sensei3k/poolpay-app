'use client';

import { useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';
import type { ReceiptQueueRow } from '@/lib/view-models/admin';

const SLICE_5_TITLE = 'Confirm action wires in slice 5';
const SLICE_5_REJECT_TITLE = 'Reject action wires in slice 5';
const SLICE_5_FLAG_TITLE = 'Flag action wires in slice 5';

export interface ModalReceiptDetailProps {
  /**
   * The currently selected row, surfaced from the queue. The store holds
   * only the id so the page can look up the canonical row alongside the
   * full receipts list; we accept the resolved view-model here so the
   * modal stays presentational.
   */
  row: ReceiptQueueRow;
  /**
   * Pre-formatted "expected" amount, e.g. "₦ 12,000". Falls back to the
   * row's `amountLabel` when omitted.
   */
  expectedAmountLabel?: string;
  /** Optional bank-trace string for the metadata block. */
  bankTraceLabel?: string;
  /** Pre-formatted "matched on phone …" affordance. */
  senderLabel?: string;
}

/**
 * Receipt-detail modal layout. Slice 3 ships the static markup only —
 * the confirm / reject / flag handlers land in slice 5 alongside the
 * WhatsApp ingestion backend.
 *
 * The modal reads its open state from the receipts-queue store. Pages
 * mount this component once below the queue table and let the store
 * drive visibility. Clicking the backdrop or close button clears the
 * store's selected id and dismisses the modal.
 */
export function ModalReceiptDetail({
  row,
  expectedAmountLabel,
  bankTraceLabel,
  senderLabel,
}: ModalReceiptDetailProps) {
  const close = () => useReceiptsQueueStore.getState().selectReceipt(null);

  // The modal is mounted only while a receipt is selected (the parent
  // page reads `selectedReceiptId` from the store and conditionally
  // renders this component), so the listener is attached only when the
  // modal is actually open. Closing the modal unmounts the component and
  // detaches the listener via cleanup.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        useReceiptsQueueStore.getState().selectReceipt(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const memberLine =
    row.memberName != null
      ? `${row.memberName} · ${row.memberPhoneMasked}`
      : `unmatched · ${row.memberPhoneMasked}`;

  const matchedNote =
    row.memberName != null ? senderLabel ?? 'matched 100%' : 'not matched';

  const metadataRows: ReadonlyArray<readonly [string, string, string | null]> = [
    ['Sender', memberLine, matchedNote],
    ['Cycle', `${row.poolName} · ${row.cycleLabel}`, null],
    ['Expected', expectedAmountLabel ?? row.amountLabel, null],
    ['Received', row.amountLabel, 'amount matches'],
    ['Bank trace', bankTraceLabel ?? '—', null],
    ['Submitted', row.submittedLabel, null],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop is decorative; dialog is dismissible via the close button (click/Enter) and the document-level Escape handler attached above */}
      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 backdrop-blur-[3px]"
        style={{
          background: 'color-mix(in oklch, var(--d2-ink) 35%, transparent)',
        }}
      />
      <div
        className="relative z-10 flex w-full max-w-[620px] flex-col overflow-hidden rounded-[18px] bg-d2-cream"
        style={{
          boxShadow:
            '0 30px 80px -20px color-mix(in oklch, var(--d2-ink) 35%, transparent), 0 4px 12px color-mix(in oklch, var(--d2-ink) 8%, transparent)',
        }}
      >
        <div
          className="flex items-start gap-3 px-6 py-5"
          style={{
            borderBottom:
              '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="kicker-mono text-[10px]">
              Receipt · #{row.receiptId}
            </div>
            <h3
              id="receipt-modal-title"
              className="mt-1 text-[17px] font-semibold tracking-tight"
            >
              {row.memberName ?? 'unmatched sender'} → {row.poolName} ·{' '}
              {row.cycleLabel}
            </h3>
            <p className="mt-1 text-[12.5px] leading-snug text-d2-ink/60">
              {row.submittedLabel} · matched on phone {row.memberPhoneMasked}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close receipt details"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-d2-ink/60 transition-colors hover:bg-d2-ink/5"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-[180px_1fr]">
          <div
            aria-label="Receipt screenshot placeholder"
            className="flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-[10px] text-d2-ink/50"
            style={{
              background:
                'repeating-linear-gradient(135deg, color-mix(in oklch, var(--d2-ink) 5%, transparent) 0 6px, transparent 6px 12px), color-mix(in oklch, var(--d2-ink) 4%, transparent)',
              border:
                '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)',
            }}
          >
            <ImageIcon size={20} aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              screenshot
            </span>
            <span className="font-mono text-[9px] tracking-wider">820 × 1100</span>
          </div>
          <dl className="flex flex-col gap-2.5">
            {metadataRows.map(([k, v, note]) => (
              <div
                key={k}
                className="grid grid-cols-[88px_1fr] gap-2 text-[12.5px]"
              >
                <dt className="font-mono text-[11px] text-d2-ink/55">{k}</dt>
                <dd>
                  <span className="font-medium">{v}</span>
                  {note && (
                    <span
                      className="ml-2 font-mono text-[10.5px]"
                      style={{ color: 'var(--ajo-paid)' }}
                    >
                      · {note}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div
          className="flex flex-col-reverse items-stretch gap-2 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-end"
          style={{
            borderTop:
              '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
            background: 'color-mix(in oklch, var(--d2-ink) 2%, transparent)',
          }}
        >
          {/* TODO(slice-5): wire rejectReceiptAction here */}
          <button
            type="button"
            disabled
            title={SLICE_5_REJECT_TITLE}
            aria-label="Reject as duplicate (action wires in slice 5)"
            className="rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium text-d2-ink transition-colors hover:bg-d2-ink/5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
            }}
          >
            Reject as duplicate
          </button>
          {/* TODO(slice-5): wire flagReceiptAction here */}
          <button
            type="button"
            disabled
            title={SLICE_5_FLAG_TITLE}
            aria-label="Mark as suspicious (action wires in slice 5)"
            className="rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--destructive)' }}
          >
            Mark as suspicious
          </button>
          {/* TODO(slice-5): wire confirmReceiptAction here */}
          <button
            type="button"
            disabled
            title={SLICE_5_TITLE}
            aria-label="Confirm payment (action wires in slice 5)"
            className="rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--ajo-paid)' }}
          >
            Confirm payment
          </button>
        </div>
      </div>
    </div>
  );
}
