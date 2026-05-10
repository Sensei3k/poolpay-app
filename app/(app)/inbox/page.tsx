import { fetchInbox } from '@/lib/data';
import { InboxFilterChips } from '@/components/member/inbox-filter-chips';
import { InboxList } from '@/components/member/inbox-list';

export const metadata = {
  title: 'Inbox · PoolPay',
  description: 'Pool notifications, payment confirmations, and admin messages.',
};

export default async function InboxPage() {
  const result = await fetchInbox();
  const items = result.data;
  const unreadCount = items.filter((item) => item.readAt === undefined).length;

  return (
    <main
      id="main-content"
      aria-labelledby="inbox-title"
      className="mx-auto flex max-w-[720px] flex-col gap-3"
    >
      <header className="flex flex-col gap-3 md:gap-2">
        <div className="hidden md:block">
          <p className="kicker-mono text-[10px]">Notifications</p>
          <h1
            id="inbox-title"
            className="mt-1 text-[1.5rem] font-semibold tracking-tight text-d2-ink"
          >
            Inbox
          </h1>
          <p className="mt-1 text-[13px] text-d2-ink/55">
            {items.length} {items.length === 1 ? 'item' : 'items'} · {unreadCount}{' '}
            unread
          </p>
        </div>
        <h1 id="inbox-title" className="sr-only md:hidden">
          Inbox
        </h1>
        <InboxFilterChips />
      </header>
      <InboxList items={items} />
    </main>
  );
}
