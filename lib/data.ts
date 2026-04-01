import type { Cycle, Group, Member, Payment } from '@/lib/types';
import { BACKEND_URL, ADMIN_TOKEN } from '@/lib/config';

const BASE = BACKEND_URL;

export type FetchResult<T> = { data: T; ok: true } | { data: T; ok: false };

async function apiFetch<T>(url: string, fallback: T): Promise<FetchResult<T>> {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return { data: await res.json(), ok: true };
  } catch (err) {
    console.error(`[data] fetch ${url} failed:`, err);
    return { data: fallback, ok: false };
  }
}

export function fetchGroups(): Promise<FetchResult<Group[]>> {
  return apiFetch(`${BASE}/api/groups`, []);
}

export function fetchMembers(groupId?: string): Promise<FetchResult<Member[]>> {
  const url = groupId
    ? `${BASE}/api/members?groupId=${groupId}`
    : `${BASE}/api/members`;
  return apiFetch(url, []);
}

export function fetchCycles(groupId?: string): Promise<FetchResult<Cycle[]>> {
  const url = groupId
    ? `${BASE}/api/cycles?groupId=${groupId}`
    : `${BASE}/api/cycles`;
  return apiFetch(url, []);
}

export function fetchPayments(cycleId?: string): Promise<FetchResult<Payment[]>> {
  const url = cycleId
    ? `${BASE}/api/payments?cycleId=${cycleId}`
    : `${BASE}/api/payments`;
  return apiFetch(url, []);
}
