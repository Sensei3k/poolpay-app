import type { ReactNode } from "react";

import { PoolPayLogo } from "@/components/brand/poolpay-logo";

interface SignInCardProps {
  children: ReactNode;
}

export function SignInCard({ children }: SignInCardProps) {
  return (
    <div className="w-full max-w-[420px] lg:max-w-[360px]">
      <div className="mb-6 flex justify-center sm:mb-7 lg:hidden">
        <PoolPayLogo variant="wordmark" size="md" />
      </div>
      <div className="bg-card border-border rounded-2xl border p-6 shadow-md sm:p-9 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        {/*
          Handoff specifies Instrument Serif 32px for this headline. The
          codebase has no serif face loaded yet (Geist sans + Geist mono
          only), so we hold the editorial sans-semibold treatment that
          FE-5 shipped and bump the size + relax weight toward the spec.
          A future "load Instrument Serif" change will swing this and
          the editorial-panel headline to font-serif in one sweep — see
          the slice-1 PR body for the typography divergence note.
        */}
        <h1 className="text-foreground text-[1.625rem] font-semibold leading-[1.1] tracking-tight lg:text-[1.875rem]">
          Sign in to PoolPay
        </h1>
        <p className="text-muted-foreground mt-2 text-[0.84rem] leading-relaxed">
          Use your organisation account to manage your ajo groups.
        </p>
        <div className="mt-5">{children}</div>
        <p className="text-muted-foreground border-border mt-6 border-t pt-4 text-center text-[0.72rem] leading-relaxed">
          By signing in you agree to the{" "}
          <span className="text-foreground decoration-foreground/25 underline underline-offset-2">
            Terms
          </span>{" "}
          and{" "}
          <span className="text-foreground decoration-foreground/25 underline underline-offset-2">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
