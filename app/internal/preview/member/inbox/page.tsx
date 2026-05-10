import { notFound } from 'next/navigation';
import { InboxView } from '@/components/member/inbox-view';
import { getMemberInboxFixture } from '@/lib/preview/member-fixtures';
import { MemberPreviewChrome } from '../_chrome';

export default function MemberInboxPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const { items } = getMemberInboxFixture();
  return (
    <MemberPreviewChrome current="inbox" title="Inbox">
      <InboxView items={items} />
    </MemberPreviewChrome>
  );
}
