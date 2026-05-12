'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ModalShell } from '@/components/feedback/modal-shell';

export interface ModalDestructiveConfirmProps {
  open: boolean;
  onClose: () => void;
  /** Confirm handler. Only fires once the typed phrase matches. */
  onConfirm: () => void;
  /** Modal title, full sentence, e.g. "Remove Tola from Lagos Rent Q2?". */
  title: string;
  /** Sub-line warning copy. */
  sub: string;
  /** Confirmation phrase the operator must type. Defaults to "REMOVE". */
  confirmPhrase?: string;
  /** Label for the destructive CTA. */
  cta?: string;
  /** Whether the action is in-flight. */
  pending?: boolean;
  /** Reassurance / audit-log copy under the danger banner. */
  reassurance?: string;
}

/**
 * Destructive confirm modal (handoff `ModalDestructive` artboard). Used
 * by admin and super-admin flows that delete or remove records: member
 * removal with outstanding balance, pool archival, admin revocation.
 *
 * Type-to-confirm pattern: the destructive CTA stays disabled until the
 * operator types the exact `confirmPhrase`. Trimmed and case-sensitive
 * to match the artboard's REMOVE constant.
 */
export function ModalDestructiveConfirm({
  open,
  onClose,
  onConfirm,
  title,
  sub,
  confirmPhrase = 'REMOVE',
  cta = 'Remove member',
  pending = false,
  reassurance,
}: ModalDestructiveConfirmProps) {
  const [typed, setTyped] = useState('');
  const matches = typed.trim() === confirmPhrase;
  const canConfirm = matches && !pending;

  return (
    <ModalShell
      open={open}
      onClose={() => {
        setTyped('');
        onClose();
      }}
      width={420}
      kicker="Destructive"
      title={title}
      sub={sub}
      footerRight={
        <>
          <button
            type="button"
            onClick={() => {
              setTyped('');
              onClose();
            }}
            className="rounded-[10px] border bg-transparent px-3.5 py-2 text-[13px] font-medium text-ink"
            style={{
              borderColor:
                'color-mix(in oklch, var(--ink) 12%, transparent)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="rounded-[10px] px-3.5 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--destructive)' }}
          >
            {pending ? 'Working…' : cta}
          </button>
        </>
      }
    >
      <div
        className="flex gap-2.5 rounded-[10px] border px-3.5 py-3"
        style={{
          background:
            'color-mix(in oklch, var(--destructive) 10%, transparent)',
          borderColor:
            'color-mix(in oklch, var(--destructive) 25%, transparent)',
        }}
      >
        <AlertTriangle
          size={16}
          aria-hidden="true"
          className="mt-0.5 shrink-0"
          style={{ color: 'var(--destructive)' }}
        />
        <div className="text-[12.5px] leading-[1.5]">
          <strong style={{ color: 'var(--destructive)' }}>
            This cannot be undone.
          </strong>{' '}
          {reassurance ??
            'Their past contributions stay on the cycle log for audit.'}
        </div>
      </div>
      <div>
        <label
          htmlFor="destructive-confirm-input"
          className="mb-1.5 inline-block text-[12px] font-medium text-ink"
        >
          Type {confirmPhrase} to confirm
        </label>
        <input
          id="destructive-confirm-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={confirmPhrase}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-[10px] border bg-surface-card px-3 py-2 text-[13px] outline-none"
          style={{
            borderColor: matches
              ? 'var(--destructive)'
              : 'color-mix(in oklch, var(--ink) 12%, transparent)',
            boxShadow: matches
              ? '0 0 0 3px color-mix(in oklch, var(--destructive) 14%, transparent)'
              : undefined,
          }}
        />
      </div>
    </ModalShell>
  );
}
