import type { ReactNode } from 'react';

export type EmptyStateTone = 'gradient' | 'muted' | 'dashed';

export interface EmptyStateProps {
  /**
   * The decorative icon node, e.g. `<UsersRound size={32} />`. Wrapped in
   * an aria-hidden tile by this primitive so callers don't need to repeat
   * the swatch chrome.
   */
  icon: ReactNode;
  /** Headline. Renders as `<h2>` or `<h3>` depending on `headingLevel`. */
  title: string;
  /** Supporting copy. Optional. Accepts nodes so callers can embed `<em>`. */
  description?: ReactNode;
  /**
   * Primary + secondary CTAs. Both optional. Callers compose existing
   * buttons; this primitive does not impose a button variant of its own.
   */
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  /**
   * Optional footer node: a hint banner, inline help, etc. Sits below the
   * action row so empty states can teach as well as redirect.
   */
  footer?: ReactNode;
  /**
   * Visual treatment for the icon tile.
   * - `gradient`: brand gradient (member-facing, welcoming).
   * - `muted`: subtle ink tint (inbox, neutral context).
   * - `dashed`: dashed container (sys-admin, "setup needed").
   */
  tone?: EmptyStateTone;
  /**
   * Headline tag. Pages with their own `<h1>` should pass `h3` so the
   * empty state sits below as a section title. Member /home passes `h2`.
   */
  headingLevel?: 'h2' | 'h3';
  /** Optional aria-label override for the root region. */
  ariaLabel?: string;
}

const ICON_TILE_STYLES: Record<EmptyStateTone, string> = {
  gradient:
    'h-[72px] w-[72px] rounded-[18px] text-white shadow-[0_12px_30px_-8px_color-mix(in_oklch,var(--d2-accent)_50%,transparent)]',
  muted: 'h-14 w-14 rounded-[14px] text-d2-ink/60',
  dashed: 'h-12 w-12 rounded-[12px] text-d2-ink/55',
};

const ICON_TILE_BG: Record<EmptyStateTone, string> = {
  gradient: 'linear-gradient(135deg, var(--d2-accent), var(--d2-lav))',
  muted: 'color-mix(in oklch, var(--d2-ink) 5%, transparent)',
  dashed: 'transparent',
};

const TITLE_STYLES: Record<'h2' | 'h3', string> = {
  h2: 'text-[22px] font-semibold tracking-tight text-d2-ink',
  h3: 'text-[17px] font-semibold text-d2-ink',
};

/**
 * Composable empty-state primitive. Mirrors the three artboards in
 * `missing-screens.jsx` (EmptyMember, EmptyInbox, EmptyAdmins) by
 * parameterising tone + heading level. New empty states should compose
 * this primitive rather than re-implement the chrome.
 *
 * Why this lives in `components/feedback/` and not `components/ui/`:
 * `components/ui/` is the shadcn scaffold. The empty-state shape is
 * project-specific (the d2 tokens, the gradient tile, the dashed border
 * tone), so it sits one layer above the shadcn primitives without
 * extending or replacing them.
 */
export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  footer,
  tone = 'muted',
  headingLevel = 'h3',
  ariaLabel,
}: EmptyStateProps) {
  const HeadingTag = headingLevel;
  const isDashed = tone === 'dashed';

  return (
    <section
      role="status"
      aria-label={ariaLabel}
      className={
        isDashed
          ? 'rounded-[14px] p-[48px_32px] text-center'
          : 'flex items-center justify-center px-0 py-8'
      }
      style={
        isDashed
          ? {
              border: '1px dashed color-mix(in oklch, var(--d2-ink) 18%, transparent)',
            }
          : undefined
      }
    >
      <div className={isDashed ? 'mx-auto max-w-[440px]' : 'max-w-[440px] text-center'}>
        <div
          aria-hidden="true"
          className={`mx-auto mb-4 inline-flex items-center justify-center ${ICON_TILE_STYLES[tone]}`}
          style={{ background: ICON_TILE_BG[tone] }}
        >
          {icon}
        </div>
        <HeadingTag className={`mb-2 ${TITLE_STYLES[headingLevel]}`}>
          {title}
        </HeadingTag>
        {description && (
          <p className="mb-5 text-[13.5px] leading-[1.5] text-d2-ink/60">
            {description}
          </p>
        )}
        {(primaryAction || secondaryAction) && (
          <div className="mb-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
        {footer}
      </div>
    </section>
  );
}
