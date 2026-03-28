import { describe, it, expect } from 'vitest';
import { buildChartData } from '@/lib/chart-data';
import type { Cycle, Payment } from '@/lib/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const cycle1: Cycle = {
  id: 1,
  cycleNumber: 1,
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  contributionPerMember: 500000, // ₦5,000 in kobo
  totalAmount: 2500000,          // ₦25,000 in kobo (5 members)
  recipientMemberId: 1,
  status: 'closed',
};

const cycle2: Cycle = {
  id: 2,
  cycleNumber: 2,
  startDate: '2026-02-01',
  endDate: '2026-02-28',
  contributionPerMember: 500000,
  totalAmount: 2500000,
  recipientMemberId: 2,
  status: 'active',
};

const payments: Payment[] = [
  // Cycle 1: 3 of 5 paid (₦15,000 collected in kobo = 1,500,000)
  { id: 1, memberId: 1, cycleId: 1, amount: 500000, currency: 'NGN', paymentDate: '2026-01-05' },
  { id: 2, memberId: 2, cycleId: 1, amount: 500000, currency: 'NGN', paymentDate: '2026-01-06' },
  { id: 3, memberId: 3, cycleId: 1, amount: 500000, currency: 'NGN', paymentDate: '2026-01-07' },
  // Cycle 2: 5 of 5 paid (₦25,000 collected in kobo = 2,500,000)
  { id: 4, memberId: 1, cycleId: 2, amount: 500000, currency: 'NGN', paymentDate: '2026-02-03' },
  { id: 5, memberId: 2, cycleId: 2, amount: 500000, currency: 'NGN', paymentDate: '2026-02-04' },
  { id: 6, memberId: 3, cycleId: 2, amount: 500000, currency: 'NGN', paymentDate: '2026-02-05' },
  { id: 7, memberId: 4, cycleId: 2, amount: 500000, currency: 'NGN', paymentDate: '2026-02-06' },
  { id: 8, memberId: 5, cycleId: 2, amount: 500000, currency: 'NGN', paymentDate: '2026-02-07' },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('buildChartData', () => {
  describe('date parsing', () => {
    it('returns a Date object for each datum', () => {
      const result = buildChartData([cycle1], []);
      expect(result[0].date).toBeInstanceOf(Date);
    });

    it('parses cycle.startDate string into the correct date', () => {
      const result = buildChartData([cycle1], []);
      const date = result[0].date;
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(0); // January (0-indexed)
      expect(date.getDate()).toBe(1);
    });

    it('produces one datum per cycle', () => {
      const result = buildChartData([cycle1, cycle2], payments);
      expect(result).toHaveLength(2);
    });
  });

  describe('kobo to NGN conversion', () => {
    it('converts collected kobo to NGN by dividing by 100', () => {
      const result = buildChartData([cycle1], payments);
      // cycle1: 3 payments × ₦5,000 = ₦15,000
      expect(result[0].collected).toBe(15000);
    });

    it('converts outstanding kobo to NGN by dividing by 100', () => {
      const result = buildChartData([cycle1], payments);
      // cycle1: totalAmount ₦25,000 - collected ₦15,000 = ₦10,000
      expect(result[0].outstanding).toBe(10000);
    });

    it('outstanding is 0 when fully collected', () => {
      const result = buildChartData([cycle2], payments);
      // cycle2: all 5 paid = ₦25,000 collected, ₦0 outstanding
      expect(result[0].outstanding).toBe(0);
    });

    it('outstanding is never negative', () => {
      const overpaidPayments: Payment[] = [
        { id: 1, memberId: 1, cycleId: 1, amount: 9999999, currency: 'NGN', paymentDate: '2026-01-05' },
      ];
      const result = buildChartData([cycle1], overpaidPayments);
      expect(result[0].outstanding).toBeGreaterThanOrEqual(0);
    });
  });

  describe('cumulative running total', () => {
    it('cumulative for a single cycle equals its collected amount', () => {
      const result = buildChartData([cycle1], payments);
      expect(result[0].cumulative).toBe(15000);
    });

    it('cumulative is a running total across cycles', () => {
      const result = buildChartData([cycle1, cycle2], payments);
      // cycle1: ₦15,000 collected → cumulative ₦15,000
      // cycle2: ₦25,000 collected → cumulative ₦40,000
      expect(result[0].cumulative).toBe(15000);
      expect(result[1].cumulative).toBe(40000);
    });

    it('sorts output by startDate ascending', () => {
      // Pass cycles in reverse order — output should still be ascending
      const result = buildChartData([cycle2, cycle1], payments);
      expect(result[0].date.getMonth()).toBe(0); // Jan
      expect(result[1].date.getMonth()).toBe(1); // Feb
    });
  });

  describe('edge cases', () => {
    it('returns empty array for empty cycles input', () => {
      const result = buildChartData([], []);
      expect(result).toEqual([]);
    });

    it('returns 0 collected and full outstanding when no payments exist', () => {
      const result = buildChartData([cycle1], []);
      expect(result[0].collected).toBe(0);
      expect(result[0].outstanding).toBe(25000); // totalAmount ÷ 100
    });

    it('ignores payments that belong to a different cycle', () => {
      const otherPayments: Payment[] = [
        { id: 99, memberId: 1, cycleId: 999, amount: 500000, currency: 'NGN', paymentDate: '2026-01-05' },
      ];
      const result = buildChartData([cycle1], otherPayments);
      expect(result[0].collected).toBe(0);
    });
  });
});
