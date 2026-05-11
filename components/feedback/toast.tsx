import type { ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { FeedbackTone } from './banner';

export interface ToastProps {
  tone?: FeedbackTone;
  /** Title, bold first line of the toast. Required. */
  title: ReactNode;
  /** Supporting copy, optional second line. */
  description?: ReactNode;
  /** Icon override. Defaults to a tone-appropriate Lucide icon. */
  icon?: LucideIcon;
  /** Dismiss handler. When omitted, no close affordance renders. */
  onDismiss?: () => void;
  /** Aria-label for the dismiss button. */
  dismissLabel?: string;
}

const TONE_ICON: Record<FeedbackTone, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  error: AlertTriangle,
  sparkle: Info,
};

const TONE_STYLES: Record<
  FeedbackTone,
  { background: string; border: string; foreground: string }
> = {
  success: {
    background:
      'color-mix(in oklch, var(--ajo-paid) 12%, var(--d2-cream))',
    border:
      '1px solid color-mix(in oklch, var(--ajo-paid) 30%, transparent)',
    foreground: 'var(--ajo-paid)',
  },
  info: {
    background:
      'color-mix(in oklch, var(--d2-accent) 8%, var(--d2-cream))',
    border:
      '1px solid color-mix(in oklch, var(--d2-accent) 25%, transparent)',
    foreground: 'var(--d2-accent)',
  },
  warning: {
    background:
      'color-mix(in oklch, var(--ajo-outstanding) 12%, var(--d2-cream))',
    border:
      '1px solid color-mix(in oklch, var(--ajo-outstanding) 30%, transparent)',
    foreground: 'var(--ajo-outstanding-fg)',
  },
  error: {
    background:
      'color-mix(in oklch, var(--destructive) 10%, var(--d2-cream))',
    border:
      '1px solid color-mix(in oklch, var(--destructive) 28%, transparent)',
    foreground: 'var(--destructive)',
  },
  sparkle: {
    background:
      'color-mix(in oklch, var(--d2-accent) 8%, var(--d2-cream))',
    border:
      '1px solid color-mix(in oklch, var(--d2-accent) 25%, transparent)',
    foreground: 'var(--d2-accent)',
  },
};

/**
 * Transient toast (handoff `<Toast>` pattern). Compositionally similar
 * to `<Banner>` but tuned for shorter copy and a 5s lifecycle. The
 * caller owns lifecycle and stacking; this primitive renders one toast.
 *
 * Slice 6 ships the visual primitive only. A future toast-manager
 * (queueing, deduping, screen-reader polite-region) will compose this
 * primitive with a Zustand store. Until then the handoff `ToastsScene`
 * artboard renders these statically for the preview matrix.
 */
export function Toast({
  tone = 'success',
  title,
  description,
  icon,
  onDismiss,
  dismissLabel = 'Dismiss notification',
}: ToastProps) {
  const Icon = icon ?? TONE_ICON[tone];
  const styles = TONE_STYLES[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-2.5 rounded-[12px] px-3.5 py-3"
      style={{
        background: styles.background,
        border: styles.border,
        boxShadow:
          '0 8px 22px -10px color-mix(in oklch, var(--d2-ink) 15%, transparent)',
      }}
    >
      <Icon
        size={17}
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        style={{ color: styles.foreground }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-d2-ink">{title}</div>
        {description && (
          <div className="mt-0.5 text-[11.5px] text-d2-ink/60">
            {description}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-d2-ink/50 transition-colors hover:bg-d2-ink/5"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
