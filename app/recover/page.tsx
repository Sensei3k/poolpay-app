import Link from "next/link";
import { PoolPayLogo } from "@/components/brand/poolpay-logo";

/**
 * Slice-1 stub for `/recover`, phone-first password recovery (handoff
 * `AuthForgot`, first half). Real implementation lands in slice 4 when
 * the WhatsApp OTP delivery channel is wired.
 *
 * Submit will POST a phone number, the API will deliver a 6-digit code
 * via WhatsApp, then redirect to `/recover/verify`. For now this is a
 * static frame so the route resolves and the editorial layout is
 * captured in the slice-1 screenshot matrix.
 *
 * **OTP delivery policy (locked 2026-05-10):** WhatsApp is the only
 * delivery channel. There is no SMS fallback. If the user's number is
 * not registered with WhatsApp, the slice-4 flow surfaces the
 * "couldn't reach you on WhatsApp, contact your group admin" copy
 * sketched in the editorial panel below.
 */
export default function RecoverPage() {
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
          <p className="text-ajo-paid font-mono text-[11px] uppercase tracking-[0.18em]">
            Reset password
          </p>
          <h2 className="mt-[18px] text-[44px] leading-[1.05] font-semibold tracking-tighter text-balance text-white lg:text-[52px] xl:text-[56px]">
            We&rsquo;ll send a code to your{" "}
            <em className="text-ajo-paid not-italic">WhatsApp</em>.
          </h2>
          <p className="mt-[22px] max-w-[460px] text-[14px] leading-[1.55] text-white/70">
            Phone-first recovery is faster than email and matches how groups
            already coordinate. Codes expire after 10 minutes.
          </p>
          <p className="mt-4 max-w-[460px] text-[12px] leading-[1.55] text-white/55">
            Number not on WhatsApp? We can&rsquo;t reach you that way, contact
            your group admin to recover access.
          </p>
        </div>
      </aside>

      <div className="flex w-full items-center justify-center px-5 py-8 sm:px-6 sm:py-12 lg:px-[60px] lg:py-[72px]">
        <div className="w-full max-w-[420px] lg:max-w-[360px]">
          <div className="bg-card border-border rounded-2xl border p-6 shadow-md sm:p-9 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <h1 className="text-foreground text-[1.625rem] font-semibold leading-[1.1] tracking-tight lg:text-[1.875rem]">
              Recover your account
            </h1>
            <p className="text-muted-foreground mt-2 text-[0.84rem] leading-relaxed">
              Enter the phone number tied to your account. We&rsquo;ll send a
              6-digit code via WhatsApp. WhatsApp is the only delivery
              channel, there is no SMS fallback.
            </p>

            <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Stub: phone form</p>
              <p className="mt-2">
                Slice 4 wires the phone input + WhatsApp OTP delivery and
                redirects to <code>/recover/verify</code> on success. If the
                number isn&rsquo;t registered on WhatsApp the API returns{" "}
                <code>whatsapp_unreachable</code> and we render the
                &ldquo;contact your group admin&rdquo; error state.
              </p>
            </div>

            <p className="text-muted-foreground mt-6 text-[0.78rem] leading-relaxed">
              Remembered it?{" "}
              <Link
                href="/signin"
                className="text-foreground decoration-foreground/25 underline underline-offset-2"
              >
                Back to sign in
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
