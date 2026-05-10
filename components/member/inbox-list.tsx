'use client';

import {
  AlertCircle,
  CheckCircle2,
  HandCoins,
  MessageSquare,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import type { InboxItem, InboxItemKind, InboxTone } from '@/lib/types';
import { useInboxFilterStore } from '@/lib/stores/inbox-filter';
import { cn } from '@/lib/utils';

export interface InboxListProps {
  items: ReadonlyArray<InboxItem>;
}

const KIND_ICON: Record<InboxItemKind, LucideIcon> = {
  receipt_confirmed: CheckCircle2,
  cycle_starting: UserPlus,
  payout_scheduled: HandCoins,
  admin_message: MessageSquare,
  overdue: AlertCircle,
};

const KIND_TONE: Record<InboxItemKind, InboxTone> = {
  receipt_confirmed: 'paid',
  cycle_starting: 'muted',
  payout_scheduled: 'accent',
  admin_message: 'muted',
  overdue: 'out',
};

const TONE_STYLES: Record<InboxTone, { background: string; color: string }> = {
  paid: {
    background: 'var(--ajo-paid-subtle)',
    color: 'var(--ajo-paid)',
  },
  pending: {
    background: 'var(--ajo-outstanding-subtle)',
    color: 'var(--ajo-outstanding)',
  },
  out: {
    background: 'color-mix(in oklch, var(--destructive) 12%, transparent)',
    color: 'var(--destructive)',
  },
  accent: {
    background: 'var(--d2-accent-soft)',
    color: 'var(--d2-accent)',
  },
  muted: {
    background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
    color: 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
  },
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const now = Date.now();
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.round(days / 30);
  return `${months}mo`;
}

/**
 * Inbox list — reads the filter chip from the Zustand store and renders
 * the filtered items. Keeps the row markup a single component so the
 * desktop and mobile chrome see the same elements.
 */
export function InboxList({ items }: InboxListProps) {
  const filter = useInboxFilterStore((s) => s.filter);

  const visible = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return item.readAt === undefined;
    return item.kind === 'admin_message';
  });

  if (visible.length === 0) {
    return (
      <div
        className="rounded-[14px] bg-d2-cream p-6 text-center text-[13px] text-d2-ink/65"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        Nothing to show. Switch filter, or check back later.
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-[14px] bg-d2-cream"
      style={{
        border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      }}
    >
      <ul aria-label="Inbox" className="flex flex-col">
        {visible.map((item, i) => {
          const Icon = KIND_ICON[item.kind];
          const tone = KIND_TONE[item.kind];
          const toneStyles = TONE_STYLES[tone];
          const isUnread = item.readAt === undefined;
          const isLast = i === visible.length - 1;
          return (
            <li
              key={item.id}
              data-tone={isUnread ? tone : null}
              className={cn(
                isUnread && 'status-row',
                'grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3.5',
                !isLast && 'border-b',
              )}
              style={{
                borderColor:
                  'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              }}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px]"
                style={toneStyles}
                aria-hidden="true"
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <div
                  className={cn(
                    'truncate text-[14px]',
                    isUnread ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {item.title}
                </div>
                <div className="truncate text-[12px] text-d2-ink/55">
                  {item.body}
                </div>
              </div>
              <span className="font-mono text-[11px] text-d2-ink/50">
                {formatRelative(item.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
