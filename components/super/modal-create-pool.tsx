'use client';

import { MessageSquare } from 'lucide-react';
import { ModalShell } from '@/components/feedback/modal-shell';

export interface ModalCreatePoolValues {
  name: string;
  currency: string;
  cadence: string;
  contribution: string;
  cycles: string;
  startDate: string;
  whatsappLink: string;
}

export interface ModalCreatePoolProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  values: ModalCreatePoolValues;
  /** Field-level change handler. Caller owns the form state. */
  onChange: (next: ModalCreatePoolValues) => void;
  pending?: boolean;
}

/**
 * Create-pool modal (handoff `ModalCreateGroup` artboard). Super-admin
 * flow that creates a new pool and lands the operator on the assign-
 * admin step. Slice 6 ships the visual shell + dev preview; the
 * server-action wiring and the assign-admin handoff are scoped to a
 * follow-up super-admin slice.
 */
export function ModalCreatePool({
  open,
  onClose,
  onConfirm,
  values,
  onChange,
  pending = false,
}: ModalCreatePoolProps) {
  const setField = <K extends keyof ModalCreatePoolValues>(
    key: K,
    value: ModalCreatePoolValues[K],
  ) => onChange({ ...values, [key]: value });

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      width={540}
      kicker="Super-admin"
      title="Create new pool"
      sub="The group goes live immediately. You'll assign a scoped admin in the next step."
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
            {pending ? 'Creating…' : 'Create pool · then assign admin'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          label="Pool name"
          value={values.name}
          onChange={(v) => setField('name', v)}
        />
        <Field
          label="Currency"
          value={values.currency}
          onChange={(v) => setField('currency', v)}
        />
        <Field
          label="Cadence"
          value={values.cadence}
          onChange={(v) => setField('cadence', v)}
        />
        <Field
          label="Default contribution"
          value={values.contribution}
          onChange={(v) => setField('contribution', v)}
        />
        <Field
          label="Cycles"
          value={values.cycles}
          onChange={(v) => setField('cycles', v)}
        />
        <Field
          label="Start date"
          value={values.startDate}
          onChange={(v) => setField('startDate', v)}
        />
      </div>
      <Field
        label="WhatsApp group link"
        hint="optional · for receipt matching"
        icon
        placeholder="https://chat.whatsapp.com/…"
        value={values.whatsappLink}
        onChange={(v) => setField('whatsappLink', v)}
      />
    </ModalShell>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
  placeholder?: string;
  icon?: boolean;
}

function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
  icon,
}: FieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-ink">{label}</span>
        {hint && (
          <span className="font-mono text-[10px] text-ink/55">{hint}</span>
        )}
      </div>
      <div
        className="flex items-center gap-2 rounded-[10px] border bg-surface-card px-3 py-2"
        style={{
          borderColor:
            'color-mix(in oklch, var(--ink) 12%, transparent)',
        }}
      >
        {icon && (
          <MessageSquare
            size={15}
            aria-hidden="true"
            style={{
              color:
                'color-mix(in oklch, var(--ink) 55%, transparent)',
            }}
          />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink/40"
        />
      </div>
    </div>
  );
}
