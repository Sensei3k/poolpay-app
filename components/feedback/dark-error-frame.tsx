import type { ReactNode } from 'react';
import { PoolPayLogo } from '@/components/brand/poolpay-logo';

export interface DarkErrorFrameProps {
  /** Pill copy in the page header, e.g. "HTTP 500 · server error". */
  status: ReactNode;
  /** Kicker shown above the headline. Single line, uppercase wash. */
  kicker: string;
  /**
   * Hero numeral block (e.g. `404`, `500`) OR an icon node (e.g. `<WifiOff />`).
   * Rendered above the kicker as the page's visual anchor.
   */
  glyph: ReactNode;
  /**
   * Headline. Accepts nodes so callers can wrap the accent phrase in
   * `<em className="text-ajo-paid not-italic">…</em>`.
   */
  headline: ReactNode;
  /** Body paragraph below the headline. Optional. */
  body?: ReactNode;
  /** Action row — `[primary, secondary]` or `[primary]`. Optional. */
  actions?: ReactNode;
}

/**
 * Dark editorial error frame (`Err404` / `Err500` / `ErrOffline` artboards).
 * Wraps the wordmark + status pill header, the centered hero block, and
 * the decorative ring SVGs into a single primitive so the three error
 * surfaces stay visually identical.
 *
 * Pages compose this primitive — they don't extend it. New error
 * variants should pass their own glyph + copy and avoid copying the
 * chrome inline.
 */
export function DarkErrorFrame({
  status,
  kicker,
  glyph,
  headline,
  body,
  actions,
}: DarkErrorFrameProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background font-sans text-foreground dark:bg-[#0a0a0a]">
      <header className="relative z-[2] flex items-center justify-between px-6 pt-6 md:px-[72px] md:pt-10">
        <PoolPayLogo variant="wordmark" size="md" />
        <StatusPill>{status}</StatusPill>
      </header>

      <main
        id="main-content"
        className="relative z-[2] flex flex-1 items-center justify-center px-6 pb-6 pt-10 md:px-[72px] md:pb-[72px] md:pt-10"
      >
        <div className="flex w-full max-w-[640px] flex-col items-center text-center">
          <div
            className="mb-6 inline-flex flex-col items-center md:mb-8"
            aria-hidden="true"
          >
            {glyph}
            <span className="bg-ajo-paid mt-1.5 block h-0.5 w-11 md:h-[3px] md:w-16" />
          </div>

          <p className="text-ajo-paid mb-3.5 font-mono text-[10.5px] uppercase tracking-[0.1em] md:mb-4 md:text-[11px] md:tracking-[0.08em]">
            {kicker}
          </p>

          <h1 className="mb-3.5 max-w-[15ch] text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] text-balance md:mb-[18px] md:max-w-[18ch] md:text-[44px] md:leading-[1.05] md:tracking-[-0.035em]">
            {headline}
          </h1>

          {body && (
            <p className="text-muted-foreground mb-6 max-w-[52ch] text-sm leading-[1.55] md:mb-9 md:text-[15.5px] md:leading-[1.6]">
              {body}
            </p>
          )}

          {actions && (
            <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row md:justify-center">
              {actions}
            </div>
          )}
        </div>
      </main>

      <DecorativeRings />
    </div>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-[5px] font-mono text-[11px] tracking-[0.04em] text-muted-foreground dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-[oklch(0.7_0_0)]">
      <span className="h-1.5 w-1.5 rounded-full bg-ajo-paid" />
      {children}
    </span>
  );
}

function DecorativeRings() {
  return (
    <>
      {/* Mobile: smaller, further off-canvas */}
      <svg
        viewBox="0 0 720 720"
        aria-hidden="true"
        className="pointer-events-none absolute right-[-420px] top-1/2 h-[520px] w-[520px] -translate-y-1/2 opacity-[0.45] md:hidden"
      >
        <RingPaths />
      </svg>
      {/* Desktop */}
      <svg
        viewBox="0 0 720 720"
        aria-hidden="true"
        className="pointer-events-none absolute right-[-260px] top-1/2 hidden h-[900px] w-[900px] -translate-y-1/2 opacity-90 md:block"
      >
        <RingPaths />
      </svg>
    </>
  );
}

function RingPaths() {
  return (
    <>
      <circle
        cx="360"
        cy="360"
        r="340"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <circle
        cx="360"
        cy="360"
        r="280"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <circle
        cx="360"
        cy="360"
        r="220"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.22"
      />
      <circle
        cx="360"
        cy="360"
        r="160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <circle
        cx="360"
        cy="360"
        r="100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.22"
      />
      <circle cx="360" cy="360" r="46" className="fill-ajo-paid" />
    </>
  );
}
