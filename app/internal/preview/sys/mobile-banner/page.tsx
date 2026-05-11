import { notFound } from 'next/navigation';
import { DesktopOnlyBanner } from '@/components/super/desktop-only-banner';

/**
 * Dev-only preview of the mobile redirect banner. Used by the
 * screenshot matrix to capture the no-JS / mobile flash state. We do
 * not mount this inside `<PPShell>` because the production flow
 * redirects the route before the shell renders on mobile.
 */
export default function SysMobileBannerPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <main className="flex min-h-screen items-center justify-center bg-d2-warm-bg px-4">
      <DesktopOnlyBanner />
    </main>
  );
}
