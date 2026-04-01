import type { Cycle, Member, Payment } from '@/lib/types';

const BASE = process.env.BACKEND_URL ?? 'http://localhost:8080';

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

export function fetchMembers(): Promise<FetchResult<Member[]>> {
  return apiFetch(`${BASE}/api/members`, []);
}

export function fetchCycles(): Promise<FetchResult<Cycle[]>> {
  return apiFetch(`${BASE}/api/cycles`, []);
}

export function fetchPayments(cycleId?: number): Promise<FetchResult<Payment[]>> {
  const url = cycleId
    ? `${BASE}/api/payments?cycleId=${cycleId}`
    : `${BASE}/api/payments`;
  return apiFetch(url, []);
}
