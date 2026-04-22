import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Success state shown after a password change.
 *
 * `ChangePasswordForm` swaps its form body for this component; page-level
 * chrome (AppNav, breadcrumbs, page header) still renders around it. The CTA
 * links to `/signin?passwordChanged=1` so the sign-in page can surface a
 * confirmation banner.
 */
export function SuccessSurface() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <span className="mb-6 inline-flex size-14 items-center justify-center rounded-full bg-ajo-paid-subtle text-ajo-paid">
          <Check className="size-6" strokeWidth={2.25} aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">
          Password updated
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          For your security, you&apos;ve been signed out everywhere. Sign in
          again to continue.
        </p>
        <Link
          href="/signin?passwordChanged=1"
          className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
