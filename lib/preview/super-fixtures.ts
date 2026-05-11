/**
 * Static super-admin fixtures for the dev-only preview routes.
 *
 * Slice-4 deviation #2: poolpay-api has no super-view list endpoints
 * yet (no system-wide receipts feed, no cross-group admin roster, no
 * health-pill aggregation). Until those land, the four /sys list
 * routes render against these fixtures with FIXME pointers naming the
 * missing endpoints. Add-admin modal flows end-to-end against the real
 * `POST /api/admin/users` + grants.
 *
 * Names + amounts mirror `super-desktop.jsx` so the slice-4 screenshot
 * matrix (run as a separate task) can compare against the design
 * source verbatim. Plan §8 references `admin3` + `admin4` from the
 * dev-seeder, which exist as runtime seeded data but not in source,
 * we fabricate them here directly.
 */

import type { AnyCurrency } from '@/lib/format/currency';
import type {
  GroupChipOption,
  GroupRecordRow,
  SystemAdminRow,
  SystemAdminsAggregates,
  SystemGroupDetail,
  SystemGroupRow,
  SystemGroupsAggregates,
  SystemReceiptRow,
  SystemReceiptsAggregates,
  WhatsAppBotStats,
  WhatsAppLinksAggregates,
  WhatsAppLinkRow,
} from '@/lib/view-models/super';
import {
  formatContributionLabel,
  pickPoolSwatch,
} from '@/lib/view-models/super';

const NOW_ISO = '2026-04-22T10:00:00Z';
export const SUPER_PREVIEW_NOW = new Date(NOW_ISO);

interface PoolSeed {
  poolId: string;
  name: string;
  /** Currency carried per-pool, handoff §4. Today all NGN. */
  currency: AnyCurrency;
  cadence: 'weekly' | 'biweekly' | 'monthly';
  /** Pre-formatted "10/12" string for the system list cycles column. */
  cyclesLabel: string;
  memberCount: number;
  /** Cycle contribution amount in minor units (kobo for NGN). */
  contributionAmount: number;
  adminId: string | null;
  /** Pool-level health 0..100 driving the row tone + bar fill. */
  health: number;
}

const POOLS: ReadonlyArray<PoolSeed> = [
  { poolId: 'pool-lagos-rent', name: 'Lagos Rent Q2',     currency: 'NGN', cadence: 'weekly',   cyclesLabel: '10/12', memberCount: 5,  contributionAmount: 1_200_000, adminId: 'admin1', health: 92 },
  { poolId: 'pool-ibadan-trip', name: 'Ibadan Trip 2026', currency: 'NGN', cadence: 'monthly',  cyclesLabel: '2/6',   memberCount: 6,  contributionAmount: 1_500_000, adminId: 'admin2', health: 88 },
  { poolId: 'pool-chama-main',  name: 'ChamaSave · main', currency: 'NGN', cadence: 'weekly',   cyclesLabel: '14/24', memberCount: 12, contributionAmount:   850_000, adminId: 'admin1', health: 95 },
  { poolId: 'pool-family',      name: 'Family group',     currency: 'NGN', cadence: 'monthly',  cyclesLabel: '6/8',   memberCount: 8,  contributionAmount:   500_000, adminId: 'admin3', health: 71 },
  { poolId: 'pool-ore-lagos',   name: 'Ore Lagos',        currency: 'NGN', cadence: 'weekly',   cyclesLabel: '3/10',  memberCount: 10, contributionAmount: 2_000_000, adminId: 'admin3', health: 84 },
  { poolId: 'pool-eko-market',  name: 'Eko Market',       currency: 'NGN', cadence: 'weekly',   cyclesLabel: '1/12',  memberCount: 7,  contributionAmount:   600_000, adminId: null,     health: 40 },
  { poolId: 'pool-aba',         name: 'Aba Collective',   currency: 'NGN', cadence: 'biweekly', cyclesLabel: '8/16',  memberCount: 14, contributionAmount: 1_000_000, adminId: 'admin4', health: 89 },
  { poolId: 'pool-ph',          name: 'Port Harcourt Co.', currency: 'NGN', cadence: 'monthly', cyclesLabel: '4/6',   memberCount: 5,  contributionAmount: 2_500_000, adminId: 'admin2', health: 78 },
];

interface AdminSeed {
  id: string;
  name: string;
  email: string;
  phoneE164: string;
  active: boolean;
  lastSeenLabel: string;
}

const ADMINS: ReadonlyArray<AdminSeed> = [
  { id: 'admin1', name: 'Ngozi Okoye',  email: 'ngozi@chamasave.ng',  phoneE164: '+234 803 456 7890', active: true,  lastSeenLabel: '2h ago' },
  { id: 'admin2', name: 'Bola Adebayo', email: 'bola@chamasave.ng',   phoneE164: '+234 806 221 9987', active: true,  lastSeenLabel: '1d ago' },
  { id: 'admin3', name: 'Femi Martins', email: 'femi@chamasave.ng',   phoneE164: '+234 812 004 1200', active: true,  lastSeenLabel: '3d ago' },
  { id: 'admin4', name: 'Adanna Uche',  email: 'adanna@chamasave.ng', phoneE164: '+234 909 881 2210', active: true,  lastSeenLabel: '5h ago' },
  { id: 'admin5', name: 'Chidi Obi',    email: 'chidi@chamasave.ng',  phoneE164: '+234 803 552 6612', active: false, lastSeenLabel: '2w ago' },
];

function adminById(id: string | null): AdminSeed | null {
  if (!id) return null;
  return ADMINS.find((a) => a.id === id) ?? null;
}

function poolInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// ─── /sys/receipts (system-wide) ────────────────────────────────────────

interface ReceiptSeed {
  receiptId: string;
  poolId: string;
  fromName: string;
  amountMinor: number;
  submittedLabel: string;
  waitingLabel: string;
  flag: 'stale' | 'no-admin' | null;
}

const SYS_RECEIPT_SEEDS: ReadonlyArray<ReceiptSeed> = [
  { receiptId: 'rcpt-sys-1', poolId: 'pool-lagos-rent', fromName: 'Moyo I.',     amountMinor: 1_200_000, submittedLabel: '2h · WhatsApp', waitingLabel: '2h', flag: null },
  { receiptId: 'rcpt-sys-2', poolId: 'pool-chama-main', fromName: 'Chioma E.',    amountMinor:   850_000, submittedLabel: '4h · WhatsApp', waitingLabel: '4h', flag: null },
  { receiptId: 'rcpt-sys-3', poolId: 'pool-ibadan-trip',fromName: 'Tola B.',      amountMinor: 1_500_000, submittedLabel: '5h · WhatsApp', waitingLabel: '5h', flag: null },
  { receiptId: 'rcpt-sys-4', poolId: 'pool-family',     fromName: 'Yemi K.',      amountMinor:   500_000, submittedLabel: '1d · WhatsApp', waitingLabel: '1d', flag: 'stale' },
  { receiptId: 'rcpt-sys-5', poolId: 'pool-ore-lagos',  fromName: 'Dapo L.',      amountMinor: 2_000_000, submittedLabel: '2d · WhatsApp', waitingLabel: '2d', flag: 'stale' },
  { receiptId: 'rcpt-sys-6', poolId: 'pool-eko-market', fromName: 'Ifeoma P.',    amountMinor:   600_000, submittedLabel: '3d · WhatsApp', waitingLabel: '3d', flag: 'no-admin' },
  { receiptId: 'rcpt-sys-7', poolId: 'pool-aba',        fromName: 'Nnaemeka H.',  amountMinor: 1_000_000, submittedLabel: '5h · WhatsApp', waitingLabel: '5h', flag: null },
];

function receiptTone(flag: ReceiptSeed['flag']): SystemReceiptRow['tone'] {
  if (flag === 'no-admin') return 'out';
  if (flag === 'stale') return 'stale';
  return 'pending';
}

export interface SystemReceiptsFixture {
  rows: ReadonlyArray<SystemReceiptRow>;
  aggregates: SystemReceiptsAggregates;
}

export function getSystemReceiptsFixture(): SystemReceiptsFixture {
  const rows: SystemReceiptRow[] = SYS_RECEIPT_SEEDS.map((seed) => {
    const pool = POOLS.find((p) => p.poolId === seed.poolId);
    if (!pool) throw new Error(`super-fixtures: unknown pool ${seed.poolId}`);
    const admin = adminById(pool.adminId);
    return {
      receiptId: seed.receiptId,
      poolId: pool.poolId,
      poolName: pool.name,
      poolInitial: poolInitial(pool.name),
      poolSwatch: pickPoolSwatch(pool.poolId),
      adminName: admin?.name ?? null,
      fromName: seed.fromName,
      amountLabel: formatContributionLabel(seed.amountMinor, pool.currency),
      submittedLabel: seed.submittedLabel,
      waitingLabel: seed.waitingLabel,
      flag: seed.flag,
      tone: receiptTone(seed.flag),
    };
  });

  const aggregates: SystemReceiptsAggregates = {
    pending: 47,
    groups: 14,
    stale: 6,
    oldestLabel: '3d',
    noAdmin: 1,
    noAdminPoolName: 'Eko Market',
    confirmedLast7d: 142,
    confirmedAdmins: 5,
    autoMatchRateLabel: '78%',
  };

  return { rows, aggregates };
}

// ─── /sys/groups ────────────────────────────────────────────────────────

function groupTone(seed: PoolSeed): SystemGroupRow['tone'] {
  if (seed.adminId === null) return 'orphan';
  if (seed.health < 60) return 'out';
  if (seed.health < 85) return 'pending';
  return 'paid';
}

function pendingForPool(poolId: string): number {
  return SYS_RECEIPT_SEEDS.filter((r) => r.poolId === poolId).length;
}

function waStatusForPool(poolId: string): SystemGroupRow['waStatus'] {
  // Mirrors the design's wa column: most are linked; family + eko + ph
  // are deliberate offline/pending states for the artboard.
  if (poolId === 'pool-family' || poolId === 'pool-eko-market') return 'unlinked';
  if (poolId === 'pool-ph') return 'pending';
  return 'linked';
}

export interface SystemGroupsFixture {
  rows: ReadonlyArray<SystemGroupRow>;
  aggregates: SystemGroupsAggregates;
}

export function getSystemGroupsFixture(): SystemGroupsFixture {
  const rows: SystemGroupRow[] = POOLS.map((seed) => {
    const admin = adminById(seed.adminId);
    return {
      poolId: seed.poolId,
      poolName: seed.name,
      poolInitial: poolInitial(seed.name),
      poolSwatch: pickPoolSwatch(seed.poolId),
      currency: seed.currency,
      memberCount: seed.memberCount,
      cyclesLabel: seed.cyclesLabel,
      cadence: seed.cadence,
      adminName: admin?.name ?? null,
      waStatus: waStatusForPool(seed.poolId),
      pendingReceiptsCount: pendingForPool(seed.poolId),
      health: seed.health,
      tone: groupTone(seed),
    };
  });

  const unlinkedFromWhatsApp = rows.filter((r) => r.waStatus === 'unlinked').length;
  const adminCount = new Set(
    POOLS.map((p) => p.adminId).filter((id): id is string => id !== null),
  ).size;

  return {
    rows,
    aggregates: {
      groupCount: POOLS.length,
      adminCount,
      unlinkedFromWhatsApp,
    },
  };
}

// ─── /sys/groups/[poolId] ──────────────────────────────────────────────

export function getSystemGroupDetailFixture(
  poolId: string,
): SystemGroupDetail | null {
  const seed = POOLS.find((p) => p.poolId === poolId);
  if (!seed) return null;
  const admin = adminById(seed.adminId);

  const record: GroupRecordRow[] = [
    { kicker: 'Name', value: seed.name },
    { kicker: 'Group ID', value: `grp_${seed.poolId.toUpperCase()}`, mono: true },
    { kicker: 'Currency', value: `${seed.currency} · Nigerian naira` },
    { kicker: 'Cadence', value: `${seed.cadence} · Fri` },
    {
      kicker: 'Contribution',
      value: formatContributionLabel(seed.contributionAmount, seed.currency),
    },
    {
      kicker: 'Members',
      value: `${seed.memberCount} active`,
    },
    { kicker: 'Created', value: '12 Jan 2026' },
    { kicker: 'Status', value: 'active' },
  ];

  const linked = waStatusForPool(seed.poolId) === 'linked';

  return {
    poolId: seed.poolId,
    poolName: seed.name,
    poolInitial: poolInitial(seed.name),
    poolSwatch: pickPoolSwatch(seed.poolId),
    subLabel: `group_id · grp_${seed.poolId.slice(-8)} · created 12 Jan 2026${admin ? ` by ${admin.name}` : ''}`,
    record,
    admin: admin
      ? {
          name: admin.name,
          email: admin.email,
          groupCount: POOLS.filter((p) => p.adminId === admin.id).length,
          initial: admin.name.charAt(0).toUpperCase(),
        }
      : null,
    whatsapp: {
      linked,
      chatName: linked ? seed.name : null,
      waGroupId: linked ? `120363…${seed.poolId.length}492` : null,
      botActive: linked,
    },
    audit: [
      { id: 'a1', whenLabel: '1h',  who: admin?.name ?? 'system', isMachine: !admin, action: `confirmed receipt · ${formatContributionLabel(seed.contributionAmount, seed.currency)} from Adaeze` },
      { id: 'a2', whenLabel: '4h',  who: 'bot',     isMachine: true,  action: 'matched WhatsApp msg → member Moyo I.' },
      { id: 'a3', whenLabel: '1d',  who: 'you',     isMachine: false, action: `reassigned admin to ${admin?.name ?? 'unassigned'}` },
      { id: 'a4', whenLabel: '1w',  who: 'system',  isMachine: true,  action: 'payout released → Kola' },
      { id: 'a5', whenLabel: '2w',  who: admin?.name ?? 'system', isMachine: !admin, action: 'added Tola B. to rotation · position 5' },
      { id: 'a6', whenLabel: '3mo', who: 'you',     isMachine: false, action: 'created group · initial admin Femi M.' },
    ],
  };
}

/** Default detail target, used by the preview route when no slug is given. */
export const DEFAULT_PREVIEW_SUPER_POOL_ID = 'pool-lagos-rent';

// ─── /sys/admins ────────────────────────────────────────────────────────

export interface SystemAdminsFixture {
  rows: ReadonlyArray<SystemAdminRow>;
  aggregates: SystemAdminsAggregates;
  groupOptions: ReadonlyArray<GroupChipOption>;
  /** Pool ids the modal's "active" chip set will start with for previews. */
  defaultActiveGroupIds: ReadonlyArray<string>;
}

function grantsForAdmin(adminId: string): ReadonlyArray<string> {
  return POOLS.filter((p) => p.adminId === adminId).map((p) => p.name);
}

export function getSystemAdminsFixture(): SystemAdminsFixture {
  const rows: SystemAdminRow[] = ADMINS.map((a) => {
    const grants = grantsForAdmin(a.id);
    return {
      userId: a.id,
      name: a.name,
      email: a.email,
      phoneE164: a.phoneE164,
      grantedGroupNames: grants,
      lastSeenLabel: a.lastSeenLabel,
      active: a.active,
      grantCount: grants.length,
      initial: a.name.charAt(0).toUpperCase(),
    };
  });

  const totalGrants = rows.reduce((acc, r) => acc + r.grantCount, 0);
  const inactive = rows.filter((r) => !r.active).length;

  return {
    rows,
    aggregates: {
      totalAdmins: rows.length,
      inactive,
      totalGrants,
    },
    groupOptions: POOLS.map((p) => ({ poolId: p.poolId, poolName: p.name })),
    defaultActiveGroupIds: ['pool-lagos-rent', 'pool-ore-lagos'],
  };
}

// ─── /sys/whatsapp ──────────────────────────────────────────────────────

interface WaSeed {
  poolId: string;
  /** WhatsApp chat name distinct from the pool name (shows "Ibadan 2026" vs "Ibadan Trip 2026"). */
  chatName: string | null;
  waGroupIdLabel: string | null;
  /** Members the WA roster matches, used to derive drift. */
  matched: string | null;
  /** "2h ago" or null. */
  lastEventLabel: string | null;
  status: 'healthy' | 'drift' | 'pending' | 'unlinked';
}

const WA_SEEDS: ReadonlyArray<WaSeed> = [
  { poolId: 'pool-lagos-rent', chatName: 'Lagos Rent Q2',    waGroupIdLabel: '120363…4492', matched: '5/5',   lastEventLabel: '2h ago', status: 'healthy' },
  { poolId: 'pool-chama-main', chatName: 'ChamaSave',        waGroupIdLabel: '120363…8871', matched: '11/12', lastEventLabel: '4h ago', status: 'healthy' },
  { poolId: 'pool-ibadan-trip',chatName: 'Ibadan 2026',      waGroupIdLabel: '120363…1103', matched: '6/6',   lastEventLabel: '5h ago', status: 'healthy' },
  { poolId: 'pool-ore-lagos',  chatName: 'Ore Lagos chat',   waGroupIdLabel: '120363…2277', matched: '8/10',  lastEventLabel: '1d ago', status: 'drift' },
  { poolId: 'pool-aba',        chatName: 'Aba · savings',    waGroupIdLabel: '120363…5566', matched: '14/14', lastEventLabel: '5h ago', status: 'healthy' },
  { poolId: 'pool-ph',         chatName: null,               waGroupIdLabel: null,         matched: null,    lastEventLabel: null,    status: 'pending' },
  { poolId: 'pool-family',     chatName: null,               waGroupIdLabel: null,         matched: null,    lastEventLabel: null,    status: 'unlinked' },
  { poolId: 'pool-eko-market', chatName: null,               waGroupIdLabel: null,         matched: null,    lastEventLabel: null,    status: 'unlinked' },
];

function botStatusForLink(status: WaSeed['status']): WhatsAppLinkRow['botStatusLabel'] {
  if (status === 'healthy' || status === 'drift') return 'active';
  if (status === 'pending') return 'pending';
  return 'unlinked';
}

export interface SystemWhatsAppFixture {
  rows: ReadonlyArray<WhatsAppLinkRow>;
  aggregates: WhatsAppLinksAggregates;
  bot: WhatsAppBotStats;
}

export function getSystemWhatsAppFixture(): SystemWhatsAppFixture {
  const rows: WhatsAppLinkRow[] = WA_SEEDS.map((seed) => {
    const pool = POOLS.find((p) => p.poolId === seed.poolId);
    if (!pool) throw new Error(`super-fixtures: unknown wa pool ${seed.poolId}`);
    const rosterLabel = `${pool.memberCount}/${pool.memberCount}`;
    let hasDrift = false;
    if (seed.matched && seed.matched.includes('/')) {
      const [matchedNum, totalNum] = seed.matched.split('/').map((n) => parseInt(n, 10));
      hasDrift = Number.isFinite(matchedNum) && Number.isFinite(totalNum) && matchedNum < totalNum;
    }
    return {
      poolId: pool.poolId,
      poolName: pool.name,
      poolInitial: poolInitial(pool.name),
      poolSwatch: pickPoolSwatch(pool.poolId),
      chatName: seed.chatName,
      waGroupIdLabel: seed.waGroupIdLabel,
      rosterLabel,
      matchedLabel: seed.matched,
      botStatusLabel: botStatusForLink(seed.status),
      lastEventLabel: seed.lastEventLabel,
      status: seed.status,
      hasDrift,
    };
  });

  return {
    rows,
    aggregates: {
      total: rows.length,
      linked: rows.filter((r) => r.status === 'healthy' || r.status === 'drift').length,
      pending: rows.filter((r) => r.status === 'pending').length,
      unlinked: rows.filter((r) => r.status === 'unlinked').length,
    },
    bot: {
      ingested7d: 186,
      matchedRateLabel: '78%',
      needsAdmin: 47,
      avgAckLabel: '4.2m',
      online: true,
      botPhone: '+234 700 POOL PAY',
    },
  };
}
