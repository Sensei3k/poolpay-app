import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DesktopOnlyBanner } from '@/components/super/desktop-only-banner';
import { SysMobileGuard } from '@/components/super/sys-mobile-guard';

/**
 * Layout guarding the entire `/sys/*` super-admin surface.
 *
 * Two layers:
 *  1. Server-side role gate. Anyone whose session is not
 *     `role === 'super_admin'` redirects to `/home` immediately. The
 *     redirect runs in the server component so unauthenticated
 *     requests never see the route HTML.
 *  2. Client-side mobile guard. Wraps children in `<SysMobileGuard>`,
 *     which redirects to `/home` after a brief explanation when the
 *     viewport is <768px. The no-JS CSS fallback below hides the
 *     children entirely on mobile and surfaces the banner alone, so
 *     users without JS still get a clean message.
 *
 * Slice-4 deviation #4: Next.js middleware cannot read viewport width,
 * so the mobile redirect is a client guard rather than middleware. The
 * CSS fallback covers the SSR-on-mobile flash.
 */
export default async function SysLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }
  if (session.user.role !== 'super_admin') {
    redirect('/home');
  }

  return (
    <>
      {/* No-JS CSS fallback: on mobile widths, hide the route content and
          let only the banner show. The `[data-sys-content]` and
          `[data-sys-fallback]` selectors below toggle the two branches
          rendered next, so the banner appears even when JS is disabled. */}
      <style>
        {`
          @media (max-width: 767px) {
            [data-sys-content] { display: none; }
            [data-sys-fallback] { display: block; }
          }
          @media (min-width: 768px) {
            [data-sys-fallback] { display: none; }
          }
        `}
      </style>
      <main id="main-content">
        <div data-sys-fallback>
          <DesktopOnlyBanner />
        </div>
        <div data-sys-content>
          <SysMobileGuard>{children}</SysMobileGuard>
        </div>
      </main>
    </>
  );
}
