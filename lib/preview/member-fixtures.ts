/**
 * Static member-experience fixtures for the dev-only preview routes.
 *
 * These shapes are *not* shipped to production, every preview route
 * gates on `process.env.NODE_ENV !== 'production'` and 404s otherwise.
 * Numbers and names mirror the design source (`member-desktop.jsx` /
 * `member-mobile.jsx`) so the screenshot matrix matches the artboards.
 */

import type { Cycle, Group, InboxItem, Member, Payment } from '@/lib/types';
import {
  toHomeAggregates,
  toPoolDetail,
  toPoolSummary,
  type HomeAggregates,
  type PoolDetail,
  type PoolSummary,
} from '@/lib/view-models/member';
import { formatNgn } from '@/lib/utils';

const POOL_DEFINITIONS: ReadonlyArray<{
  id: string;
  name: string;
  cycleNumber: number;
  cycleCount: number;
  contributionPerMember: number;
  members: ReadonlyArray<{ id: string; name: string }>;
  /** member ids that have already paid in the active cycle. */
  paid: ReadonlyArray<string>;
  /** member id receiving the active cycle's payout. */
  recipient: string;
}> = [
  {
    id: 'pool-lagos-rent',
    name: 'Lagos Rent Q2',
    cycleNumber: 10,
    cycleCount: 12,
    contributionPerMember: 1_200_000,
    members: [
      { id: 'm-adaeze', name: 'Adaeze O.' },
      { id: 'm-kola', name: 'Kola A.' },
      { id: 'm-moyo', name: 'Moyo I.' },
      { id: 'm-tola', name: 'Tola B.' },
      { id: 'm-you', name: 'You' },
    ],
    paid: ['m-adaeze', 'm-kola', 'm-you'],
    recipient: 'm-moyo',
  },
  {
    id: 'pool-family-feb',
    name: 'Family group · Feb',
    cycleNumber: 6,
    cycleCount: 8,
    contributionPerMember: 500_000,
    members: [
      { id: 'fm-1', name: 'Chika' },
      { id: 'fm-2', name: 'Bola' },
      { id: 'fm-3', name: 'Ngozi' },
      { id: 'fm-4', name: 'You' },
    ],
    paid: ['fm-1', 'fm-2'],
    recipient: 'fm-3',
  },
  {
    id: 'pool-ibadan-trip',
    name: 'Ibadan trip 2026',
    cycleNumber: 2,
    cycleCount: 6,
    contributionPerMember: 1_850_000,
    members: [
      { id: 'it-1', name: 'Funke' },
      { id: 'it-2', name: 'Sade' },
      { id: 'it-3', name: 'You' },
    ],
    paid: ['it-1'],
    recipient: 'it-2',
  },
  {
    id: 'pool-chamasave',
    name: 'ChamaSave · main',
    cycleNumber: 7,
    cycleCount: 12,
    contributionPerMember: 800_000,
    members: [
      { id: 'cs-1', name: 'Aisha' },
      { id: 'cs-2', name: 'Yemi' },
      { id: 'cs-3', name: 'You' },
    ],
    paid: ['cs-1', 'cs-2'],
    recipient: 'cs-3',
  },
];

const NOW = '2026-04-22T10:00:00Z';

function buildPoolBundle(def: (typeof POOL_DEFINITIONS)[number]): {
  group: Group;
  members: Member[];
  cycles: Cycle[];
  payments: Payment[];
} {
  const group: Group = {
    id: def.id,
    name: def.name,
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
  };
  const members: Member[] = def.members.map((m, idx) => ({
    id: m.id,
    name: m.name,
    phone: `2348000000${String(idx).padStart(3, '0')}`,
    position: idx + 1,
    status: 'active',
    groupId: def.id,
    createdAt: NOW,
    updatedAt: NOW,
    version: 1,
  }));
  const cycles: Cycle[] = Array.from({ length: def.cycleCount }, (_, i) => {
    const cycleNumber = i + 1;
    const status: Cycle['status'] =
      cycleNumber < def.cycleNumber
        ? 'closed'
        : cycleNumber === def.cycleNumber
          ? 'active'
          : 'pending';
    return {
      id: `${def.id}-c${cycleNumber}`,
      cycleNumber,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
      contributionPerMember: def.contributionPerMember,
      totalAmount: def.contributionPerMember * def.members.length,
      recipientMemberId: status === 'active' ? def.recipient : def.members[i % def.members.length].id,
      status,
      groupId: def.id,
      createdAt: NOW,
      updatedAt: NOW,
      version: 1,
    };
  });
  const activeCycleId = `${def.id}-c${def.cycleNumber}`;
  const payments: Payment[] = def.paid.map((memberId, idx) => ({
    id: `${def.id}-p${idx}`,
    memberId,
    cycleId: activeCycleId,
    amount: def.contributionPerMember,
    currency: 'NGN',
    paymentDate: '2026-04-20',
    createdAt: NOW,
    updatedAt: NOW,
  }));
  return { group, members, cycles, payments };
}

const POOL_BUNDLES = POOL_DEFINITIONS.map(buildPoolBundle);

export function getMemberHomeFixture(): {
  aggregates: HomeAggregates;
  pools: ReadonlyArray<PoolSummary>;
  nextPayoutLabel: string;
  todayLabel: string;
} {
  const aggregates = toHomeAggregates({
    pools: POOL_BUNDLES.map(({ members, cycles, payments }) => ({
      members,
      cycles,
      payments,
    })),
  });
  const pools = POOL_BUNDLES.map((b) =>
    toPoolSummary({
      group: b.group,
      members: b.members,
      cycles: b.cycles,
      payments: b.payments,
    }),
  );
  let nextPayoutKobo = 0;
  for (const { cycles, members } of POOL_BUNDLES) {
    const active = cycles.find((c) => c.status === 'active');
    if (!active) continue;
    const total = active.contributionPerMember * members.length;
    if (nextPayoutKobo === 0 || total < nextPayoutKobo) nextPayoutKobo = total;
  }
  return {
    aggregates,
    pools,
    nextPayoutLabel: formatNgn(nextPayoutKobo),
    todayLabel: 'Thursday, 22 April 2026',
  };
}

export function getMemberPoolDetailFixture(): { detail: PoolDetail } {
  const bundle = POOL_BUNDLES[0]; // Lagos Rent Q2
  return {
    detail: toPoolDetail({
      group: bundle.group,
      members: bundle.members,
      cycles: bundle.cycles,
      payments: bundle.payments,
    }),
  };
}

export function getMemberInboxFixture(): { items: ReadonlyArray<InboxItem> } {
  return {
    items: [
      {
        id: 'p-inbox-1',
        userId: 'preview',
        kind: 'receipt_confirmed',
        title: 'Your payment was confirmed',
        body: 'Lagos Rent Q2 · ₦12,000 · cycle 9',
        createdAt: '2026-04-20T10:00:00Z',
      },
      {
        id: 'p-inbox-2',
        userId: 'preview',
        kind: 'payout_scheduled',
        title: 'Payout arriving Friday',
        body: 'Ibadan trip 2026 · ₦18,500',
        createdAt: '2026-04-18T10:00:00Z',
      },
      {
        id: 'p-inbox-3',
        userId: 'preview',
        kind: 'admin_message',
        title: 'Tola B. joined Ibadan trip',
        body: 'Ibadan trip 2026',
        createdAt: '2026-04-15T10:00:00Z',
        readAt: '2026-04-15T10:30:00Z',
      },
      {
        id: 'p-inbox-4',
        userId: 'preview',
        kind: 'admin_message',
        title: 'Adaeze O. replied on WhatsApp',
        body: 'Lagos Rent Q2',
        createdAt: '2026-04-15T08:00:00Z',
        readAt: '2026-04-15T09:00:00Z',
      },
      {
        id: 'p-inbox-5',
        userId: 'preview',
        kind: 'overdue',
        title: 'Contribution overdue',
        body: 'Family group · Feb · ₦5,000',
        createdAt: '2026-04-08T10:00:00Z',
        readAt: '2026-04-08T11:00:00Z',
      },
    ],
  };
}

export function getMemberProfileFixture(): {
  displayName: string;
  email: string;
} {
  return {
    displayName: 'Ngozi Okoye',
    email: 'ngozi@chamasave.ng',
  };
}
