import { describe, expect, it } from 'vitest';
import type { Cycle, Group, Member, Payment } from '@/lib/types';
import {
  toHomeAggregates,
  toPoolDetail,
  toPoolSummary,
} from '@/lib/view-models/member';

// ─── Fixtures ───────────────────────────────────────────────────────────────

function makeGroup(overrides: Partial<Group> & { id: string; name: string }): Group {
  return {
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    ...overrides,
  };
}

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

function makeCycle(
  overrides: Partial<Cycle> & { id: string; recipientMemberId: string },
): Cycle {
  return {
    cycleNumber: 1,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    contributionPerMember: 1_200_000, // ₦12,000 in kobo
    totalAmount: 6_000_000,
    status: 'active',
    groupId: 'group:1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    ...overrides,
  };
}

function makePayment(
  overrides: Partial<Payment> & { id: string; memberId: string; cycleId: string },
): Payment {
  return {
    amount: 1_200_000,
    currency: 'NGN',
    paymentDate: '2026-04-22',
    createdAt: '2026-04-22T10:00:00Z',
    updatedAt: '2026-04-22T10:00:00Z',
    ...overrides,
  };
}

// ─── toPoolSummary ──────────────────────────────────────────────────────────

describe('toPoolSummary', () => {
  it('returns zero progress and "no active cycle" footnote when no cycles exist', () => {
    const group = makeGroup({ id: 'group:lagos-rent', name: 'Lagos Rent Q2' });
    const result = toPoolSummary({ group, members: [], cycles: [], payments: [] });

    expect(result.id).toBe('group:lagos-rent');
    expect(result.name).toBe('Lagos Rent Q2');
    expect(result.initial).toBe('L');
    expect(result.progressPct).toBe(0);
    expect(result.footnote).toBe('no active cycle');
    expect(result.amountLabel).toBe('₦0');
    expect(['a', 'b', 'c', 'd']).toContain(result.swatch);
  });

  it('reads cadence "weekly" by default and "monthly" when name hints monthly', () => {
    const weekly = toPoolSummary({
      group: makeGroup({ id: 'group:1', name: 'Lagos Rent Q2' }),
      members: [],
      cycles: [],
      payments: [],
    });
    const monthly = toPoolSummary({
      group: makeGroup({ id: 'group:2', name: 'Family group · Feb' }),
      members: [],
      cycles: [],
      payments: [],
    });
    expect(weekly.subtitle).toBe('weekly');
    expect(monthly.subtitle).toBe('monthly');
  });

  it('mixes closed-cycle progress with active-cycle collection ratio', () => {
    const group = makeGroup({ id: 'group:lagos-rent', name: 'Lagos Rent Q2' });
    const members: Member[] = [
      makeMember({ id: 'm:1', position: 1 }),
      makeMember({ id: 'm:2', position: 2 }),
      makeMember({ id: 'm:3', position: 3 }),
      makeMember({ id: 'm:4', position: 4 }),
    ];
    const closed = makeCycle({
      id: 'c:1',
      cycleNumber: 1,
      status: 'closed',
      recipientMemberId: 'm:1',
    });
    const active = makeCycle({
      id: 'c:2',
      cycleNumber: 2,
      status: 'active',
      recipientMemberId: 'm:2',
    });
    const payments: Payment[] = [
      makePayment({ id: 'p:1', memberId: 'm:1', cycleId: 'c:2' }),
      // m:3 has not paid; m:4 has not paid
    ];

    const result = toPoolSummary({
      group,
      members,
      cycles: [closed, active],
      payments,
    });

    // 1 of 2 cycles closed → 50% base; active cycle 1/3 collected (3 contributors)
    // Active slice contributes 50% × (1/3) ≈ 16.67% → total ≈ 67%.
    expect(result.progressPct).toBeGreaterThan(60);
    expect(result.progressPct).toBeLessThan(75);
    expect(result.subtitle).toBe('weekly · 2/2');
    expect(result.footnote).toBe('4 members');
  });

  it('renders the same swatch for the same id across calls', () => {
    const group = makeGroup({ id: 'group:stable', name: 'Stable Pool' });
    const a = toPoolSummary({ group, members: [], cycles: [], payments: [] });
    const b = toPoolSummary({ group, members: [], cycles: [], payments: [] });
    expect(a.swatch).toBe(b.swatch);
  });
});

// ─── toPoolDetail ───────────────────────────────────────────────────────────

describe('toPoolDetail', () => {
  it('throws when no cycle is active', () => {
    const group = makeGroup({ id: 'group:1', name: 'Lagos Rent Q2' });
    expect(() =>
      toPoolDetail({
        group,
        members: [makeMember({ id: 'm:1' })],
        cycles: [
          makeCycle({
            id: 'c:1',
            status: 'closed',
            recipientMemberId: 'm:1',
          }),
        ],
        payments: [],
      }),
    ).toThrow(/no active cycle/);
  });

  it('partitions members into paid / pending recipient / outstanding', () => {
    const group = makeGroup({ id: 'group:1', name: 'Lagos Rent Q2' });
    const members: Member[] = [
      makeMember({ id: 'm:1', name: 'Adaeze', position: 1 }),
      makeMember({ id: 'm:2', name: 'Kola', position: 2 }),
      makeMember({ id: 'm:3', name: 'Moyo', position: 3 }),
      makeMember({ id: 'm:4', name: 'Tola', position: 4 }),
    ];
    const cycle = makeCycle({
      id: 'c:active',
      cycleNumber: 10,
      status: 'active',
      recipientMemberId: 'm:3',
    });
    const payments: Payment[] = [
      makePayment({ id: 'p:1', memberId: 'm:1', cycleId: 'c:active' }),
      makePayment({ id: 'p:2', memberId: 'm:2', cycleId: 'c:active' }),
    ];

    const detail = toPoolDetail({
      group,
      members,
      cycles: [cycle],
      payments,
    });

    expect(detail.cycle.index).toBe(10);
    expect(detail.cycle.recipient.id).toBe('m:3');
    expect(detail.counts).toEqual({ paid: 2, pending: 1, outstanding: 1 });

    const moyo = detail.members.find((m) => m.member.id === 'm:3');
    expect(moyo?.isPayoutRecipient).toBe(true);
    expect(moyo?.tone).toBe('pending');
    expect(moyo?.label).toBe('pending');

    const tola = detail.members.find((m) => m.member.id === 'm:4');
    expect(tola?.tone).toBe('out');
    expect(tola?.label).toBe('overdue');
  });

  it('builds cycle cells in sorted order keyed by status', () => {
    const group = makeGroup({ id: 'group:1', name: 'Lagos Rent Q2' });
    const members: Member[] = [makeMember({ id: 'm:1', position: 1 })];
    const cycles: Cycle[] = [
      makeCycle({
        id: 'c:3',
        cycleNumber: 3,
        status: 'pending',
        recipientMemberId: 'm:1',
      }),
      makeCycle({
        id: 'c:1',
        cycleNumber: 1,
        status: 'closed',
        recipientMemberId: 'm:1',
      }),
      makeCycle({
        id: 'c:2',
        cycleNumber: 2,
        status: 'active',
        recipientMemberId: 'm:1',
      }),
    ];
    const detail = toPoolDetail({ group, members, cycles, payments: [] });

    expect(detail.cycleCells.map((c) => c.index)).toEqual([1, 2, 3]);
    expect(detail.cycleCells.map((c) => c.state)).toEqual([
      'closed',
      'open',
      'upcoming',
    ]);
    expect(detail.cycle.totalCycles).toBe(3);
  });

  it('formats meta line with cadence + cycle index + contribution', () => {
    const group = makeGroup({ id: 'group:1', name: 'Lagos Rent Q2' });
    const members: Member[] = [
      makeMember({ id: 'm:1', position: 1 }),
      makeMember({ id: 'm:2', position: 2 }),
    ];
    const cycle = makeCycle({
      id: 'c:active',
      cycleNumber: 10,
      status: 'active',
      recipientMemberId: 'm:1',
      contributionPerMember: 1_200_000,
    });

    const detail = toPoolDetail({
      group,
      members,
      cycles: [cycle],
      payments: [],
    });

    expect(detail.metaLine).toBe(
      'Weekly · NGN · cycle 10 of 1 · you contribute ₦12,000/wk',
    );
    expect(detail.cycle.contributionLabel).toBe('₦12,000');
  });
});

// ─── toHomeAggregates ───────────────────────────────────────────────────────

describe('toHomeAggregates', () => {
  it('returns zeros for an empty pool list', () => {
    expect(toHomeAggregates({ pools: [] })).toEqual({
      expectedKobo: 0,
      collectedKobo: 0,
      outstandingKobo: 0,
      poolCount: 0,
      pendingContributionCount: 0,
    });
  });

  it('skips pools without an active cycle but still counts them', () => {
    const result = toHomeAggregates({
      pools: [
        {
          members: [makeMember({ id: 'm:1' })],
          cycles: [
            makeCycle({
              id: 'c:1',
              status: 'closed',
              recipientMemberId: 'm:1',
            }),
          ],
          payments: [],
        },
      ],
    });
    expect(result.poolCount).toBe(1);
    expect(result.expectedKobo).toBe(0);
    expect(result.collectedKobo).toBe(0);
    expect(result.outstandingKobo).toBe(0);
  });

  it('sums expected, collected, outstanding, and pending across pools', () => {
    const members: Member[] = [
      makeMember({ id: 'm:1', position: 1 }),
      makeMember({ id: 'm:2', position: 2 }),
      makeMember({ id: 'm:3', position: 3 }),
    ];
    const cycle = makeCycle({
      id: 'c:active',
      status: 'active',
      recipientMemberId: 'm:1',
      contributionPerMember: 1_000_000,
    });
    const payments: Payment[] = [
      makePayment({
        id: 'p:1',
        memberId: 'm:2',
        cycleId: 'c:active',
        amount: 1_000_000,
      }),
    ];

    const result = toHomeAggregates({
      pools: [
        { members, cycles: [cycle], payments },
        { members, cycles: [cycle], payments },
      ],
    });

    // 2 contributors × 1,000,000 kobo × 2 pools = 4,000,000 expected.
    // 1 paid × 1,000,000 × 2 pools = 2,000,000 collected.
    expect(result.expectedKobo).toBe(4_000_000);
    expect(result.collectedKobo).toBe(2_000_000);
    expect(result.outstandingKobo).toBe(2_000_000);
    expect(result.pendingContributionCount).toBe(2);
    expect(result.poolCount).toBe(2);
  });
});
