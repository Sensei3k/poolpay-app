import { notFound } from 'next/navigation';
import { ProfileView } from '@/components/member/profile-view';
import { getMemberProfileFixture } from '@/lib/preview/member-fixtures';
import { MemberPreviewChrome } from '../_chrome';

export default function MemberProfilePreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const { displayName, email } = getMemberProfileFixture();
  return (
    <MemberPreviewChrome current="settings" title="Profile">
      <ProfileView displayName={displayName} email={email} role="member" />
    </MemberPreviewChrome>
  );
}
