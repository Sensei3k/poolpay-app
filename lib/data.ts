import type { Cycle, Member, Payment } from '@/lib/types';

const BASE = process.env.BACKEND_URL ?? 'http://localhost:8080';

async function apiFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    // Backend unavailable — log server-side and return fallback so the page
    // still renders. Start `cargo run` in rust-receipt-engine to populate data.
    console.error(`[data] fetch ${url} failed:`, err);
    return fallback;
  }
}

export function fetchMembers(): Promise<Member[]> {
  return apiFetch(`${BASE}/api/members`, []);
}

export function fetchCycles(): Promise<Cycle[]> {
  return apiFetch(`${BASE}/api/cycles`, []);
}

export function fetchPayments(cycleId?: number): Promise<Payment[]> {
  const url = cycleId
    ? `${BASE}/api/payments?cycleId=${cycleId}`
    : `${BASE}/api/payments`;
  return apiFetch(url, []);
}
