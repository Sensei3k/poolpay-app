'use client';

import { AlertCircle } from 'lucide-react';
import { ModalShell } from '@/components/feedback/modal-shell';

export interface ModalStartCycleRecipient {
  name: string;
  initial: string;
  positionLabel: string;
  /** Background color for the recipient avatar. Pass a token var. */
  swatch?: string;
}

export interface ModalStartCycleProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Pool display name, e.g. "Lagos Rent Q2". */
  poolName: string;
  /** Cycle number copy, e.g. "11". */
  cycleNumber: number;
  /** Contribution amount label, e.g. "₦ 12,000". */
  contributionLabel: string;
  /** Due-date label. */
  dueDateLabel: string;
  /** Next recipient details. */
  recipient: ModalStartCycleRecipient;
  /** Whether to surface the outstanding-cycle warning. */
  outstandingCount?: number;
  pending?: boolean;
}

/**
 * Start-cycle confirm modal (handoff `ModalCreateCycle` artboard).
 * Admin-side flow that opens the next cycle, locks the roster, and (per
 * the handoff) auto-notifies the WhatsApp group. Slice 6 lands the
 * visual shell + dev preview; cycle-create wiring stays a follow-up.
 */
export function ModalStartCycle({
  open,
  onClose,
  onConfirm,
  poolName,
  cycleNumber,
  contributionLabel,
  dueDateLabel,
  recipient,
  outstandingCount = 0,
  pending = false,
}: ModalStartCycleProps) {
  const hasOutstanding = outstandingCount > 0;
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      width={500}
      kicker={`Admin · ${poolName}`}
      title={`Start cycle ${cycleNumber}`}
      sub="The roster is locked at the start of each cycle. Once started, you can only adjust amounts with member sign-off."
      footerLeft={
        <span className="font-mono text-[11px]">
          auto-notifies WhatsApp group
        </span>
      }
      footerRight={
        <>
          <button
            type="button"
            onClick={onClose}
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
            disabled={pending}
            className="rounded-[10px] px-3.5 py-2 text-[13px] font-semibold text-surface-page disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: 'var(--ink)' }}
          >
            {pending ? 'Starting…' : 'Start cycle'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ReadonlyField label="Contribution" value={contributionLabel} />
        <ReadonlyField label="Due date" value={dueDateLabel} />
      </div>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[12px] font-medium text-ink">
            Recipient · cycle {cycleNumber}
          </span>
          <span className="font-mono text-[10px] text-ink/55">
            based on draw order
          </span>
        </div>
        <div
          className="flex items-center gap-2.5 rounded-[10px] border bg-surface-card px-3 py-2.5"
          style={{
            borderColor:
              'color-mix(in oklch, var(--ink) 12%, transparent)',
          }}
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{ background: recipient.swatch ?? 'var(--accent-lavender)' }}
            aria-hidden="true"
          >
            {recipient.initial}
          </span>
          <div className="flex-1">
            <div className="text-[13px] font-medium">{recipient.name}</div>
            <div className="font-mono text-[10.5px] text-ink/55">
              {recipient.positionLabel}
            </div>
          </div>
          <button
            type="button"
            className="text-[11.5px] font-semibold text-accent-primary"
          >
            Override
          </button>
        </div>
      </div>
      {hasOutstanding && (
        <div
          className="flex gap-2.5 rounded-[10px] border px-3 py-2.5"
          style={{
            background:
              'color-mix(in oklch, var(--status-pending) 10%, transparent)',
            borderColor:
              'color-mix(in oklch, var(--status-pending) 25%, transparent)',
          }}
        >
          <AlertCircle
            size={14}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            style={{ color: 'var(--status-pending-fg)' }}
          />
          <span
            className="text-[12.5px]"
            style={{ color: 'var(--status-pending-fg)' }}
          >
            {outstandingCount} member{outstandingCount === 1 ? '' : 's'} still
            outstanding on the previous cycle. Starting cycle {cycleNumber} will
            close the previous cycle and roll their balance forward.
          </span>
        </div>
      )}
    </ModalShell>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-medium text-ink">{label}</div>
      <div
        className="rounded-[10px] border bg-surface-card px-3 py-2 text-[13px]"
        style={{
          borderColor:
            'color-mix(in oklch, var(--ink) 12%, transparent)',
        }}
      >
        {value}
      </div>
    </div>
  );
}
