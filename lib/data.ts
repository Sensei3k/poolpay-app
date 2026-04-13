import { apiFetch, type FetchResult } from '@/lib/http';
import type { Cycle, Group, Member, Payment } from '@/lib/types';

export type { FetchResult } from '@/lib/http';

export function fetchGroups(): Promise<FetchResult<Group[]>> {
  return apiFetch('/api/groups', []);
}

export function fetchMembers(groupId?: string): Promise<FetchResult<Member[]>> {
  const path = groupId ? `/api/members?groupId=${groupId}` : '/api/members';
  return apiFetch(path, []);
}

export function fetchCycles(groupId?: string): Promise<FetchResult<Cycle[]>> {
  const path = groupId ? `/api/cycles?groupId=${groupId}` : '/api/cycles';
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
