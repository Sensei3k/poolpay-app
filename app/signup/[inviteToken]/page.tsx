import Link from "next/link";
import { PoolPayLogo } from "@/components/brand/poolpay-logo";

interface SignUpInvitePageProps {
  params: Promise<{ inviteToken: string }>;
}

/**
 * Slice-1 stub for `/signup/[inviteToken]`, `AuthSignUp` from the
 * design handoff (vault). Mirrors the editorial split layout: dark
 * left panel with the inviter context, right panel with the
 * create-account form. Real flow lands in slice 4 (verify-invite,
 * create user, grant pool membership atomically).
 *
 * The token is parsed and surfaced in the kicker so manual QA can see
 * it round-trips, but no validation happens here yet.
 */
export default async function SignUpInvitePage({ params }: SignUpInvitePageProps) {
  const { inviteToken } = await params;

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
            Invited · token {inviteToken.slice(0, 8)}
          </p>
          <h2 className="mt-[18px] text-[44px] leading-[1.05] font-semibold tracking-tighter text-balance text-white lg:text-[52px] xl:text-[56px]">
            You&rsquo;ve been invited to{" "}
            <em className="text-status-paid not-italic">an ajo pool</em>, let&rsquo;s
            get you set up.
          </h2>
          <p className="mt-[22px] max-w-[460px] text-[14px] leading-[1.55] text-white/70">
            Pool details, contribution amount, and your starting cycle will be
            confirmed once we verify your invite. This stub renders ahead of
            the slice-4 invite-verification work.
          </p>
        </div>
      </aside>

      <div className="flex w-full items-center justify-center px-5 py-8 sm:px-6 sm:py-12 lg:px-[60px] lg:py-[72px]">
        <div className="w-full max-w-[420px] lg:max-w-[360px]">
          <div className="bg-card border-border rounded-2xl border p-6 shadow-md sm:p-9 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <h1 className="text-foreground text-[1.625rem] font-semibold leading-[1.1] tracking-tight lg:text-[1.875rem]">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-2 text-[0.84rem] leading-relaxed">
              Continue with a provider, or use your phone number. Slice 4 will
              wire the verify-invite call before this form mounts.
            </p>

            <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Stub: signup form</p>
              <p className="mt-2">
                This page will host the social providers, name, phone, and
                optional email fields once the invite-verification flow is
                wired in slice 4.
              </p>
              <p className="mt-2 font-mono text-[11px] tracking-wide text-foreground">
                inviteToken: {inviteToken}
              </p>
            </div>

            <p className="text-muted-foreground mt-6 text-[0.78rem] leading-relaxed">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-foreground decoration-foreground/25 underline underline-offset-2"
              >
                Sign in
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
