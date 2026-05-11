import type { ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';

export type FeedbackTone = 'success' | 'info' | 'warning' | 'error' | 'sparkle';

export interface BannerProps {
  tone?: FeedbackTone;
  /** Optional title — renders in `<strong>` weight above the body. */
  title?: ReactNode;
  /** Body copy. Required. */
  body: ReactNode;
  /** Inline icon override. Defaults to a tone-appropriate Lucide icon. */
  icon?: LucideIcon;
  /**
   * Inline action row. Pass `<button>` elements; this primitive doesn't
   * impose a button style. The handoff banner pattern uses small
   * `<PrimaryBtn>` + `<GhostBtn>` pairs but the rule is "compose
   * existing primitives", not "ship a new variant."
   */
  actions?: ReactNode;
  /**
   * Dismiss handler. When provided, an inline close affordance renders
   * on the trailing edge.
   */
  onDismiss?: () => void;
  /** Aria-label for the close button. Defaults to "Dismiss". */
  dismissLabel?: string;
}

const TONE_ICON: Record<FeedbackTone, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  error: AlertTriangle,
  sparkle: Sparkles,
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
 * Persistent inline banner (handoff `<Banner>` pattern). Renders inside a
 * page, not over it. For transient feedback over a route boundary use
 * `<Toast>` from the same module.
 *
 * Tone palette is pinned to existing tokens (--ajo-paid, --ajo-outstanding,
 * --destructive, --d2-accent) so dark-mode flips automatically without
 * adding new variables.
 */
export function Banner({
  tone = 'info',
  title,
  body,
  icon,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
}: BannerProps) {
  const Icon = icon ?? TONE_ICON[tone];
  const styles = TONE_STYLES[tone];

  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-[12px] px-3.5 py-3"
      style={{
        background: styles.background,
        border: styles.border,
      }}
    >
      <Icon
        size={16}
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        style={{ color: styles.foreground }}
      />
      <div className="min-w-0 flex-1 text-[12.5px] leading-[1.45] text-d2-ink/75">
        {title && (
          <div
            className="mb-0.5 text-[13px] font-semibold text-d2-ink"
            style={{ color: 'var(--d2-ink)' }}
          >
            {title}
          </div>
        )}
        <div>{body}</div>
        {actions && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {actions}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-d2-ink/50 transition-colors hover:bg-d2-ink/5"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
