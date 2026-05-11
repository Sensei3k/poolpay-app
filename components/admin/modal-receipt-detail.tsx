'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';
import type { ReceiptQueueRow } from '@/lib/view-models/admin';
import {
  confirmReceiptAction,
  flagReceiptAction,
  rejectReceiptAction,
} from '@/lib/actions/receipts';
import {
  RECEIPT_REASON_MAX_LENGTH,
  type ReceiptActionErrorCode,
  type ReceiptActionResult,
} from '@/lib/actions/receipts-types';

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
 * Which reason-required prompt (if any) is currently rendered in the
 * footer. `null` shows the three default action buttons; `reject` and
 * `flag` swap the footer for an inline reason form that submits the
 * matching action.
 */
type ReasonPrompt = null | 'reject' | 'flag';

const ERROR_COPY: Record<ReceiptActionErrorCode, string> = {
  validation: 'That request was rejected. Try again.',
  forbidden: "You don't have access to this receipt.",
  conflict: 'This receipt was already actioned by another admin.',
  service: 'Something went wrong on our end. Try again in a moment.',
  backend_unavailable:
    "Couldn't reach the server. Check your connection and retry.",
};

/**
 * Receipt-detail modal. Lays out the screenshot placeholder + metadata
 * block from the AD_Receipts artboard, and wires the three footer
 * actions (confirm / reject / flag) against the receipt action helpers.
 *
 * The modal reads its open state from the receipts-queue store. Pages
 * mount this component once below the queue table and let the store
 * drive visibility. Clicking the backdrop, the close button, or Escape
 * clears the store's selected id and dismisses the modal.
 */
export function ModalReceiptDetail({
  row,
  expectedAmountLabel,
  bankTraceLabel,
  senderLabel,
}: ModalReceiptDetailProps) {
  const router = useRouter();
  const markConfirm = useReceiptsQueueStore((s) => s.markOptimisticallyConfirmed);
  const clearConfirm = useReceiptsQueueStore((s) => s.clearOptimisticallyConfirmed);
  const markReject = useReceiptsQueueStore((s) => s.markOptimisticallyRejected);
  const clearReject = useReceiptsQueueStore((s) => s.clearOptimisticallyRejected);
  const markFlag = useReceiptsQueueStore((s) => s.markOptimisticallyFlagged);
  const clearFlag = useReceiptsQueueStore((s) => s.clearOptimisticallyFlagged);

  const [reasonPrompt, setReasonPrompt] = useState<ReasonPrompt>(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState<ReceiptActionErrorCode | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const closeModal = () => {
    useReceiptsQueueStore.getState().selectReceipt(null);
  };

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

  const handleConfirm = () => {
    setActionError(null);
    markConfirm(row.receiptId);
    startTransition(async () => {
      let result: ReceiptActionResult;
      try {
        result = await confirmReceiptAction(row.receiptId);
      } catch (err) {
        // BackendUnauthorizedError bubbles past secureAction. Re-throw so
        // Next's error boundary or the global handler can redirect to
        // /signin?reauth=1; never swallow auth failures silently.
        clearConfirm(row.receiptId);
        throw err;
      }
      if (result.ok) {
        closeModal();
        router.refresh();
        // Safety clear: router.refresh() drops the row from the queue on
        // the next RSC payload. If the BE read momentarily lags the
        // write the row would otherwise stay dimmed; clear after 3s as
        // a guarantee.
        window.setTimeout(() => clearConfirm(row.receiptId), 3000);
        return;
      }
      clearConfirm(row.receiptId);
      setActionError(result.code);
    });
  };

  const submitReasonAction = (kind: 'reject' | 'flag') => {
    const cleaned = reason.trim();
    if (cleaned.length === 0) {
      setActionError('validation');
      return;
    }
    setActionError(null);
    const mark = kind === 'reject' ? markReject : markFlag;
    const clear = kind === 'reject' ? clearReject : clearFlag;
    const run = kind === 'reject' ? rejectReceiptAction : flagReceiptAction;
    mark(row.receiptId);
    startTransition(async () => {
      let result: ReceiptActionResult;
      try {
        result = await run(row.receiptId, cleaned);
      } catch (err) {
        clear(row.receiptId);
        throw err;
      }
      if (result.ok) {
        setReason('');
        setReasonPrompt(null);
        closeModal();
        router.refresh();
        // Safety clear, see handleConfirm above for the rationale.
        window.setTimeout(() => clear(row.receiptId), 3000);
        return;
      }
      clear(row.receiptId);
      setActionError(result.code);
    });
  };

  const openReasonPrompt = (kind: 'reject' | 'flag') => {
    setReason('');
    setActionError(null);
    setReasonPrompt(kind);
  };

  const cancelReasonPrompt = () => {
    setReason('');
    setActionError(null);
    setReasonPrompt(null);
  };

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
    ['Bank trace', bankTraceLabel ?? 'n/a', null],
    ['Submitted', row.submittedLabel, null],
  ];

  const reasonRemaining = RECEIPT_REASON_MAX_LENGTH - reason.length;

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
        onClick={closeModal}
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
            onClick={closeModal}
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
                  {/* React escapes text content by default — never use
                      dangerouslySetInnerHTML for any of these values; the
                      reason field in particular is operator-supplied free
                      text (BE security audit finding #3). */}
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
        {actionError !== null && (
          <div
            role="alert"
            className="mx-6 mb-3 flex items-start gap-2 rounded-[10px] px-3.5 py-2 text-[12.5px]"
            style={{
              background:
                'color-mix(in oklch, var(--destructive) 8%, transparent)',
              border:
                '1px solid color-mix(in oklch, var(--destructive) 25%, transparent)',
              color: 'var(--destructive)',
            }}
          >
            <AlertCircle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>{ERROR_COPY[actionError]}</span>
          </div>
        )}
        {reasonPrompt !== null ? (
          <ReasonForm
            kind={reasonPrompt}
            reason={reason}
            onReasonChange={setReason}
            remaining={reasonRemaining}
            isPending={isPending}
            onCancel={cancelReasonPrompt}
            onSubmit={() => submitReasonAction(reasonPrompt)}
          />
        ) : (
          <div
            className="flex flex-col-reverse items-stretch gap-2 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-end"
            style={{
              borderTop:
                '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
              background: 'color-mix(in oklch, var(--d2-ink) 2%, transparent)',
            }}
          >
            <button
              type="button"
              onClick={() => openReasonPrompt('reject')}
              disabled={isPending}
              className="rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium text-d2-ink transition-colors hover:bg-d2-ink/5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              }}
            >
              Reject as duplicate
            </button>
            <button
              type="button"
              onClick={() => openReasonPrompt('flag')}
              disabled={isPending}
              className="rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'var(--destructive)' }}
            >
              Mark as suspicious
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'var(--ajo-paid)' }}
            >
              {isPending ? 'Working…' : 'Confirm payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReasonFormProps {
  kind: 'reject' | 'flag';
  reason: string;
  onReasonChange: (next: string) => void;
  remaining: number;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

/**
 * Inline reason capture footer rendered when the user picks reject or
 * flag. Clamps input to the 280-char backend cap, shows a live
 * remaining-characters counter, and disables submit until at least one
 * non-whitespace character is present.
 */
function ReasonForm({
  kind,
  reason,
  onReasonChange,
  remaining,
  isPending,
  onCancel,
  onSubmit,
}: ReasonFormProps) {
  const labelText =
    kind === 'reject'
      ? 'Why reject? Visible to the audit log only.'
      : 'Why flag? Visible to the audit log only.';
  const submitText =
    kind === 'reject'
      ? isPending
        ? 'Rejecting…'
        : 'Reject as duplicate'
      : isPending
        ? 'Flagging…'
        : 'Mark as suspicious';
  const submitColor = kind === 'reject' ? 'var(--d2-ink)' : 'var(--destructive)';
  const inputId = `receipt-reason-${kind}`;
  const canSubmit = reason.trim().length > 0 && !isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit();
      }}
      className="flex flex-col gap-3 px-6 py-4"
      style={{
        borderTop:
          '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        background: 'color-mix(in oklch, var(--d2-ink) 2%, transparent)',
      }}
    >
      <label
        htmlFor={inputId}
        className="font-mono text-[11px] tracking-wider text-d2-ink/65"
      >
        {labelText}
      </label>
      <textarea
        id={inputId}
        value={reason}
        onChange={(e) => onReasonChange(e.target.value.slice(0, RECEIPT_REASON_MAX_LENGTH))}
        maxLength={RECEIPT_REASON_MAX_LENGTH}
        rows={2}
        autoFocus
        className="w-full resize-none rounded-[10px] bg-d2-cream px-3 py-2 text-[13px] outline-none placeholder:text-d2-ink/40 focus-visible:ring-2"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)',
        }}
        placeholder={
          kind === 'reject'
            ? 'duplicate of #R-...'
            : 'amount mismatch, fake-looking screenshot, etc.'
        }
        aria-describedby={`${inputId}-count`}
      />
      <div className="flex items-center justify-between gap-3">
        <span
          id={`${inputId}-count`}
          className="font-mono text-[10.5px] text-d2-ink/55"
          aria-live="polite"
        >
          {remaining} character{remaining === 1 ? '' : 's'} left
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium text-d2-ink transition-colors hover:bg-d2-ink/5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: submitColor }}
          >
            {submitText}
          </button>
        </div>
      </div>
    </form>
  );
}
