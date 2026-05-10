import { notFound } from 'next/navigation';
import { PayView } from '@/components/member/pay-view';
import { getMemberPoolDetailFixture } from '@/lib/preview/member-fixtures';
import { MemberPreviewChrome } from '../_chrome';

export default function MemberPayPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const { detail } = getMemberPoolDetailFixture();
  return (
    <MemberPreviewChrome
      current="pools"
      title="Pay contribution"
      crumbs="Pools / Lagos Rent Q2 / Pay"
      hideMobileTabBar
      mobileAppBar={{
        crumb: 'POOLS / PAY',
        back: { href: '/pools/pool-lagos-rent', label: 'Back to pool' },
      }}
    >
      <PayView detail={detail} />
    </MemberPreviewChrome>
  );
}
