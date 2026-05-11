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

      <div className="relative z-[2] mt-auto max-w-[500px]">
        <p className="text-ajo-paid font-mono text-[11px] tracking-[0.08em] uppercase">
          A new kind of ajo
        </p>
        <h2 className="mt-[18px] text-[44px] leading-[1.05] font-semibold tracking-tighter text-balance text-white">
          Money you pool together{" "}
          <em className="text-ajo-paid not-italic">should feel</em> like money
          you trust together.
        </h2>
        <p className="mt-[18px] max-w-[440px] text-[15px] leading-[1.6] text-white/70">
          Cooperative finance, instrumented. Built for the way real groups
          already work — not a Silicon Valley reinvention of one.
        </p>
      </div>

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
