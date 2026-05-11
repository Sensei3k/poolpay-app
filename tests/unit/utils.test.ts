import { describe, it, expect } from 'vitest';
import { getMemberPaymentStatuses, deriveCycleSummary } from '@/lib/utils';
import type { Cycle, Member, Payment } from '@/lib/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeMember(overrides: Partial<Member> & { id: string }): Member {
  return {
    name: 'Test Member',
    phone: '2349000000001',
    position: 1,
    status: 'active',
    groupId: 'group:1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    ...overrides,
  };
}

function makePayment(overrides: Partial<Payment> & { id: string; memberId: string; cycleId: string }): Payment {
  return {
    amount: 500000,
    currency: 'NGN',
    paymentDate: '2026-01-05',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
    ...overrides,
  };
}

function makeCycle(overrides: Partial<Cycle> & { id: string; recipientMemberId: string }): Cycle {
  return {
    cycleNumber: 1,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    contributionPerMember: 500000,
    totalAmount: 2500000,
    status: 'active',
    groupId: 'group:1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    ...overrides,
  };
}

const members: Member[] = [
  makeMember({ id: 'member:1', name: 'Alice', position: 1 }),
  makeMember({ id: 'member:2', name: 'Bob',   position: 2 }),
  makeMember({ id: 'member:3', name: 'Carol', position: 3 }),
  makeMember({ id: 'member:4', name: 'Dave',  position: 4, status: 'inactive' }),
];

const cycleId = 'cycle:1';
const recipientId = 'member:1';

const payments: Payment[] = [
  makePayment({ id: 'payment:1', memberId: 'member:2', cycleId: 'cycle:1' }),
  // member:3 has not paid
  makePayment({ id: 'payment:2', memberId: 'member:2', cycleId: 'cycle:99' }), // different cycle
];

// ─── getMemberPaymentStatuses ─────────────────────────────────────────────────

describe('getMemberPaymentStatuses', () => {
  describe('recipient exclusion', () => {
    it('excludes the recipient member from the result', () => {
      const result = getMemberPaymentStatuses(members, payments, cycleId, recipientId);
      const ids = result.map(s => s.member.id);
      expect(ids).not.toContain('member:1');
    });

    it('uses strict string equality for recipient ID comparison', () => {
      // Ensures number-to-string migration didn't break ID matching
      const result = getMemberPaymentStatuses(members, payments, cycleId, 'member:1');
      expect(result.find(s => s.member.id === 'member:1')).toBeUndefined();
    });
  });

  describe('inactive member exclusion', () => {
    it('excludes inactive members', () => {
      const result = getMemberPaymentStatuses(members, payments, cycleId, recipientId);
      const ids = result.map(s => s.member.id);
      expect(ids).not.toContain('member:4'); // Dave is inactive
    });
  });

  describe('payment matching', () => {
    it('marks a member as paid when a payment with matching cycleId and memberId exists', () => {
      const result = getMemberPaymentStatuses(members, payments, cycleId, recipientId);
      const bob = result.find(s => s.member.id === 'member:2');
      expect(bob?.hasPaid).toBe(true);
      expect(bob?.payment?.id).toBe('payment:1');
    });

    it('marks a member as not paid when no matching payment exists', () => {
      const result = getMemberPaymentStatuses(members, payments, cycleId, recipientId);
      const carol = result.find(s => s.member.id === 'member:3');
      expect(carol?.hasPaid).toBe(false);
      expect(carol?.payment).toBeNull();
    });

    it('ignores payments from a different cycleId', () => {
      // payment:2 has cycleId cycle:99, not cycle:1
      const result = getMemberPaymentStatuses(members, payments, cycleId, recipientId);
      const bob = result.find(s => s.member.id === 'member:2');
      // Only payment:1 (cycle:1) should match — not the cycle:99 one
      expect(bob?.payment?.id).toBe('payment:1');
    });

    it('uses strict string equality for cycleId matching', () => {
      const result = getMemberPaymentStatuses(members, payments, 'cycle:99', recipientId);
      // payment:2 belongs to cycle:99 and memberId member:2
      const bob = result.find(s => s.member.id === 'member:2');
      expect(bob?.hasPaid).toBe(true);
    });
  });

  describe('ordering', () => {
    it('returns members sorted by position ascending', () => {
      const result = getMemberPaymentStatuses(members, payments, cycleId, recipientId);
      const positions = result.map(s => s.member.position);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    });
  });

  describe('empty inputs', () => {
    it('returns empty array when members list is empty', () => {
      expect(getMemberPaymentStatuses([], payments, cycleId, recipientId)).toEqual([]);
    });

    it('returns all eligible members as unpaid when payments list is empty', () => {
      const result = getMemberPaymentStatuses(members, [], cycleId, recipientId);
      expect(result.every(s => !s.hasPaid)).toBe(true);
    });
  });
});

// ─── deriveCycleSummary ───────────────────────────────────────────────────────

describe('deriveCycleSummary', () => {
  const cycle = makeCycle({ id: 'cycle:1', recipientMemberId: 'member:1' });

  const cyclePayments: Payment[] = [
    makePayment({ id: 'payment:1', memberId: 'member:2', cycleId: 'cycle:1' }),
    makePayment({ id: 'payment:2', memberId: 'member:3', cycleId: 'cycle:1' }),
    // member:1 is the recipient — their payment is excluded
    makePayment({ id: 'payment:3', memberId: 'member:1', cycleId: 'cycle:1' }),
  ];

  describe('recipient resolution', () => {
    it('resolves the recipient from the members list using string ID', () => {
      const summary = deriveCycleSummary(cycle, members, cyclePayments);
      expect(summary.recipient.id).toBe('member:1');
      expect(summary.recipient.name).toBe('Alice');
    });

    it('throws when the recipient member is not found', () => {
      const badCycle = makeCycle({ id: 'cycle:1', recipientMemberId: 'member:999' });
      expect(() => deriveCycleSummary(badCycle, members, cyclePayments)).toThrow('member:999');
    });
  });

  describe('totalMembers (contributing members)', () => {
    it('counts active members excluding the recipient', () => {
      // members: member:1 (recipient), member:2, member:3 active; member:4 inactive
      const summary = deriveCycleSummary(cycle, members, cyclePayments);
      expect(summary.totalMembers).toBe(2); // Bob + Carol
    });

    it('excludes inactive members from the total', () => {
      const summary = deriveCycleSummary(cycle, members, cyclePayments);
      // Dave (member:4) is inactive — not counted
      expect(summary.totalMembers).toBe(2);
    });
  });

  describe('paidCount', () => {
    it('counts payments for the cycle excluding the recipient', () => {
      const summary = deriveCycleSummary(cycle, members, cyclePayments);
      // payment:1 (member:2) + payment:2 (member:3); payment:3 (member:1 = recipient) excluded
      expect(summary.paidCount).toBe(2);
    });

    it('excludes the recipient payment from the count', () => {
      const summary = deriveCycleSummary(cycle, members, cyclePayments);
      expect(summary.paidCount).toBe(2);
    });

    it('uses strict string equality for cycleId and memberId matching', () => {
      const wrongCyclePayments: Payment[] = [
        makePayment({ id: 'payment:x', memberId: 'member:2', cycleId: 'cycle:99' }),
      ];
      const summary = deriveCycleSummary(cycle, members, wrongCyclePayments);
      expect(summary.paidCount).toBe(0);
    });

    it('returns 0 when no payments exist', () => {
      const summary = deriveCycleSummary(cycle, members, []);
      expect(summary.paidCount).toBe(0);
    });
  });

  describe('collectedKobo', () => {
    it('sums the amount for all non-recipient payments in the cycle', () => {
      const summary = deriveCycleSummary(cycle, members, cyclePayments);
      // payment:1 (500000) + payment:2 (500000) = 1000000; payment:3 (recipient) excluded
      expect(summary.collectedKobo).toBe(1_000_000);
    });

    it('returns 0 when no payments exist', () => {
      const summary = deriveCycleSummary(cycle, members, []);
      expect(summary.collectedKobo).toBe(0);
    });
  });
});
