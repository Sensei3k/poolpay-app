import type { Member, Payment, Cycle } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch(`${BASE_URL}/api/members`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch members: ${res.status}`);
  return res.json() as Promise<Member[]>;
}

export async function fetchCycles(): Promise<Cycle[]> {
  const res = await fetch(`${BASE_URL}/api/cycles`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch cycles: ${res.status}`);
  return res.json() as Promise<Cycle[]>;
}

export async function fetchPayments(): Promise<Payment[]> {
  const res = await fetch(`${BASE_URL}/api/payments`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch payments: ${res.status}`);
  return res.json() as Promise<Payment[]>;
}
