import Link from "next/link";
import { PoolPayLogo } from "@/components/brand/poolpay-logo";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { SignOutButton } from "@/components/dashboard/signout-button";
import type { Role } from "@/lib/auth/verify-credentials";

const ADMIN_ROLES: ReadonlyArray<Role> = ["admin", "super_admin"];

interface AppNavProps {
  role: Role;
}

export function AppNav({ role }: AppNavProps) {
  const showAdmin = ADMIN_ROLES.includes(role);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-foreground transition-colors hover:text-foreground/80"
          aria-label="PoolPay home"
        >
          <PoolPayLogo variant="wordmark" size="sm" />
        </Link>

        <div className="flex items-center gap-2">
          {showAdmin && (
            <Link
              href="/admin"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          )}
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
