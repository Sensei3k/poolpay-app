import type { InboxItem } from '@/lib/types';
import { EmptyInbox } from '@/components/member/empty-inbox';
import { InboxFilterChips } from '@/components/member/inbox-filter-chips';
import { InboxList } from '@/components/member/inbox-list';

export interface InboxViewProps {
  items: ReadonlyArray<InboxItem>;
}

/**
 * Presentational `/inbox` view. The chip + list pair is a client
 * subtree; the surrounding header is server-renderable.
 *
 * When the inbox is fully empty (no items at all) we render the
 * `<EmptyInbox>` artboard and skip the filter chips. The filter chips
 * only earn their keep once there's something to filter; an "all / unread
 * / admin" trio over an empty list is just noise.
 */
export function InboxView({ items }: InboxViewProps) {
  const unreadCount = items.filter((item) => item.readAt === undefined).length;
  const hasItems = items.length > 0;
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
        {hasItems && <InboxFilterChips />}
      </header>
      {hasItems ? <InboxList items={items} /> : <EmptyInbox />}
    </main>
  );
}
