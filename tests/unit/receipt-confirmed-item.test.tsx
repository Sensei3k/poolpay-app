// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { ReceiptConfirmedItem } from '@/app/(app)/inbox/_components/receipt-confirmed-item';
import type { InboxItem } from '@/lib/types';

const BASE: InboxItem = {
  id: 'inbox-1',
  userId: 'user-1',
  kind: 'receipt_confirmed',
  title: '₦ 12,000 confirmed for Lagos Rent Q2',
  body: 'Tola B. submitted via WhatsApp · cycle 10 of 12',
  createdAt: '2026-05-10T10:00:00Z',
};

afterEach(() => {
  cleanup();
});

describe('ReceiptConfirmedItem', () => {
  it('renders the title and body as text', () => {
    const { container } = render(<ReceiptConfirmedItem item={BASE} />);
    expect(container.textContent ?? '').toContain(
      '₦ 12,000 confirmed for Lagos Rent Q2',
    );
    expect(container.textContent ?? '').toContain(
      'Tola B. submitted via WhatsApp · cycle 10 of 12',
    );
  });

  it('escapes HTML in operator-supplied body, never injecting it as markup', () => {
    const hostile: InboxItem = {
      ...BASE,
      body: '<img src=x onerror="alert(1)"><script>alert("xss")</script>',
    };

    const { container } = render(<ReceiptConfirmedItem item={hostile} />);

    expect(container.querySelectorAll('script').length).toBe(0);
    expect(container.querySelectorAll('img[src="x"]').length).toBe(0);
    expect(container.textContent ?? '').toContain('<img src=x');
  });

  it('drops the unread tone when readAt is set', () => {
    const read: InboxItem = { ...BASE, readAt: '2026-05-10T10:05:00Z' };
    const { container } = render(<ReceiptConfirmedItem item={read} />);
    const article = container.querySelector('article');
    expect(article?.getAttribute('data-tone')).toBeNull();
  });

  it('tags the row with the unread tone when readAt is undefined', () => {
    const { container } = render(<ReceiptConfirmedItem item={BASE} />);
    const article = container.querySelector('article');
    expect(article?.getAttribute('data-tone')).toBe('paid');
  });
});
