import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle, type LucideIcon } from 'lucide-react';

export type FormFieldState = 'default' | 'focus' | 'error' | 'disabled';

export interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label above the input. */
  label?: ReactNode;
  /** Optional hint shown right-aligned next to the label. */
  hint?: ReactNode;
  /** Helper / error text below the input. */
  help?: ReactNode;
  /** Visual state override. Defaults to inferred (default / focus via :focus / disabled via prop). */
  state?: FormFieldState;
  /** Leading icon component. */
  icon?: LucideIcon;
}

const STATE_BORDER_BACKGROUND: Record<
  FormFieldState,
  { border: string; background: string; boxShadow?: string }
> = {
  default: {
    border: '1px solid color-mix(in oklch, var(--d2-ink) 12%, transparent)',
    background: 'var(--d2-cream)',
  },
  focus: {
    border: '1.5px solid var(--d2-accent)',
    background: 'var(--d2-cream)',
    boxShadow:
      '0 0 0 3px color-mix(in oklch, var(--d2-accent) 18%, transparent)',
  },
  error: {
    border: '1.5px solid var(--destructive)',
    background: 'var(--d2-cream)',
    boxShadow:
      '0 0 0 3px color-mix(in oklch, var(--destructive) 14%, transparent)',
  },
  disabled: {
    border: '1px solid color-mix(in oklch, var(--d2-ink) 8%, transparent)',
    background: 'color-mix(in oklch, var(--d2-ink) 4%, transparent)',
  },
};

/**
 * Form field primitive (handoff `<Field>` artboard). All four states
 * land in one component so the form-states reference renders without
 * duplicating chrome per variant.
 *
 * Why this lives in `components/feedback/` and not `components/ui/`:
 * the existing shadcn `<Input>` is a primitive that the project uses
 * for raw text input where chrome control is needed (signin, recover).
 * `<FormField>` is the d2-shaped wrapper that bundles the label + hint
 * + icon + help row on top of an input. Surfaces that want the full d2
 * field experience compose this; surfaces that need a bare input
 * (auth, password reveal) keep using shadcn directly.
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    {
      label,
      hint,
      help,
      state,
      icon: Icon,
      id: providedId,
      disabled,
      readOnly,
      onFocus,
      onBlur,
      ...inputProps
    },
    ref,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const resolvedState: FormFieldState =
      state ?? (disabled ? 'disabled' : 'default');
    const styles = STATE_BORDER_BACKGROUND[resolvedState];
    const isError = resolvedState === 'error';
    const helpId = help ? `${id}-help` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {(label || hint) && (
          <div className="flex items-baseline justify-between">
            {label && (
              <label htmlFor={id} className="text-[12px] font-medium text-d2-ink">
                {label}
              </label>
            )}
            {hint && (
              <span className="font-mono text-[10px] text-d2-ink/55">
                {hint}
              </span>
            )}
          </div>
        )}
        <div
          className="flex items-center gap-2 rounded-[10px] px-3 py-2.5"
          style={{
            border: styles.border,
            background: styles.background,
            boxShadow: styles.boxShadow,
            opacity: resolvedState === 'disabled' ? 0.75 : 1,
          }}
        >
          {Icon && (
            <Icon
              size={15}
              aria-hidden="true"
              style={{
                color:
                  'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
              }}
            />
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled || resolvedState === 'disabled'}
            readOnly={readOnly}
            aria-invalid={isError || undefined}
            aria-describedby={helpId}
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-d2-ink/40 disabled:cursor-not-allowed"
            onFocus={onFocus}
            onBlur={onBlur}
            {...inputProps}
          />
        </div>
        {help && (
          <div
            id={helpId}
            className="flex items-center gap-1 text-[11px]"
            style={{
              color: isError
                ? 'var(--destructive)'
                : 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
            }}
          >
            {isError && <AlertCircle size={11} aria-hidden="true" />}
            <span>{help}</span>
          </div>
        )}
      </div>
    );
  },
);
