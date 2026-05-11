/**
 * Static admin-experience fixtures for the dev-only preview routes.
 *
 * Like `member-fixtures.ts`, these shapes never ship to production,
 * every admin preview route gates on `process.env.NODE_ENV !== 'production'`
 * and 404s otherwise. Names and numbers mirror the handoff artboards so
 * the slice-3 screenshot matrix can match the design source.
 *
 * Slice 5 (WhatsApp ingestion) replaces these fixtures with the real
 * API queries; admin pages stay unchanged because they consume the
 * same view-model shapes.
 */

import type {
  Cycle,
  Group,
  Member,
  Payment,
  Receipt,
} from '@/lib/types';
import {
  toAdminCycleRow,
  toAdminGroupHeader,
  toAdminGroupOverview,
  toAdminMemberRow,
  toAdminPaymentRow,
  toQueueAggregates,
  toReceiptQueueRow,
  type AdminCycleRow,
  type AdminGroupActivityRow,
  type AdminGroupHeader,
  type AdminGroupOverview,
  type AdminMemberRow,
  type AdminPaymentRow,
  type QueueAggregates,
  type ReceiptQueueRow,
} from '@/lib/view-models/admin';
import type { GroupSettingsRow } from '@/components/admin/group-settings-view';
import type { GroupViewData } from '@/components/admin/group-view';

const NOW_ISO = '2026-04-22T10:00:00Z';
export const ADMIN_PREVIEW_NOW = new Date(NOW_ISO);

// ─── Pool definitions, admin scopes to two of these ─────────────────────

interface PoolDefinition {
  id: string;
  name: string;
  cycleCount: number;
  activeCycleNumber: number;
  contributionPerMember: number;
  members: ReadonlyArray<{ id: string; name: string; joinedAt: string }>;
  /** member ids that have paid the active cycle. */
  paidActive: ReadonlyArray<string>;
  /** rotation recipient for the active cycle. */
  activeRecipient: string;
}

const POOLS: ReadonlyArray<PoolDefinition> = [
  {
    id: 'pool-lagos-rent',
    name: 'Lagos Rent Q2',
    cycleCount: 12,
    activeCycleNumber: 10,
    contributionPerMember: 1_200_000,
    members: [
      { id: 'm-adaeze', name: 'Adaeze O.', joinedAt: '2026-01-10' },
      { id: 'm-kola', name: 'Kola A.', joinedAt: '2026-01-10' },
      { id: 'm-moyo', name: 'Moyo I.', joinedAt: '2026-01-12' },
      { id: 'm-tola', name: 'Tola B.', joinedAt: '2026-01-15' },
      { id: 'm-ngozi', name: 'Ngozi O.', joinedAt: '2026-01-15' },
    ],
    paidActive: ['m-adaeze', 'm-kola', 'm-ngozi'],
    activeRecipient: 'm-moyo',
  },
  {
    id: 'pool-family-feb',
    name: 'Family group · Feb',
    cycleCount: 8,
    activeCycleNumber: 6,
    contributionPerMember: 500_000,
    members: [
      { id: 'fm-1', name: 'Chika E.', joinedAt: '2026-02-01' },
      { id: 'fm-2', name: 'Bola T.', joinedAt: '2026-02-01' },
      { id: 'fm-3', name: 'Funke A.', joinedAt: '2026-02-04' },
      { id: 'fm-4', name: 'Ngozi O.', joinedAt: '2026-02-04' },
    ],
    paidActive: ['fm-1', 'fm-2'],
    activeRecipient: 'fm-3',
  },
];

interface PoolBundle {
  group: Group;
  members: Member[];
  cycles: Cycle[];
  payments: Payment[];
}

function buildPoolBundle(def: PoolDefinition): PoolBundle {
  const group: Group = {
    id: def.id,
    name: def.name,
    status: 'active',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    version: 1,
  };

  const members: Member[] = def.members.map((m, idx) => ({
    id: m.id,
    name: m.name,
    phone: `2348030000${String(idx).padStart(3, '0')}`,
    position: idx + 1,
    status: 'active',
    groupId: def.id,
    joinedAt: m.joinedAt,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    version: 1,
  }));

  const cycles: Cycle[] = Array.from({ length: def.cycleCount }, (_, i) => {
    const cycleNumber = i + 1;
    const status: Cycle['status'] =
      cycleNumber < def.activeCycleNumber
        ? 'closed'
        : cycleNumber === def.activeCycleNumber
          ? 'active'
          : 'pending';
    const recipient =
      cycleNumber === def.activeCycleNumber
        ? def.activeRecipient
        : def.members[(cycleNumber - 1) % def.members.length].id;
    return {
      id: `${def.id}-c${cycleNumber}`,
      cycleNumber,
      startDate: '2026-01-01',
      endDate: '2026-01-07',
      contributionPerMember: def.contributionPerMember,
      totalAmount: def.contributionPerMember * def.members.length,
      recipientMemberId: recipient,
      status,
      groupId: def.id,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
      version: 1,
    };
  });

  const activeCycleId = `${def.id}-c${def.activeCycleNumber}`;
  const activePayments: Payment[] = def.paidActive.map((memberId, idx) => ({
    id: `${def.id}-p-active-${idx}`,
    memberId,
    cycleId: activeCycleId,
    amount: def.contributionPerMember,
    currency: 'NGN',
    paymentDate: '2026-04-20',
    confirmedAt: NOW_ISO,
    confirmedBy: 'admin-preview',
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  }));

  // Backfill closed-cycle payments so the cycle table renders collected
  // totals that match the "closed" pill.
  const closedPayments: Payment[] = [];
  for (let n = 1; n < def.activeCycleNumber; n++) {
    for (let m = 0; m < def.members.length; m++) {
      closedPayments.push({
        id: `${def.id}-p-c${n}-${m}`,
        memberId: def.members[m].id,
        cycleId: `${def.id}-c${n}`,
        amount: def.contributionPerMember,
        currency: 'NGN',
        paymentDate: '2026-04-01',
        confirmedAt: '2026-04-01T10:00:00Z',
        confirmedBy: 'admin-preview',
        createdAt: NOW_ISO,
        updatedAt: NOW_ISO,
      });
    }
  }

  return {
    group,
    members,
    cycles,
    payments: [...closedPayments, ...activePayments],
  };
}

const BUNDLES: ReadonlyMap<string, PoolBundle> = new Map(
  POOLS.map((def) => [def.id, buildPoolBundle(def)] as const),
);

// ─── Receipts queue fixture ──────────────────────────────────────────────

const RECEIPT_FIXTURES: ReadonlyArray<Receipt> = [
  {
    id: 'rcpt-1',
    source: 'whatsapp',
    groupId: 'pool-lagos-rent',
    matchedMemberId: 'm-adaeze',
    cycleId: 'pool-lagos-rent-c10',
    detectedAmountKobo: 1_200_000,
    expectedAmountKobo: 1_200_000,
    senderPhone: '2348030000000',
    bankTrace: 'GTB · ref 8917-2204',
    note: 'cycle 10 rent share',
    status: 'matched',
    submittedAt: '2026-04-22T08:00:00Z',
  },
  {
    id: 'rcpt-2',
    source: 'whatsapp',
    groupId: 'pool-lagos-rent',
    matchedMemberId: 'm-kola',
    cycleId: 'pool-lagos-rent-c10',
    detectedAmountKobo: 1_200_000,
    expectedAmountKobo: 1_200_000,
    senderPhone: '2348030000001',
    note: 'paid via Kuda',
    status: 'matched',
    submittedAt: '2026-04-22T06:30:00Z',
  },
  {
    id: 'rcpt-3',
    source: 'whatsapp',
    groupId: 'pool-family-feb',
    matchedMemberId: null,
    cycleId: 'pool-family-feb-c6',
    expectedAmountKobo: 500_000,
    senderPhone: '2348030099912',
    status: 'unmatched',
    submittedAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 'rcpt-4',
    source: 'whatsapp',
    groupId: 'pool-family-feb',
    matchedMemberId: 'fm-3',
    cycleId: 'pool-family-feb-c6',
    detectedAmountKobo: 500_000,
    expectedAmountKobo: 500_000,
    senderPhone: '2348030000002',
    note: 'feb contrib',
    status: 'matched',
    submittedAt: '2026-04-21T18:00:00Z',
  },
];

export interface ReceiptsQueueFixture {
  rows: ReadonlyArray<ReceiptQueueRow>;
  aggregates: QueueAggregates;
  groupCount: number;
}

export function getAdminReceiptsFixture(): ReceiptsQueueFixture {
  const rows = RECEIPT_FIXTURES.map((receipt) => {
    const bundle = BUNDLES.get(receipt.groupId);
    if (!bundle) {
      throw new Error(`admin-fixtures: unknown groupId ${receipt.groupId}`);
    }
    const cycle = bundle.cycles.find((c) => c.id === receipt.cycleId);
    const member =
      receipt.matchedMemberId === null
        ? null
        : bundle.members.find((m) => m.id === receipt.matchedMemberId) ?? null;
    return toReceiptQueueRow({
      receipt,
      group: bundle.group,
      cycle,
      member,
      now: ADMIN_PREVIEW_NOW,
    });
  });

  const aggregates = toQueueAggregates({
    receipts: RECEIPT_FIXTURES,
    now: ADMIN_PREVIEW_NOW,
  });

  return {
    rows,
    aggregates,
    groupCount: POOLS.length,
  };
}

// ─── Group view fixture ──────────────────────────────────────────────────

const PREVIEW_ACTIVITY: ReadonlyArray<AdminGroupActivityRow> = [
  {
    id: 'act-1',
    icon: 'Check',
    title: 'You confirmed Adaeze O. · ₦12,000',
    whenLabel: '2h',
  },
  {
    id: 'act-2',
    icon: 'MessageSquare',
    title: 'Bot pinged Moyo I. on WhatsApp',
    whenLabel: '6h',
  },
  {
    id: 'act-3',
    icon: 'HandCoins',
    title: 'Cycle 9 paid out · ₦60,000 to Moyo I.',
    whenLabel: '4d',
  },
  {
    id: 'act-4',
    icon: 'UserPlus',
    title: 'Ngozi O. joined Lagos Rent Q2',
    whenLabel: '6d',
  },
];

function buildSettingsRows(
  bundle: PoolBundle,
  activeCycleNumber: number,
): ReadonlyArray<GroupSettingsRow> {
  return [
    { kicker: 'Name', value: bundle.group.name },
    { kicker: 'Cadence', value: 'Weekly · NGN' },
    {
      kicker: 'Contribution',
      value: `₦${(bundle.cycles[0].contributionPerMember / 100).toLocaleString()}`,
    },
    { kicker: 'Members', value: String(bundle.members.length) },
    {
      kicker: 'Active cycle',
      value: `cycle ${activeCycleNumber} of ${bundle.cycles.length}`,
    },
  ];
}

export interface AdminGroupFixture {
  header: AdminGroupHeader;
  overview: AdminGroupOverview;
  members: ReadonlyArray<AdminMemberRow>;
  cycles: ReadonlyArray<AdminCycleRow>;
  payments: ReadonlyArray<AdminPaymentRow>;
  receipts: ReadonlyArray<ReceiptQueueRow>;
  data: GroupViewData;
  crossGroupReceiptCount: number;
}

const KNOWN_POOL_IDS = new Set(POOLS.map((p) => p.id));

export function isKnownPreviewPoolId(id: string): boolean {
  return KNOWN_POOL_IDS.has(id);
}

export function getAdminGroupFixture(poolId: string): AdminGroupFixture {
  const bundle = BUNDLES.get(poolId);
  if (!bundle) {
    throw new Error(`admin-fixtures: unknown poolId ${poolId}`);
  }
  const def = POOLS.find((p) => p.id === poolId);
  if (!def) {
    throw new Error(`admin-fixtures: missing definition for ${poolId}`);
  }

  const header = toAdminGroupHeader(bundle.group, bundle.members);

  const overview = toAdminGroupOverview({
    group: bundle.group,
    members: bundle.members,
    cycles: bundle.cycles,
    payments: bundle.payments,
    activity: PREVIEW_ACTIVITY,
  });

  const memberRows = bundle.members.map((member) =>
    toAdminMemberRow({
      member,
      cycles: bundle.cycles,
      payments: bundle.payments,
    }),
  );

  const cycleRows = bundle.cycles.map((cycle) =>
    toAdminCycleRow({
      cycle,
      members: bundle.members,
      payments: bundle.payments,
    }),
  );

  const paymentRows = bundle.payments
    .slice()
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
    .slice(0, 8)
    .map((payment) =>
      toAdminPaymentRow({
        payment,
        member: bundle.members.find((m) => m.id === payment.memberId),
        cycle: bundle.cycles.find((c) => c.id === payment.cycleId),
        now: ADMIN_PREVIEW_NOW,
      }),
    );

  const receiptRows = RECEIPT_FIXTURES.filter(
    (r) => r.groupId === poolId,
  ).map((receipt) => {
    const cycle = bundle.cycles.find((c) => c.id === receipt.cycleId);
    const member =
      receipt.matchedMemberId === null
        ? null
        : bundle.members.find((m) => m.id === receipt.matchedMemberId) ?? null;
    return toReceiptQueueRow({
      receipt,
      group: bundle.group,
      cycle,
      member,
      now: ADMIN_PREVIEW_NOW,
    });
  });

  const settingsRows = buildSettingsRows(bundle, def.activeCycleNumber);

  const data: GroupViewData = {
    header,
    overview,
    members: memberRows,
    cycles: cycleRows,
    payments: paymentRows,
    receipts: receiptRows,
    settings: {
      poolRows: settingsRows,
      whatsappGroupId: `wa-${poolId}`,
      whatsappGroupLabel: `${bundle.group.name} · WhatsApp`,
      whatsappActive: true,
      toggles: { autoNudge: true, allowUnlinkedReceipts: false },
    },
  };

  return {
    header,
    overview,
    members: memberRows,
    cycles: cycleRows,
    payments: paymentRows,
    receipts: receiptRows,
    data,
    crossGroupReceiptCount: RECEIPT_FIXTURES.filter(
      (r) => r.status === 'matched' || r.status === 'unmatched',
    ).length,
  };
}

/** First pool id, preview routes that don't specify a target use this. */
export const DEFAULT_PREVIEW_POOL_ID = POOLS[0].id;
