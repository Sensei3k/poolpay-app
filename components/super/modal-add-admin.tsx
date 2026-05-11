'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, Info, KeyRound, UserPlus, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { createAdminAction } from '@/app/(app)/sys/admins/actions';
import { useAddAdminModalStore } from '@/lib/stores/add-admin-modal';
import { generateTempPassword } from '@/lib/super-admin/generate-temp-password';
import type { GroupChipOption } from '@/lib/view-models/super';

export interface ModalAddAdminProps {
  /** Pool catalogue surfaced as grant chips. Comes from the parent RSC. */
  groupOptions: ReadonlyArray<GroupChipOption>;
}

/**
 * Super-admin "Add admin" modal, implements the HANDOFF §5.4
 * create-then-grant flow as a client-orchestrated dance over real
 * poolpay-api endpoints (deviation #1).
 *
 * Steps:
 *  1. Operator fills name / email / phone, picks grant chips.
 *  2. On submit, generate a temp password client-side via Web Crypto,
 *     fire the server action, then either reveal the credentials once
 *     or surface a failure.
 *  3. Reveal screen shows the email + plaintext password with a Copy
 *     button. Modal cannot dismiss until the operator ticks
 *     "I've copied the password", protects the one-time reveal.
 *
 * Security:
 *  - The generated password lives only in the store and in the Copy
 *    button click handler. `closeModal()` clears it via `reset()`.
 *  - Component cleanup also fires `reset()` so even ungraceful unmounts
 *    zero the field.
 *  - No localStorage, no sessionStorage, no console.log, no analytics
 *    touches `tempPassword`.
 */
export function ModalAddAdmin({ groupOptions }: ModalAddAdminProps) {
  const titleId = useId();

  const {
    open,
    step,
    form,
    revealed,
    acknowledgedReveal,
    errorMessage,
    closeModal,
    setForm,
    toggleGroup,
    beginSubmit,
    reveal,
    fail,
    acknowledge,
    reset,
  } = useAddAdminModalStore(
    useShallow((s) => ({
      open: s.open,
      step: s.step,
      form: s.form,
      revealed: s.revealed,
      acknowledgedReveal: s.acknowledgedReveal,
      errorMessage: s.errorMessage,
      closeModal: s.closeModal,
      setForm: s.setForm,
      toggleGroup: s.toggleGroup,
      beginSubmit: s.beginSubmit,
      reveal: s.reveal,
      fail: s.fail,
      acknowledge: s.acknowledge,
      reset: s.reset,
    })),
  );

  const cancelRef = useRef<HTMLButtonElement>(null);

  // Clear all sensitive state on unmount, even if the operator force-
  // closes the tab / route. Anything that touched `revealed` zeroes out.
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Escape closes the modal in form/error/revealed-acknowledged states.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // When revealed but not acknowledged, escape is gated, operator
      // must explicitly acknowledge before the modal can close.
      if (step === 'revealed' && !acknowledgedReveal) return;
      closeModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, step, acknowledgedReveal, closeModal]);

  if (!open) return null;

  const canDismiss = step !== 'revealed' || acknowledgedReveal;
  const isSubmitting = step === 'submitting';
  const fieldsFilled =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.selectedGroupIds.size > 0;
  // `canSubmit` gates the submit button. Submission is only allowed
  // when the form has values AND we are not mid-flight; the 'error'
  // step also permits a retry, hence !'revealed' / !'submitting'.
  const canSubmit = fieldsFilled && !isSubmitting && step !== 'revealed';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    // Generate the plaintext password client-side. We hold it in a
    // closure variable rather than the store while in flight so a
    // mid-action store reset (e.g. operator hits Escape mid-call)
    // doesn't lose the value we need for the reveal step.
    let tempPassword: string;
    try {
      tempPassword = generateTempPassword();
    } catch {
      fail('Could not generate a secure password. Refresh and try again.');
      return;
    }

    beginSubmit();

    const groupIds = Array.from(form.selectedGroupIds);
    const result = await createAdminAction({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      initialPassword: tempPassword,
      groupIds,
    });

    if (result.ok) {
      const grantedGroupNames = groupOptions
        .filter((g) => result.grantedGroupIds.includes(g.poolId))
        .map((g) => g.poolName);
      reveal({
        email: form.email.trim(),
        tempPassword,
        grantedGroupNames,
      });
      return;
    }

    const baseMessage = result.error || 'Something went wrong.';
    const detail =
      result.stage === 'grant' && result.partial
        ? result.partial.compensated
          ? `Grant failed (${baseMessage}). The partial user account was rolled back.`
          : `Grant failed (${baseMessage}). Compensation also failed; please reach ops with userId ${result.partial.userId}.`
        : `${baseMessage}.`;
    fail(detail);
  }

  function handleBackdropMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (!canDismiss) return;
    closeModal();
  }

  async function copyPassword(): Promise<boolean> {
    if (!revealed) return false;
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      // Older browsers / iframe contexts don't expose the Clipboard API.
      // Returning false lets RevealedPanel surface manual-copy microcopy.
      return false;
    }
    try {
      await navigator.clipboard.writeText(revealed.tempPassword);
      return true;
    } catch {
      // Surfacing this as a fail() would scrub the password, that's
      // worse than the operator manually copying from the input. Return
      // false so the panel can surface inline microcopy.
      return false;
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={handleBackdropMouseDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in oklch, var(--d2-ink) 35%, transparent)' }}
    >
      <div
        className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border bg-d2-warm-bg"
        style={{
          borderColor: 'color-mix(in oklch, var(--d2-ink) 12%, transparent)',
          boxShadow:
            '0 30px 80px -20px color-mix(in oklch, var(--d2-ink) 35%, transparent), 0 4px 12px color-mix(in oklch, var(--d2-ink) 8%, transparent)',
        }}
      >
        <header
          className="flex items-start justify-between gap-3 px-5 py-4"
          style={{
            borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <div>
            <h2 id={titleId} className="text-[17px] font-semibold">
              Add admin
            </h2>
            <p className="mt-0.5 text-[12px] text-d2-ink/60">
              {step === 'revealed'
                ? 'Copy the temp password. It will not appear again.'
                : 'Create the account and grant groups in one step.'}
            </p>
          </div>
          <button
            ref={cancelRef}
            type="button"
            disabled={!canDismiss}
            onClick={closeModal}
            aria-label="Close"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-50"
            title={canDismiss ? 'Close' : 'Confirm you copied the password first'}
          >
            <X
              size={16}
              aria-hidden="true"
              style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
            />
          </button>
        </header>

        {step === 'revealed' && revealed ? (
          <RevealedPanel
            revealed={revealed}
            acknowledged={acknowledgedReveal}
            onCopy={copyPassword}
            onAcknowledge={acknowledge}
            onClose={closeModal}
          />
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col">
            <FormBody
              groupOptions={groupOptions}
              form={form}
              busy={isSubmitting}
              onNameChange={(name) => setForm({ name })}
              onEmailChange={(email) => setForm({ email })}
              onPhoneChange={(phone) => setForm({ phone })}
              onToggleGroup={toggleGroup}
            />

            {errorMessage && step === 'error' && (
              <div
                role="alert"
                className="mx-5 mb-3 rounded-[10px] border px-3 py-2 text-[12px]"
                style={{
                  background: 'color-mix(in oklch, var(--destructive) 8%, transparent)',
                  borderColor:
                    'color-mix(in oklch, var(--destructive) 25%, transparent)',
                  color: 'var(--destructive)',
                }}
              >
                {errorMessage}
              </div>
            )}

            <footer
              className="flex items-center justify-between gap-3 bg-d2-cream px-5 py-3.5"
              style={{
                borderTop: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
              }}
            >
              <span
                className="font-mono text-[11px]"
                style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
              >
                no email sent · deliver creds out-of-band
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[10px] bg-transparent px-3.5 py-2 text-[13px] font-medium hover:bg-d2-ink/[5%]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)' }}
                >
                  <UserPlus size={13} aria-hidden="true" />
                  {isSubmitting ? 'Creating…' : 'Create & grant · reveal temp password'}
                </button>
              </div>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

interface FormBodyProps {
  groupOptions: ReadonlyArray<GroupChipOption>;
  form: {
    name: string;
    email: string;
    phone: string;
    selectedGroupIds: ReadonlySet<string>;
  };
  busy: boolean;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onToggleGroup: (poolId: string) => void;
}

function FormBody({
  groupOptions,
  form,
  busy,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onToggleGroup,
}: FormBodyProps) {
  return (
    <div className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-2">
      <Field
        label="Full name"
        placeholder="e.g. Chidi Obi"
        value={form.name}
        onChange={onNameChange}
        disabled={busy}
        required
      />
      <Field
        label="Email"
        placeholder="chidi@chamasave.ng"
        type="email"
        mono
        value={form.email}
        onChange={onEmailChange}
        disabled={busy}
        required
      />
      <Field
        label="Phone (WhatsApp)"
        placeholder="+234 …"
        mono
        value={form.phone}
        onChange={onPhoneChange}
        disabled={busy}
      />
      <Field label="Role" value="admin" muted readOnly disabled />

      <div className="md:col-span-2">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.08em]"
          style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
        >
          Grant groups
          <span
            className="ml-1 normal-case tracking-normal"
            style={{ color: 'color-mix(in oklch, var(--d2-ink) 50%, transparent)' }}
          >
            · admin can confirm receipts in these
          </span>
        </div>
        <div
          className="mt-1.5 flex min-h-[48px] flex-wrap gap-1.5 rounded-[10px] border bg-d2-cream p-3"
          style={{
            borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          {groupOptions.map((g) => {
            const active = form.selectedGroupIds.has(g.poolId);
            return (
              <button
                key={g.poolId}
                type="button"
                onClick={() => onToggleGroup(g.poolId)}
                aria-pressed={active}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors disabled:opacity-60"
                style={{
                  background: active
                    ? 'var(--d2-accent-soft)'
                    : 'color-mix(in oklch, var(--d2-ink) 5%, transparent)',
                  color: active
                    ? 'var(--d2-accent)'
                    : 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
                  borderColor: active
                    ? 'color-mix(in oklch, var(--d2-accent) 30%, transparent)'
                    : 'transparent',
                }}
              >
                {active && <Check size={11} aria-hidden="true" />}
                {g.poolName}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="md:col-span-2"
        role="note"
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          background: 'var(--accent-violet-subtle)',
          border: '1px solid color-mix(in oklch, var(--accent-violet) 25%, transparent)',
          display: 'flex',
          gap: 10,
        }}
      >
        <KeyRound
          size={15}
          aria-hidden="true"
          style={{ color: 'var(--accent-violet)', flexShrink: 0, marginTop: 2 }}
        />
        <p className="text-[12px]" style={{ color: 'var(--accent-violet)' }}>
          After creating, a <b>temp password</b> appears once on the next screen. Copy it. We
          do not store it and cannot re-show it. The new admin rotates it on first sign-in.
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  mono?: boolean;
  muted?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email';
}

function Field({
  label,
  placeholder,
  value = '',
  onChange,
  mono,
  muted,
  readOnly,
  disabled,
  required,
  type = 'text',
}: FieldProps) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.08em]"
        style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="mt-1 w-full rounded-[10px] border bg-d2-cream px-3 py-2 text-[14px] disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          background: muted
            ? 'color-mix(in oklch, var(--d2-ink) 5%, transparent)'
            : 'var(--d2-cream)',
          borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          fontFamily: mono ? 'var(--font-mono)' : undefined,
        }}
      />
    </div>
  );
}

interface RevealedPanelProps {
  revealed: {
    email: string;
    tempPassword: string;
    grantedGroupNames: ReadonlyArray<string>;
  };
  acknowledged: boolean;
  onCopy: () => Promise<boolean>;
  onAcknowledge: () => void;
  onClose: () => void;
}

function RevealedPanel({
  revealed,
  acknowledged,
  onCopy,
  onAcknowledge,
  onClose,
}: RevealedPanelProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );

  async function handleCopy() {
    const ok = await onCopy();
    setCopyState(ok ? 'copied' : 'failed');
    // Reset the visual confirmation after a short hold so a second copy
    // attempt re-renders the icon flip. Failure state stays until the
    // operator successfully copies or dismisses the modal so the
    // manual-copy nudge stays visible while needed.
    if (ok) {
      window.setTimeout(() => setCopyState('idle'), 1500);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-5 py-4">
        <div
          className="flex gap-2.5 rounded-[10px] border p-3"
          style={{
            background: 'var(--accent-violet-subtle)',
            borderColor: 'color-mix(in oklch, var(--accent-violet) 25%, transparent)',
          }}
        >
          <Info
            size={15}
            aria-hidden="true"
            style={{ color: 'var(--accent-violet)', flexShrink: 0, marginTop: 2 }}
          />
          <p className="text-[12px]" style={{ color: 'var(--accent-violet)' }}>
            Copy now. This is the only time the password is visible. Share via Signal,
            WhatsApp, or in-person.
          </p>
        </div>

        <div>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
          >
            Email
          </span>
          <div className="mt-1 rounded-[10px] border bg-d2-cream px-3 py-2 font-mono text-[14px]"
            style={{ borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)' }}
          >
            {revealed.email}
          </div>
        </div>

        <div>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em]"
            style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
          >
            Temp password
          </span>
          <div className="mt-1 flex items-center gap-2">
            <input
              readOnly
              aria-label="Temporary password (one-time reveal)"
              value={revealed.tempPassword}
              className="flex-1 rounded-[10px] border bg-d2-cream px-3 py-2 font-mono text-[14px]"
              style={{ borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)' }}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] font-medium"
              style={{ background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)' }}
            >
              {copyState === 'copied' ? (
                <>
                  <Check size={13} aria-hidden="true" /> Copied
                </>
              ) : (
                <>
                  <Copy size={13} aria-hidden="true" /> Copy
                </>
              )}
            </button>
          </div>
          {copyState === 'failed' && (
            <p
              className="mt-1.5 text-[11.5px]"
              style={{ color: 'var(--destructive)' }}
              role="status"
            >
              Couldn{"'"}t copy automatically. Select the text and press
              {' '}<kbd className="font-mono text-[10.5px]">⌘C</kbd> /{' '}
              <kbd className="font-mono text-[10.5px]">Ctrl+C</kbd>.
            </p>
          )}
        </div>

        {revealed.grantedGroupNames.length > 0 && (
          <div>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.08em]"
              style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
            >
              Granted on
            </span>
            <p className="mt-1 text-[13px]">
              {revealed.grantedGroupNames.join(', ')}
            </p>
          </div>
        )}

        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => {
              if (e.target.checked) onAcknowledge();
            }}
            className="h-4 w-4 cursor-pointer accent-d2-ink"
          />
          I have copied the password
        </label>
      </div>

      <footer
        className="flex justify-end bg-d2-cream px-5 py-3.5"
        style={{
          borderTop: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={!acknowledged}
          className="rounded-[10px] px-4 py-2 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: 'var(--d2-ink)', color: 'var(--d2-warm-bg)' }}
        >
          Done
        </button>
      </footer>
    </div>
  );
}
