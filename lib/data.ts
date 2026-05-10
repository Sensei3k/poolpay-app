import { apiFetch, type FetchResult } from '@/lib/http';
import type { Cycle, Group, InboxItem, Member, Payment } from '@/lib/types';

export type { FetchResult } from '@/lib/http';

export function fetchGroups(): Promise<FetchResult<Group[]>> {
  return apiFetch('/api/groups', []);
}

export function fetchMembers(groupId?: string): Promise<FetchResult<Member[]>> {
  const path = groupId ? `/api/members?groupId=${encodeURIComponent(groupId)}` : '/api/members';
  return apiFetch(path, []);
}

export function fetchCycles(groupId?: string): Promise<FetchResult<Cycle[]>> {
  const path = groupId ? `/api/cycles?groupId=${encodeURIComponent(groupId)}` : '/api/cycles';
  return apiFetch(path, []);
}

export function fetchPayments(
  groupId?: string,
  cycleId?: string,
): Promise<FetchResult<Payment[]>> {
  const params = new URLSearchParams();
  if (groupId) params.set('groupId', groupId);
  if (cycleId) params.set('cycleId', cycleId);
  const query = params.toString();
  const path = query ? `/api/payments?${query}` : '/api/payments';
  return apiFetch(path, []);
}

// ─── Inbox (slice 2) ───────────────────────────────────────────────────────
//
// The poolpay-api backend does not yet ship an inbox endpoint — slice 5
// (WhatsApp ingestion) is when receipt_confirmed rows start landing here
// for real. Until then, `fetchInbox` returns a stable mock list so the
// member /inbox surface can ship in slice 2 without waiting on the API.
//
// The wrapping `Promise<FetchResult<InboxItem[]>>` shape mirrors the rest
// of `lib/data.ts` so swapping in a real `apiFetch('/api/inbox', [])`
// later is a one-line change.

const MOCK_INBOX_ITEMS: ReadonlyArray<InboxItem> = [
  {
    id: 'inbox-1',
    userId: 'mock-user',
    kind: 'receipt_confirmed',
    title: 'Your payment was confirmed',
    body: 'Lagos Rent Q2 · ₦ 12,000 · cycle 9',
    createdAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 'inbox-2',
    userId: 'mock-user',
    kind: 'payout_scheduled',
    title: 'Payout arriving Friday',
    body: 'Ibadan trip 2026 · ₦ 18,500',
    createdAt: '2026-04-18T10:00:00Z',
    readAt: '2026-04-18T10:30:00Z',
  },
  {
    id: 'inbox-3',
    userId: 'mock-user',
    kind: 'admin_message',
    title: 'Tola B. joined Ibadan trip',
    body: 'Ibadan trip 2026',
    createdAt: '2026-04-15T10:00:00Z',
    readAt: '2026-04-15T10:30:00Z',
  },
  {
    id: 'inbox-4',
    userId: 'mock-user',
    kind: 'admin_message',
    title: 'Adaeze O. replied on WhatsApp',
    body: 'Lagos Rent Q2',
    createdAt: '2026-04-15T08:00:00Z',
    readAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'inbox-5',
    userId: 'mock-user',
    kind: 'overdue',
    title: 'Contribution overdue',
    body: 'Family group · Feb · ₦ 5,000',
    createdAt: '2026-04-08T10:00:00Z',
    readAt: '2026-04-08T11:00:00Z',
  },
];

export function fetchInbox(): Promise<FetchResult<InboxItem[]>> {
  return Promise.resolve({ ok: true, data: [...MOCK_INBOX_ITEMS] });
}
