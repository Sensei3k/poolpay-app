import type { ReactNode } from "react";

import { PoolPayLogo } from "@/components/brand/poolpay-logo";

interface SignInCardProps {
  children: ReactNode;
}

export function SignInCard({ children }: SignInCardProps) {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-6 flex justify-center sm:mb-7">
        <PoolPayLogo variant="wordmark" size="sm" />
      </div>
      <div className="bg-card border-border rounded-2xl border p-6 shadow-md sm:p-9">
        <h1 className="text-foreground text-[1.375rem] leading-tight font-semibold tracking-tight">
          Sign in to PoolPay
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
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
