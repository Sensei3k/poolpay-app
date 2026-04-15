import { LogOut } from 'lucide-react';
import { signOutAction } from '@/app/signout/actions';

// Server Component — pure markup + server-action form. Tailwind classes are
// inlined rather than pulled from `buttonVariants()` because the button
// primitive is marked `"use client"`, and importing a client helper into a
// server component trips a Turbopack resolver bug under dev HMR. The class
// string here mirrors `buttonVariants({ variant: "ghost", size: "icon" })`.
const BUTTON_CLASSES = [
  'group/button inline-flex shrink-0 cursor-pointer items-center justify-center',
  'rounded-lg border border-transparent bg-clip-padding text-sm font-medium',
  'whitespace-nowrap transition-all outline-none select-none',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
  'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50',
  'size-8',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' ');

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={BUTTON_CLASSES}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
