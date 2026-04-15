'use client';

import { LogOut } from 'lucide-react';
import { signOutAction } from '@/app/signout/actions';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
