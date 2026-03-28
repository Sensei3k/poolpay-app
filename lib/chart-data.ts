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

  // Accumulate in kobo (integers) to avoid floating-point drift across many cycles.
  let runningKobo = 0;

  return [...cycles]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((cycle) => {
      const cyclePayments = paymentsByCycle.get(cycle.id) ?? [];
      const collectedKobo = cyclePayments.reduce((sum, p) => sum + p.amount, 0);
      const collected = collectedKobo / 100;
      const expected = cycle.totalAmount / 100;
      const outstanding = Math.max(0, expected - collected);
      runningKobo += collectedKobo;

      // Parse as local midnight — new Date('YYYY-MM-DD') parses as UTC and
      // shifts the day for any user west of UTC.
      const [y, m, d] = cycle.startDate.split('-').map(Number);
      return {
        date: new Date(y, (m as number) - 1, d),
        collected,
        outstanding,
        cumulative: runningKobo / 100,
      };
    });
}
