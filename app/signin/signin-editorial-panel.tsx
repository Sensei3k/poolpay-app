import { PoolPayLogo } from "@/components/brand/poolpay-logo";

export function SignInEditorialPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#0a0a0a] px-20 py-[72px] text-white lg:flex lg:flex-col">
      <div className="relative z-[2] flex items-center justify-between">
        <PoolPayLogo variant="wordmark" size="md" className="text-white" />
        <span className="font-mono text-[11px] text-white/70">
          est. 2026 · Lagos
        </span>
      </div>

      <div className="relative z-[2] mt-auto max-w-[560px]">
        {/* Kicker, handoff: 11px, tracking 0.18em. We use 0.18em to match. */}
        <p className="text-ajo-paid font-mono text-[11px] tracking-[0.18em] uppercase">
          A new kind of ajo
        </p>
        {/*
          Headline. Handoff: Instrument Serif 56px, weight 400.
          Until the serif face is loaded (see PR body, typography
          divergence), we hold sans semibold and step the size from 44 →
          52 → 56 across breakpoints so the editorial weight scales with
          the viewport.
        */}
        <h2 className="mt-[18px] text-[44px] leading-[1.05] font-semibold tracking-tighter text-balance text-white lg:text-[52px] xl:text-[56px]">
          Money you pool together{" "}
          <em className="text-ajo-paid not-italic">should feel</em> like money
          you trust together.
        </h2>
        <p className="mt-[22px] max-w-[460px] text-[14px] leading-[1.55] text-white/70">
          Cooperative finance, instrumented. Built for the way real groups
          already work, not a Silicon Valley reinvention of one.
        </p>
      </div>

      {/*
        N-mark glyph, bottom-left under the headline. Handoff specs a
        small "N" in a thin-bordered circle for editorial finish. It's
        purely decorative; aria-hidden keeps it out of the a11y tree.
      */}
      <span
        aria-hidden="true"
        className="absolute bottom-9 left-20 z-[2] inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/[0.18] font-mono text-[11px] text-white/60"
      >
        N
      </span>

      <svg
        aria-hidden="true"
        viewBox="0 0 720 720"
        className="pointer-events-none absolute top-1/2 -right-[180px] h-[720px] w-[720px] -translate-y-1/2 opacity-90"
      >
        <circle
          cx="360"
          cy="360"
          r="340"
          fill="none"
          stroke="rgb(255 255 255 / 0.06)"
        />
        <circle
          cx="360"
          cy="360"
          r="280"
          fill="none"
          stroke="rgb(255 255 255 / 0.06)"
        />
        <circle
          cx="360"
          cy="360"
          r="220"
          fill="none"
          stroke="rgb(255 255 255 / 0.12)"
        />
        <circle
          cx="360"
          cy="360"
          r="160"
          fill="none"
          stroke="rgb(255 255 255 / 0.06)"
        />
        <circle
          cx="360"
          cy="360"
          r="100"
          fill="none"
          stroke="rgb(255 255 255 / 0.12)"
        />
        <circle cx="360" cy="360" r="46" className="fill-ajo-paid" />
      </svg>
    </aside>
  );
}
