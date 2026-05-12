import Link from "next/link";
import { PoolPayLogo } from "@/components/brand/poolpay-logo";

/**
 * Slice-1 stub for `/recover/verify`, OTP entry (handoff `AuthForgot`,
 * second half). Real flow lands in slice 4: receive 6-digit code,
 * validate via the backend, set a one-shot reset cookie, redirect to
 * the change-password screen.
 *
 * For the slice-1 stub, we render the editorial frame with a static
 * 6-cell skeleton so the layout is captured in the screenshot matrix.
 *
 * **OTP delivery policy (locked 2026-05-10):** WhatsApp-only, no SMS
 * fallback. The slice-4 zod schema validates a single 6-digit numeric
 * code; there is no channel-selector field. A `whatsapp_unreachable`
 * error from the API hard-blocks with a "contact your group admin"
 * message.
 */
const PLACEHOLDER_CELLS = ["·", "·", "·", "·", "·", "·"] as const;

export default function RecoverVerifyPage() {
  return (
    <main
      id="main-content"
      className="bg-background grid min-h-dvh w-full lg:grid-cols-[1fr_480px]"
    >
      <aside className="relative hidden overflow-hidden bg-[#0a0a0a] px-20 py-[72px] text-white lg:flex lg:flex-col">
        <div className="relative z-[2] flex items-center justify-between">
          <PoolPayLogo variant="wordmark" size="md" className="text-white" />
          <span className="font-mono text-[11px] text-white/70">
            est. 2026 · Lagos
          </span>
        </div>

        <div className="relative z-[2] mt-auto max-w-[560px]">
          <p className="text-status-paid font-mono text-[11px] uppercase tracking-[0.18em]">
            Verify it&rsquo;s you
          </p>
          <h2 className="mt-[18px] text-[44px] leading-[1.05] font-semibold tracking-tighter text-balance text-white lg:text-[52px] xl:text-[56px]">
            Check your{" "}
            <em className="text-status-paid not-italic">WhatsApp</em>, we just
            sent a 6-digit code.
          </h2>
          <p className="mt-[22px] max-w-[460px] text-[14px] leading-[1.55] text-white/70">
            Codes expire after 10 minutes. Resend is rate-limited to once per
            minute. Slice 4 wires the actual delivery and validation.
          </p>
          <p className="mt-4 max-w-[460px] text-[12px] leading-[1.55] text-white/55">
            No code? WhatsApp is the only delivery channel, there is no SMS
            fallback. If your number isn&rsquo;t on WhatsApp, contact your
            group admin to recover access.
          </p>
        </div>
      </aside>

      <div className="flex w-full items-center justify-center px-5 py-8 sm:px-6 sm:py-12 lg:px-[60px] lg:py-[72px]">
        <div className="w-full max-w-[420px] lg:max-w-[360px]">
          <div className="bg-card border-border rounded-2xl border p-6 shadow-md sm:p-9 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <h1 className="text-foreground text-[1.625rem] font-semibold leading-[1.1] tracking-tight lg:text-[1.875rem]">
              Verify your code
            </h1>
            <p className="text-muted-foreground mt-2 text-[0.84rem] leading-relaxed">
              Enter the 6-digit code we sent to your WhatsApp.
            </p>

            <div className="mt-6 grid grid-cols-6 gap-2" aria-hidden="true">
              {PLACEHOLDER_CELLS.map((cell, i) => (
                <div
                  key={i}
                  className="bg-muted text-muted-foreground border-border flex aspect-square items-center justify-center rounded-lg border font-mono text-xl"
                >
                  {cell}
                </div>
              ))}
            </div>

            <p className="text-muted-foreground mt-4 text-xs">
              Stub: real OTP input + countdown + resend control land in slice 4.
              Validation is a single 6-digit numeric code, no SMS fallback.
            </p>

            <p className="text-muted-foreground mt-6 text-[0.78rem] leading-relaxed">
              Wrong number?{" "}
              <Link
                href="/recover"
                className="text-foreground decoration-foreground/25 underline underline-offset-2"
              >
                Start over
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
