import { notFound } from 'next/navigation';
import { PoolDetailView } from '@/components/member/pool-detail-view';
import { getMemberPoolDetailFixture } from '@/lib/preview/member-fixtures';
import { MemberPreviewChrome } from '../_chrome';

export default function MemberPoolPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const { detail } = getMemberPoolDetailFixture();
  return (
    <MemberPreviewChrome
      current="pools"
      title={detail.pool.name}
      crumbs="Pools / Lagos Rent Q2"
      sub={detail.metaLine}
      showQuickPay
      mobileAppBar={{
        crumb: 'POOLS',
        back: { href: '/home', label: 'Back to home' },
      }}
    >
      <PoolDetailView detail={detail} />
    </MemberPreviewChrome>
  );
}
