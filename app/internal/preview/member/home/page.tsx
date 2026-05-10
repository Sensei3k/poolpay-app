import { notFound } from 'next/navigation';
import { HomeView } from '@/components/member/home-view';
import { getMemberHomeFixture } from '@/lib/preview/member-fixtures';
import { MemberPreviewChrome } from '../_chrome';

export default function MemberHomePreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const fixture = getMemberHomeFixture();
  return (
    <MemberPreviewChrome current="home" title="Home" showQuickPay>
      <HomeView
        aggregates={fixture.aggregates}
        pools={fixture.pools}
        nextPayoutLabel={fixture.nextPayoutLabel}
        todayLabel={fixture.todayLabel}
      />
    </MemberPreviewChrome>
  );
}
