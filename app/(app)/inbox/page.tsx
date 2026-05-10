import { fetchInbox } from '@/lib/data';
import { InboxView } from '@/components/member/inbox-view';

export const metadata = {
  title: 'Inbox · PoolPay',
  description: 'Pool notifications, payment confirmations, and admin messages.',
};

export default async function InboxPage() {
  const result = await fetchInbox();
  return <InboxView items={result.data} />;
}
