import { CheckCircle2 } from 'lucide-react';
import type { InboxItem } from '@/lib/types';

export interface ReceiptConfirmedItemProps {
  /**
   * Inbox row to render. The caller must guarantee `kind ===
   * 'receipt_confirmed'`; the component does not narrow that itself so
   * it can be composed into a generic per-kind renderer without
   * duplicating the narrowing in two places.
   */
  item: InboxItem;
}

/**
 * Renders an inbox row for the `receipt_confirmed` kind, the BE
 * populates one of these on every successful confirm in the
 * `inbox_item` table (poolpay-api PR #46).
 *
 * The body string is operator-supplied free text (it includes the
 * admin's note when present), so it is rendered as a plain text node.
 * Never reach for `dangerouslySetInnerHTML` here: per the BE security
 * audit finding #3, no part of the WhatsApp pipeline is allowed to
 * render attacker-controlled content as HTML.
 */
export function ReceiptConfirmedItem({ item }: ReceiptConfirmedItemProps) {
  const isUnread = item.readAt === undefined;

  return (
    <article
      aria-label="Receipt confirmed"
      data-tone={isUnread ? 'paid' : null}
      className="flex items-start gap-3 rounded-[12px] px-4 py-3"
      style={{
        background: isUnread
          ? 'var(--status-paid-subtle)'
          : 'color-mix(in oklch, var(--ink) 3%, transparent)',
        border: '1px solid color-mix(in oklch, var(--status-paid) 25%, transparent)',
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={{
          background: 'var(--status-paid-subtle)',
          color: 'var(--status-paid)',
        }}
      >
        <CheckCircle2 size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <h3
          className={
            isUnread
              ? 'truncate text-[14px] font-semibold text-ink'
              : 'truncate text-[14px] font-medium text-ink'
          }
        >
          {/* React escapes title + body by default, see the comment in
              the component doc. Do not introduce dangerouslySetInnerHTML
              anywhere in this tree. */}
          {item.title}
        </h3>
        <p className="mt-0.5 whitespace-pre-line break-words text-[12.5px] text-ink/65">
          {item.body}
        </p>
      </div>
    </article>
  );
}
