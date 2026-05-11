import { Inbox } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';

/**
 * Empty inbox state (handoff `EmptyInbox` artboard). Rendered by the
 * inbox list when the filter resolves to zero items AND there are zero
 * items overall. The filter-aware "nothing to show" copy stays on the
 * list itself so the two states read differently.
 */
export function EmptyInbox() {
  return (
    <EmptyState
      ariaLabel="Inbox is empty"
      tone="muted"
      headingLevel="h3"
      icon={<Inbox size={24} />}
      title="You're all caught up."
      description="Receipt confirmations, payout reminders, and admin messages will appear here."
    />
  );
}
