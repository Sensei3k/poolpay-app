import { MonitorSmartphone } from 'lucide-react';

export interface MobileReadonlyPromptProps {
  /** Human label for the tab the admin tapped on (e.g. "Settings"). */
  tabLabel: string;
  /**
   * One-line explanation of why this surface is desktop-only.
   * Falls back to a generic message when omitted.
   */
  reason?: string;
}

/**
 * Mobile-only "open on desktop to edit" prompt. Surfaces on group tabs
 * that require configuration affordances which don't fit on mobile
 * (Settings, Members, Cycles per `MOBILE_BLOCKED_TABS`). Admins on
 * mobile still see the title bar + tab strip so they know where they
 * are; the body is replaced by this card.
 *
 * Renders at all viewports, the parent gates it to `<md` via Tailwind
 * (the card itself doesn't try to be responsive).
 */
export function MobileReadonlyPrompt({
  tabLabel,
  reason,
}: MobileReadonlyPromptProps) {
  const message =
    reason ??
    'This tab needs more room than mobile gives. Open PoolPay on desktop to make changes here.';
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-[14px] border bg-surface-card px-5 py-7 text-center"
      style={{
        borderColor: 'color-mix(in oklch, var(--ink) 8%, transparent)',
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full"
        style={{
          background: 'color-mix(in oklch, var(--ink) 5%, transparent)',
        }}
      >
        <MonitorSmartphone size={18} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-[14px] font-semibold tracking-tight text-ink">
          {tabLabel} · desktop only
        </h2>
        <p className="text-[12.5px] leading-snug text-ink/65">{message}</p>
      </div>
      <p className="font-mono text-[10px] text-ink/45">
        triage on mobile · configure on desktop
      </p>
    </div>
  );
}
