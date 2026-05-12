import { apiFetch, type FetchResult } from '@/lib/http';
import { getAccessToken } from '@/lib/auth/server-token';
import type {
  Cycle,
  Group,
  InboxItem,
  Member,
  Payment,
  Receipt,
} from '@/lib/types';

export type { FetchResult } from '@/lib/http';

// ─── Server-only read helpers (forward the caller's JWT) ───────────────────
//
// These helpers run from React Server Components and call the Rust backend
// directly. They forward the signed-in user's access token via
// `Authorization: Bearer <jwt>` so the backend sees the request as the
// real caller, not an anonymous one. The full single-401-retry-via-refresh
// path lives in `lib/auth/backend-fetch.ts` (`secureFetch`/`secureAction`)
// but that helper writes a rotated session cookie via `cookies().set()`,
// which is unavailable inside Server Components. RSC fetches therefore
// stay on `apiFetch` with an explicit token, NextAuth's JWT callback
// already proactively refreshes the token within `REFRESH_SKEW_SECS` of
// expiry, so by the time a page renders the token is fresh.
//
// When no session exists (logged-out user reaching the route guard before
// redirect, or test env without a cookie), the token is `undefined` and
// `apiFetch` calls the backend without an Authorization header, the
// backend responds with 401 and `apiFetch` collapses it into the
// documented `{ ok: false, data: fallback }` shape.

export async function fetchGroups(): Promise<FetchResult<Group[]>> {
  const token = (await getAccessToken()) ?? undefined;
  return apiFetch('/api/groups', [], { token });
}

export async function fetchMembers(groupId?: string): Promise<FetchResult<Member[]>> {
  const path = groupId ? `/api/members?groupId=${encodeURIComponent(groupId)}` : '/api/members';
  const token = (await getAccessToken()) ?? undefined;
  return apiFetch(path, [], { token });
}

export async function fetchCycles(groupId?: string): Promise<FetchResult<Cycle[]>> {
  const path = groupId ? `/api/cycles?groupId=${encodeURIComponent(groupId)}` : '/api/cycles';
  const token = (await getAccessToken()) ?? undefined;
  return apiFetch(path, [], { token });
}

export async function fetchPayments(
  groupId?: string,
  cycleId?: string,
): Promise<FetchResult<Payment[]>> {
  const params = new URLSearchParams();
  if (groupId) params.set('groupId', groupId);
  if (cycleId) params.set('cycleId', cycleId);
  const query = params.toString();
  const path = query ? `/api/payments?${query}` : '/api/payments';
  const token = (await getAccessToken()) ?? undefined;
  return apiFetch(path, [], { token });
}

// ─── Inbox (slice 2) ───────────────────────────────────────────────────────
//
// The poolpay-api backend does not yet ship an inbox endpoint, slice 5
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

// ─── Receipts (slice 3 wiring · slice 5 lands the real source) ──────────────
//
// The receipts queue UI ships in slice 3, but WhatsApp ingestion (the only
// real source of receipts) lands in slice 5. This fetcher returns an empty
// list today so `/admin/receipts` and `/admin/groups/[poolId]?tab=receipts`
// render their empty states from real route plumbing. Once slice 5 brings
// the backend endpoint online, this becomes a one-line swap to
// `apiFetch('/api/receipts', [])`.

export function fetchReceipts(
  groupId?: string,
): Promise<FetchResult<Receipt[]>> {
  // groupId is forwarded once the backend is live, keeping the parameter
  // in the public signature now means call sites slot in unchanged.
  void groupId;
  return Promise.resolve({ ok: true, data: [] });
}
