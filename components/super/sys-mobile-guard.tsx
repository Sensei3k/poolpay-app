'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { DesktopOnlyBanner } from './desktop-only-banner';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

/**
 * `useSyncExternalStore` returns the server snapshot during SSR and the
 * initial client render, then subscribes to the media query for live
 * updates. The server snapshot is `false` (desktop) so SSR markup
 * matches the first client render. The CSS no-JS fallback in the
 * layout prevents a flash of desktop content on mobile viewports.
 */
function subscribeToMediaQuery(callback: () => void): () => void {
  const mql = window.matchMedia(MOBILE_BREAKPOINT);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getMobileSnapshot(): boolean {
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

function getMobileServerSnapshot(): boolean {
  return false;
}

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
 * when desktop, it renders the children. `useSyncExternalStore` returns
 * `false` (desktop) on both server and first client render to avoid a
 * hydration mismatch, then resubscribes to the real media query after
 * mount. The no-JS CSS fallback in the layout already hides the desktop
 * content on mobile viewports, so users on mobile never see a flash of
 * the desktop layout despite the deferred JS check.
 */
export interface SysMobileGuardProps {
  children: React.ReactNode;
}

export function SysMobileGuard({ children }: SysMobileGuardProps) {
  const router = useRouter();
  const isMobile = useSyncExternalStore(
    subscribeToMediaQuery,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

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
