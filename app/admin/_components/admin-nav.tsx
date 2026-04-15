import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SignOutButton } from '@/components/dashboard/signout-button';

export function AdminNav() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tighter text-foreground">Admin</h1>
        <SignOutButton />
      </div>
      <Separator className="mt-6 bg-border" />
    </div>
  );
}
