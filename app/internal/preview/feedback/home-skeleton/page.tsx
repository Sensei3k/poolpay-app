import { notFound } from 'next/navigation';
import { HomeSkeleton } from '@/components/member/home-skeleton';
import { MemberPreviewChrome } from '../../member/_chrome';

/**
 * Dev-only preview of the `/home` loading skeleton. Real consumer is
 * `app/(app)/home/loading.tsx`, which only renders for a flash during
 * route transitions, so the screenshot pass uses this dedicated route
 * to capture the artboard in light + dark. Production builds 404 this
 * route via the standard preview gate.
 */
export default function HomeSkeletonPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <MemberPreviewChrome current="home" title="Home" sub="Loading state">
      <HomeSkeleton />
    </MemberPreviewChrome>
  );
}
