import Link from 'next/link';
import { Bell, ChevronLeft } from 'lucide-react';

export interface PPMobileAppBarProps {
  title: string;
  /** Optional sub-line below the title, e.g. "Thursday, 22 Apr". */
  sub?: string;
  /** Optional kicker mono crumb shown above the title (e.g. "POOLS"). */
  crumb?: string;
  /** Show a back chevron. When set, the brand glyph is replaced by the chevron. */
  back?: { href: string; label: string };
}

/**
 * Mobile-only top app bar. Mirrors the design's `MWAppBar` from
 * `member-mobile.jsx`: a thin header with the brand glyph (or a back
 * chevron when applicable), the title + crumb, and a bell affordance on
 * the right. Visible only `<md` (768px) and gated by `<PPShell>` so it
 * sits *inside* the cream main panel and respects the safe-area inset.
 */
export function PPMobileAppBar({ title, sub, crumb, back }: PPMobileAppBarProps) {
  return (
    <header
      className="flex shrink-0 items-center gap-2.5 border-b bg-d2-warm-bg px-4 py-2.5 md:hidden"
      style={{ borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)' }}
    >
      {back ? (
        <Link
          href={back.href}
          aria-label={back.label}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-d2-ink/70"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span
          className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-[11px] font-bold text-white"
          style={{
            background:
              'linear-gradient(135deg, var(--d2-accent), var(--d2-lav))',
          }}
          aria-hidden="true"
        >
          P
        </span>
      )}
      <div className="min-w-0 flex-1">
        {crumb && (
          <div className="kicker-mono text-[10px] tracking-[0.06em] text-d2-ink/55">
            {crumb}
          </div>
        )}
        <div className="truncate text-[15px] font-semibold tracking-tight text-d2-ink">
          {title}
        </div>
        {sub && <div className="text-[11px] text-d2-ink/55">{sub}</div>}
      </div>
      {/* TODO(slice 6): wire the notifications dropdown. */}
      <button
        type="button"
        disabled
        aria-label="Notifications (coming soon)"
        title="Notifications (coming soon)"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-d2-ink/5 text-d2-ink/65 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Bell size={15} aria-hidden="true" />
      </button>
    </header>
  );
}
