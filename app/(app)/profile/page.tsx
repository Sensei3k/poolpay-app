import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProfileView } from '@/components/member/profile-view';

export const metadata = {
  title: 'Profile · PoolPay',
  description: 'Profile and security settings.',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/signin');
  }

  const { name, email, role } = session.user;
  const displayName = name?.trim() || email || 'Member';

  return (
    <ProfileView displayName={displayName} email={email ?? ''} role={role} />
  );
}
