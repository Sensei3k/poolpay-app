'use client';

import { Check } from 'lucide-react';
import { ModalShell } from '@/components/feedback/modal-shell';

export interface ModalPayConfirmProps {
  open: boolean;
  onClose: () => void;
  /** Confirm handler. Caller wires it to the contribution intent action. */
  onConfirm: () => void;
  /** Pool display name, e.g. "Lagos Rent Q2". */
  poolName: string;
  /** Pre-formatted amount string, e.g. "₦ 12,000". */
  amountLabel: string;
  /** Cycle copy, e.g. "cycle 10". */
  cycleLabel: string;
  /** "Week of …" or "Due …" sub-line. */
  whenLabel: string;
  /** Recipient display name. */
  recipientName: string;
  /** Recipient bank/account masked. */
  recipientAccount: string;
  /** Memo string. */
  memo: string;
  /** Whether the WhatsApp notify checkbox is checked. */
  notifyWhatsApp: boolean;
  /** Toggle handler for the WhatsApp notify checkbox. */
  onToggleNotify: () => void;
  /** Whether the action is in-flight. */
  pending?: boolean;
}

/**
 * Pay-confirm modal (handoff `ModalPayConfirm` artboard). Surfaced at
 * the end of the pay flow to capture the "I sent it" intent. Per the
 * handoff, the modal does NOT move money — it produces a tracked
 * intent and (optionally) notifies the WhatsApp group when admin
 * confirms.
 *
 * Slice 6 lands the visual shell + dev preview. The pay-intent
 * server action wiring stays for a follow-up slice that builds out
 * the contribution intent table on the backend.
 */
export function ModalPayConfirm({
  open,
  onClose,
  onConfirm,
  poolName,
  amountLabel,
  cycleLabel,
  whenLabel,
  recipientName,
  recipientAccount,
  memo,
  notifyWhatsApp,
  onToggleNotify,
  pending = false,
}: ModalPayConfirmProps) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      width={460}
      kicker={`Pay · ${cycleLabel}`}
      title="Confirm contribution"
      sub={`You're paying ${amountLabel} to ${poolName} · ${whenLabel}.`}
      footerLeft={
        <span className="font-mono text-[11px]">
          can be undone within 24h
        </span>
      }
      footerRight={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border bg-transparent px-3.5 py-2 text-[13px] font-medium text-d2-ink"
            style={{
              borderColor:
                'color-mix(in oklch, var(--d2-ink) 12%, transparent)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-[10px] px-3.5 py-2 text-[13px] font-semibold text-d2-warm-bg disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: 'var(--d2-ink)' }}
          >
            {pending ? 'Confirming…' : 'Confirm & upload receipt'}
          </button>
        </>
      }
    >
      <div
        className="flex items-center justify-between rounded-[12px] border px-4 py-3.5"
        style={{
          background:
            'color-mix(in oklch, var(--d2-accent) 8%, transparent)',
          borderColor:
            'color-mix(in oklch, var(--d2-accent) 25%, transparent)',
        }}
      >
        <div>
          <div className="kicker-mono text-[10px]">Send to</div>
          <div className="mt-0.5 text-[14.5px] font-semibold">
            {recipientName}
          </div>
          <div className="mt-0.5 font-mono text-[12px] text-d2-ink/70">
            {recipientAccount}
          </div>
        </div>
        <div className="text-right">
          <div className="kicker-mono text-[10px]">Amount</div>
          <div className="mt-0.5 font-mono text-[22px] font-semibold tabular-nums tracking-tighter">
            {amountLabel}
          </div>
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label
            htmlFor="pay-memo"
            className="text-[12px] font-medium text-d2-ink"
          >
            Reference / memo
          </label>
          <span className="font-mono text-[10px] text-d2-ink/55">optional</span>
        </div>
        <div
          className="rounded-[10px] border bg-d2-cream px-3 py-2 text-[13px]"
          style={{
            borderColor:
              'color-mix(in oklch, var(--d2-ink) 12%, transparent)',
          }}
        >
          <input
            id="pay-memo"
            readOnly
            value={memo}
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>
      <label
        className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-[12.5px] text-d2-ink/70"
        style={{
          background: 'color-mix(in oklch, var(--d2-ink) 4%, transparent)',
        }}
      >
        <span
          aria-hidden="true"
          className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] border"
          style={{
            background: notifyWhatsApp ? 'var(--d2-accent)' : 'transparent',
            borderColor: 'var(--d2-accent)',
          }}
        >
          {notifyWhatsApp && (
            <Check size={11} aria-hidden="true" className="text-white" />
          )}
        </span>
        <input
          type="checkbox"
          checked={notifyWhatsApp}
          onChange={onToggleNotify}
          className="sr-only"
        />
        <span>Notify the WhatsApp group when admin confirms</span>
      </label>
    </ModalShell>
  );
}
