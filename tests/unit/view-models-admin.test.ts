import { describe, expect, it } from 'vitest';
import type { Cycle, Group, Member, Payment, Receipt } from '@/lib/types';
import {
  ADMIN_GROUP_TAB_IDS,
  isAdminGroupTabId,
  isMobileBlockedTab,
  pickPoolSwatch,
  toAdminCycleRow,
  toAdminGroupHeader,
  toAdminGroupOverview,
  toAdminMemberRow,
  toAdminPaymentRow,
  toQueueAggregates,
  toReceiptQueueRow,
} from '@/lib/view-models/admin';

const NOW = new Date('2026-04-22T10:00:00Z');

function buildGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: 'pool-lagos',
    name: 'Lagos Rent Q2',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    ...overrides,
  };
}

function buildMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 'm-1',
    name: 'Adaeze O.',
    phone: '2348031110001',
    position: 1,
    status: 'active',
    groupId: 'pool-lagos',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    joinedAt: '2026-01-15T00:00:00Z',
    version: 1,
    ...overrides,
  };
}

function buildCycle(overrides: Partial<Cycle> = {}): Cycle {
  return {
    id: 'c-1',
    cycleNumber: 1,
    startDate: '2026-01-01',
    endDate: '2026-01-07',
    contributionPerMember: 1_200_000,
    totalAmount: 6_000_000,
    recipientMemberId: 'm-1',
    status: 'closed',
    groupId: 'pool-lagos',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    ...overrides,
  };
}

function buildReceipt(overrides: Partial<Receipt> = {}): Receipt {
  return {
    id: 'R-1',
    source: 'whatsapp',
    groupId: 'pool-lagos',
    matchedMemberId: 'm-1',
    cycleId: 'c-1',
    expectedAmountKobo: 1_200_000,
    senderPhone: '2348031110001',
    note: 'photo of transfer + "sent"',
    status: 'matched',
    submittedAt: '2026-04-22T08:00:00Z',
    ...overrides,
  };
}

describe('pickPoolSwatch', () => {
  it('returns the same swatch for the same id', () => {
    expect(pickPoolSwatch('pool-a')).toBe(pickPoolSwatch('pool-a'));
  });

  it('returns a swatch in the a-d set', () => {
    expect(['a', 'b', 'c', 'd']).toContain(pickPoolSwatch('any-id'));
  });
});

describe('toReceiptQueueRow', () => {
  it('joins pool + member + cycle into a queue row with `pending` tone for fresh receipts', () => {
    const row = toReceiptQueueRow({
      receipt: buildReceipt({ submittedAt: '2026-04-22T08:00:00Z' }),
      group: buildGroup(),
      cycle: buildCycle({ cycleNumber: 10 }),
      member: buildMember(),
      now: NOW,
    });
    expect(row.poolName).toBe('Lagos Rent Q2');
    expect(row.memberName).toBe('Adaeze O.');
    expect(row.cycleLabel).toBe('cycle 10 · w10');
    expect(row.tone).toBe('pending');
    expect(row.submittedLabel).toContain('WhatsApp');
  });

  it('uses `stale` tone for matched receipts older than 24h', () => {
    const row = toReceiptQueueRow({
      receipt: buildReceipt({ submittedAt: '2026-04-20T08:00:00Z' }),
      group: buildGroup(),
      cycle: buildCycle(),
      member: buildMember(),
      now: NOW,
    });
    expect(row.tone).toBe('stale');
  });

  it('uses `paid` tone for confirmed receipts and `out` for flagged ones', () => {
    const paid = toReceiptQueueRow({
      receipt: buildReceipt({ status: 'confirmed' }),
      group: buildGroup(),
      cycle: buildCycle(),
      member: buildMember(),
      now: NOW,
    });
    const flagged = toReceiptQueueRow({
      receipt: buildReceipt({ status: 'flagged' }),
      group: buildGroup(),
      cycle: buildCycle(),
      member: buildMember(),
      now: NOW,
    });
    expect(paid.tone).toBe('paid');
    expect(flagged.tone).toBe('out');
  });

  it('falls back gracefully when member is unmatched', () => {
    const row = toReceiptQueueRow({
      receipt: buildReceipt({ status: 'unmatched', matchedMemberId: null }),
      group: buildGroup(),
      cycle: buildCycle(),
      member: null,
      now: NOW,
    });
    expect(row.memberName).toBeNull();
    expect(row.memberPhoneMasked).toMatch(/•/);
  });

  it('falls back to "(no note)" when note is empty or whitespace', () => {
    const row = toReceiptQueueRow({
      receipt: buildReceipt({ note: '   ' }),
      group: buildGroup(),
      cycle: buildCycle(),
      member: buildMember(),
      now: NOW,
    });
    expect(row.note).toBe('(no note)');
  });
});

describe('toQueueAggregates', () => {
  it('counts awaiting, today, oldest, confirmed-this-week', () => {
    const receipts: ReadonlyArray<Receipt> = [
      buildReceipt({ id: 'R-1', status: 'matched', submittedAt: '2026-04-22T05:00:00Z' }),
      buildReceipt({ id: 'R-2', status: 'unmatched', submittedAt: '2026-04-20T10:00:00Z' }),
      buildReceipt({ id: 'R-3', status: 'matched', submittedAt: '2026-04-21T23:00:00Z' }),
      buildReceipt({
        id: 'R-4',
        status: 'confirmed',
        submittedAt: '2026-04-19T10:00:00Z',
        reviewedAt: '2026-04-20T10:00:00Z',
      }),
      buildReceipt({
        id: 'R-5',
        status: 'confirmed',
        submittedAt: '2026-03-01T10:00:00Z',
        reviewedAt: '2026-03-01T11:00:00Z',
      }),
    ];
    const agg = toQueueAggregates({ receipts, now: NOW });
    expect(agg.awaiting).toBe(3);
    expect(agg.today).toBe(2);
    expect(agg.oldestLabel).toBe('2d');
    expect(agg.confirmedThisWeek).toBe(1);
  });

  it('returns null oldestLabel when nothing is pending', () => {
    const agg = toQueueAggregates({
      receipts: [buildReceipt({ status: 'confirmed', reviewedAt: '2026-04-22T09:00:00Z' })],
      now: NOW,
    });
    expect(agg.oldestLabel).toBeNull();
  });
});

describe('toAdminGroupHeader', () => {
  it('reflects active member count and uses uppercase initial', () => {
    const header = toAdminGroupHeader(buildGroup(), [
      buildMember({ id: 'a', status: 'active' }),
      buildMember({ id: 'b', status: 'active' }),
      buildMember({ id: 'c', status: 'inactive' }),
    ]);
    expect(header.initial).toBe('L');
    expect(header.metaLine).toContain('2 members');
  });
});

describe('toAdminGroupOverview', () => {
  it('computes balance, collected ratio, health, and timeline', () => {
    const members = [buildMember({ id: 'm-1' }), buildMember({ id: 'm-2' })];
    const cycles = [
      buildCycle({ id: 'c-1', cycleNumber: 1, status: 'closed' }),
      buildCycle({
        id: 'c-2',
        cycleNumber: 2,
        status: 'active',
        recipientMemberId: 'm-2',
      }),
      buildCycle({ id: 'c-3', cycleNumber: 3, status: 'pending' }),
    ];
    const payments: ReadonlyArray<Payment> = [
      {
        id: 'p-1',
        memberId: 'm-1',
        cycleId: 'c-2',
        amount: 1_200_000,
        currency: 'NGN',
        paymentDate: '2026-04-20',
        confirmedAt: '2026-04-20T10:00:00Z',
        createdAt: '2026-04-20T10:00:00Z',
        updatedAt: '2026-04-20T10:00:00Z',
      },
      {
        id: 'p-2',
        memberId: 'm-2',
        cycleId: 'c-1',
        amount: 1_200_000,
        currency: 'NGN',
        paymentDate: '2026-01-20',
        confirmedAt: '2026-01-20T10:00:00Z',
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-01-20T10:00:00Z',
      },
    ];

    const overview = toAdminGroupOverview({
      group: buildGroup(),
      members,
      cycles,
      payments,
      activity: [],
    });

    expect(overview.stats[0].kicker).toBe('Pool balance');
    // 1_200_000 kobo === ₦12,000
    expect(overview.stats[0].value).toBe('₦12,000');
    expect(overview.stats[1].detail).toBe('1 of 2 paid');
    expect(overview.timeline).toHaveLength(3);
    expect(overview.timeline[0].state).toBe('closed');
    expect(overview.timeline[1].state).toBe('open');
    expect(overview.timeline[2].state).toBe('upcoming');
  });
});

describe('toAdminMemberRow', () => {
  it('marks members with overdue cycles as `out` and surfaces the due amount', () => {
    const member = buildMember();
    const cycles = [
      buildCycle({ id: 'c-1', cycleNumber: 1, status: 'closed' }),
      buildCycle({ id: 'c-2', cycleNumber: 2, status: 'closed' }),
      buildCycle({ id: 'c-3', cycleNumber: 3, status: 'active' }),
    ];
    const payments: ReadonlyArray<Payment> = [
      {
        id: 'p-1',
        memberId: 'm-1',
        cycleId: 'c-1',
        amount: 1_200_000,
        currency: 'NGN',
        paymentDate: '2026-01-20',
        confirmedAt: '2026-01-20T10:00:00Z',
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-01-20T10:00:00Z',
      },
    ];
    const row = toAdminMemberRow({ member, cycles, payments });
    expect(row.tone).toBe('out');
    expect(row.pillLabel).toBe('out');
    expect(row.dueLabel).toContain('₦');
    expect(row.joinedLabel).toBe('Jan 2026');
  });

  it('marks paid-up members as `ok`', () => {
    const cycles = [buildCycle({ status: 'closed' })];
    const payments: ReadonlyArray<Payment> = [
      {
        id: 'p-1',
        memberId: 'm-1',
        cycleId: cycles[0].id,
        amount: 1_200_000,
        currency: 'NGN',
        paymentDate: '2026-01-20',
        confirmedAt: '2026-01-20T10:00:00Z',
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-01-20T10:00:00Z',
      },
    ];
    const row = toAdminMemberRow({ member: buildMember(), cycles, payments });
    expect(row.tone).toBe('ok');
    expect(row.pillLabel).toBe('current');
  });
});

describe('toAdminCycleRow', () => {
  it('renders closed cycles as paid and active cycles as open', () => {
    const closed = toAdminCycleRow({
      cycle: buildCycle({ status: 'closed', cycleNumber: 1 }),
      members: [buildMember()],
      payments: [],
    });
    const active = toAdminCycleRow({
      cycle: buildCycle({ status: 'active', cycleNumber: 2 }),
      members: [buildMember()],
      payments: [],
    });
    expect(closed.tone).toBe('paid');
    expect(closed.pillLabel).toBe('closed');
    expect(active.tone).toBe('pending');
    expect(active.pillLabel).toBe('open');
  });

  it('shows "—" for pending cycle collected amount and window', () => {
    const row = toAdminCycleRow({
      cycle: buildCycle({ status: 'pending', cycleNumber: 3 }),
      members: [buildMember()],
      payments: [],
    });
    expect(row.collectedLabel).toBe('—');
    expect(row.windowLabel).toBe('—');
  });
});

describe('toAdminPaymentRow', () => {
  it('marks confirmed payments as paid tone', () => {
    const row = toAdminPaymentRow({
      payment: {
        id: 'p-1',
        memberId: 'm-1',
        cycleId: 'c-1',
        amount: 1_200_000,
        currency: 'NGN',
        paymentDate: '2026-04-22',
        confirmedAt: '2026-04-22T10:00:00Z',
        confirmedBy: 'you',
        createdAt: '2026-04-22T10:00:00Z',
        updatedAt: '2026-04-22T10:00:00Z',
      },
      member: buildMember(),
      cycle: buildCycle(),
      now: NOW,
    });
    expect(row.status).toBe('confirmed');
    expect(row.tone).toBe('paid');
    expect(row.confirmedByLabel).toBe('you');
  });

  it('treats payments with `payout` in the id as outgoing', () => {
    const row = toAdminPaymentRow({
      payment: {
        id: 'p-payout-1',
        memberId: 'm-1',
        cycleId: 'c-1',
        amount: 9_600_000,
        currency: 'NGN',
        paymentDate: '2026-04-22',
        createdAt: '2026-04-22T10:00:00Z',
        updatedAt: '2026-04-22T10:00:00Z',
      },
      member: buildMember(),
      cycle: buildCycle(),
      now: NOW,
    });
    expect(row.isPayout).toBe(true);
    expect(row.status).toBe('payout');
  });
});

describe('tab id helpers', () => {
  it('exposes the six admin-group tabs', () => {
    expect(ADMIN_GROUP_TAB_IDS).toEqual([
      'overview',
      'members',
      'cycles',
      'payments',
      'receipts',
      'settings',
    ]);
  });

  it('isAdminGroupTabId narrows from unknown strings', () => {
    expect(isAdminGroupTabId('overview')).toBe(true);
    expect(isAdminGroupTabId('nope')).toBe(false);
  });

  it('isMobileBlockedTab covers settings, members, cycles', () => {
    expect(isMobileBlockedTab('settings')).toBe(true);
    expect(isMobileBlockedTab('members')).toBe(true);
    expect(isMobileBlockedTab('cycles')).toBe(true);
    expect(isMobileBlockedTab('overview')).toBe(false);
    expect(isMobileBlockedTab('receipts')).toBe(false);
    expect(isMobileBlockedTab('payments')).toBe(false);
  });
});
