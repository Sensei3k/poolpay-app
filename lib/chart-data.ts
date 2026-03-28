import type { Cycle, Payment } from '@/lib/types';

export interface CycleChartDatum {
  date: Date;
  collected: number;   // NGN (kobo ÷ 100)
  outstanding: number; // NGN gap to expected
  cumulative: number;  // Running NGN total
}

export function buildChartData(cycles: Cycle[], payments: Payment[]): CycleChartDatum[] {
  const paymentsByCycle = new Map<number, Payment[]>();
  for (const p of payments) {
    const group = paymentsByCycle.get(p.cycleId) ?? [];
    group.push(p);
    paymentsByCycle.set(p.cycleId, group);
  }

  let running = 0;

  return [...cycles]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((cycle) => {
      const cyclePayments = paymentsByCycle.get(cycle.id) ?? [];
      const collectedKobo = cyclePayments.reduce((sum, p) => sum + p.amount, 0);
      const collected = collectedKobo / 100;
      const expected = cycle.totalAmount / 100;
      const outstanding = Math.max(0, expected - collected);
      running += collected;
      return {
        date: new Date(cycle.startDate),
        collected,
        outstanding,
        cumulative: running,
      };
    });
}
