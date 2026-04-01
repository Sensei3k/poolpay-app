import { apiFetch, type FetchResult } from '@/lib/http';
import type { Cycle, Member, Payment } from '@/lib/types';

export type { FetchResult } from '@/lib/http';

export function fetchMembers(): Promise<FetchResult<Member[]>> {
  return apiFetch('/api/members', []);
}

export function fetchCycles(): Promise<FetchResult<Cycle[]>> {
  return apiFetch('/api/cycles', []);
}

export function fetchPayments(cycleId?: string): Promise<FetchResult<Payment[]>> {
  const path = cycleId ? `/api/payments?cycleId=${cycleId}` : '/api/payments';
  return apiFetch(path, []);
}
