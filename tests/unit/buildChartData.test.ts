import { describe, it, expect } from 'vitest';
import { buildChartData } from '@/lib/chart-data';
import type { Cycle, Payment } from '@/lib/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const cycle1: Cycle = {
  id: 'cycle:1',
  cycleNumber: 1,
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  contributionPerMember: 500000, // ₦5,000 in kobo
  totalAmount: 2500000,          // ₦25,000 in kobo (5 members)
  recipientMemberId: 'member:1',
  status: 'closed',
  groupId: 'group:1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  version: 1,
};

const cycle2: Cycle = {
  id: 'cycle:2',
  cycleNumber: 2,
  startDate: '2026-02-01',
  endDate: '2026-02-28',
  contributionPerMember: 500000,
  totalAmount: 2500000,
  recipientMemberId: 'member:2',
  status: 'active',
  groupId: 'group:1',
  createdAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
  version: 1,
};

const payments: Payment[] = [
  // Cycle 1: 3 of 5 paid (₦15,000 collected in kobo = 1,500,000)
  { id: 'payment:1', memberId: 'member:1', cycleId: 'cycle:1', amount: 500000, currency: 'NGN', paymentDate: '2026-01-05', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-05T00:00:00Z' },
  { id: 'payment:2', memberId: 'member:2', cycleId: 'cycle:1', amount: 500000, currency: 'NGN', paymentDate: '2026-01-06', createdAt: '2026-01-06T00:00:00Z', updatedAt: '2026-01-06T00:00:00Z' },
  { id: 'payment:3', memberId: 'member:3', cycleId: 'cycle:1', amount: 500000, currency: 'NGN', paymentDate: '2026-01-07', createdAt: '2026-01-07T00:00:00Z', updatedAt: '2026-01-07T00:00:00Z' },
  // Cycle 2: 5 of 5 paid (₦25,000 collected in kobo = 2,500,000)
  { id: 'payment:4', memberId: 'member:1', cycleId: 'cycle:2', amount: 500000, currency: 'NGN', paymentDate: '2026-02-03', createdAt: '2026-02-03T00:00:00Z', updatedAt: '2026-02-03T00:00:00Z' },
  { id: 'payment:5', memberId: 'member:2', cycleId: 'cycle:2', amount: 500000, currency: 'NGN', paymentDate: '2026-02-04', createdAt: '2026-02-04T00:00:00Z', updatedAt: '2026-02-04T00:00:00Z' },
  { id: 'payment:6', memberId: 'member:3', cycleId: 'cycle:2', amount: 500000, currency: 'NGN', paymentDate: '2026-02-05', createdAt: '2026-02-05T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z' },
  { id: 'payment:7', memberId: 'member:4', cycleId: 'cycle:2', amount: 500000, currency: 'NGN', paymentDate: '2026-02-06', createdAt: '2026-02-06T00:00:00Z', updatedAt: '2026-02-06T00:00:00Z' },
  { id: 'payment:8', memberId: 'member:5', cycleId: 'cycle:2', amount: 500000, currency: 'NGN', paymentDate: '2026-02-07', createdAt: '2026-02-07T00:00:00Z', updatedAt: '2026-02-07T00:00:00Z' },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('buildChartData', () => {
  describe('date parsing', () => {
    it('returns a Date object for each datum', () => {
      const result = buildChartData([cycle1], []);
      expect(result[0].date).toBeInstanceOf(Date);
    });

    it('parses cycle.startDate string into the correct local date', () => {
      const result = buildChartData([cycle1], []);
      const date = result[0].date;
      // buildChartData constructs dates as local midnight (not UTC) so these
      // assertions hold in any timezone.
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
        { id: 'payment:99', memberId: 'member:1', cycleId: 'cycle:1', amount: 9999999, currency: 'NGN', paymentDate: '2026-01-05', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-05T00:00:00Z' },
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

    it('returns 0 collected, full outstanding, and 0 cumulative when no payments exist', () => {
      const result = buildChartData([cycle1], []);
      expect(result[0].collected).toBe(0);
      expect(result[0].outstanding).toBe(25000); // totalAmount ÷ 100
      expect(result[0].cumulative).toBe(0);
    });

    it('ignores payments that belong to a different cycle', () => {
      const otherPayments: Payment[] = [
        { id: 'payment:99', memberId: 'member:1', cycleId: 'cycle:999', amount: 500000, currency: 'NGN', paymentDate: '2026-01-05', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-05T00:00:00Z' },
      ];
      const result = buildChartData([cycle1], otherPayments);
      expect(result[0].collected).toBe(0);
    });
  });
});
