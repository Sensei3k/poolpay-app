import { MOCK_MEMBERS, MOCK_CYCLES } from './mock-data';
import { getPayments } from './store';
import type { Member, Payment, Cycle } from '@/lib/types';

export async function fetchMembers(): Promise<Member[]> {
  return MOCK_MEMBERS;
}

export async function fetchCycles(): Promise<Cycle[]> {
  return MOCK_CYCLES;
}

export async function fetchPayments(): Promise<Payment[]> {
  return getPayments();
}
