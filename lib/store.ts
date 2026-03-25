import { MOCK_PAYMENTS } from './mock-data';
import type { Payment } from './types';

// Persist across Next.js HMR hot reloads in dev
const g = globalThis as typeof globalThis & { __circlePayments?: Payment[] };

if (!g.__circlePayments) {
  g.__circlePayments = [...MOCK_PAYMENTS];
}

export function getPayments(): Payment[] {
  return g.__circlePayments!;
}

export function addPayment(payment: Payment): void {
  g.__circlePayments = [...g.__circlePayments!, payment];
}

export function removePayment(memberId: number, cycleId: number): void {
  g.__circlePayments = g.__circlePayments!.filter(
    p => !(p.memberId === memberId && p.cycleId === cycleId),
  );
}
