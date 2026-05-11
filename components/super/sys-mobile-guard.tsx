'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DesktopOnlyBanner } from './desktop-only-banner';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

/**
 * Client-side mobile redirect for `/sys/*` (HANDOFF §8: "Super-admin is
 * desktop-only. On mobile, super-admin routes redirect to `/home` with
 * a banner.")
 *
 * Implementation choice (slice-4 deviation #4): Next.js middleware
 * cannot see viewport width directly, so the redirect runs in a layout
 * client component. The no-JS CSS fallback in the layout adds a
 * `@media (max-width: 767px)` rule that hides the route's main content
 * and shows only this banner, so users without JS still get a clear
 * message instead of a broken layout.
 *
 * The component reports its `state` via children render prop semantics
 * implemented as two slots: when mobile, it renders only the banner;
 * when desktop, it renders the children. The state flips synchronously
 * before the first paint via `useState` initializer so users do not
 * see a flash of the desktop layout on mobile.
 */
export interface SysMobileGuardProps {
  children: React.ReactNode;
}

function detectInitialMobile(): boolean {
  // SSR safety: server has no `window`, so default to false (desktop).
  // The no-JS CSS fallback covers the SSR-on-mobile case independently.
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

export function SysMobileGuard({ children }: SysMobileGuardProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(detectInitialMobile);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Fire the navigation only after the banner has had a frame to
    // paint, otherwise users on a slow mobile connection see a
    // blank page during the route transition with no explanation.
    if (!isMobile) return;
    const timer = window.setTimeout(() => router.replace('/home'), 600);
    return () => window.clearTimeout(timer);
  }, [isMobile, router]);

  if (isMobile) {
    return <DesktopOnlyBanner />;
  }
  return <>{children}</>;
}
