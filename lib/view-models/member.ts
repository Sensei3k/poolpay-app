/**
 * Member-experience view models.
 *
 * The handoff's member screens (MD/MM_Home, MD/MM_Pool) read from a
 * shape that doesn't exist 1:1 in the persisted domain types — pool
 * summaries want a `progressPct`, the detail screen wants per-member
 * payment statuses for the active cycle, etc. This module is the single
 * place where those derived shapes are computed, so the page components
 * stay thin and testable.
 *
 * Domain → view-model is a one-way transform: `Group + Member[] +
 * Cycle[] + Payment[]` (canonical types from `lib/types.ts`) → the
 * shapes the JSX references render. Nothing here mutates the inputs.
 */

import type {
  Cycle,
  CycleStatus,
  Group,
  Member,
  MemberPaymentStatus,
  Payment,
} from '@/lib/types';
import {
  deriveCycleSummary,
  formatNgn,
  getMemberPaymentStatuses,
} from '@/lib/utils';

// ─── PoolSummary — used on /home pool cards ────────────────────────────────

/**
 * Compact pool view for the home "Your pools" grid. Each field maps to a
 * piece of the design's `<div className="pool">` markup so the page can
 * render without re-deriving anything inline.
 */
export interface PoolSummary {
  id: string;
  name: string;
  /** First letter, uppercased, used as the colored avatar glyph. */
  initial: string;
  /** Color slot 'a'..'d' — picked deterministically from the pool id. */
  swatch: 'a' | 'b' | 'c' | 'd';
  /** Subtitle line below the name, e.g. "weekly · 10/12" */
  subtitle: string;
  /** Progress percent 0..100 used for the bar fill. */
  progressPct: number;
  /** Pre-formatted balance / contribution figure, e.g. "₦ 84,000". */
  amountLabel: string;
  /** Tail label rendered next to the amount, e.g. "on track" or "due Fri". */
  footnote: string;
  /**
   * Optional callout shown under mobile cards (MM_Home), e.g. "Pay ₦12,000
   * by Fri" or "Payout arriving". `undefined` = no callout.
   */
  callout?: {
    label: string;
    /** `true` = warning-tone (orange wash) — overdue / due-soon. */
    hot: boolean;
  };
}

// ─── PoolDetail — used on /pools/:poolId ───────────────────────────────────

export interface PoolDetailMemberRow {
  member: Member;
  /** 'paid' | 'pending' | 'out' — keyed to the status-row gradient palette. */
  tone: 'paid' | 'pending' | 'out';
  /** Display label for the row pill; matches `tone` directly. */
  label: 'paid' | 'pending' | 'overdue';
  /** True for the cycle's recipient — annotated as "payout this cycle". */
  isPayoutRecipient: boolean;
  /** Pre-formatted contribution amount, e.g. "₦ 12,000". */
  amountLabel: string;
}

export interface PoolDetailCycleCell {
  index: number;
  /**
   * 'closed' = past, fully paid. 'open' = active, in-flight. 'upcoming' =
   * future. The mini progress strip on /pools/:poolId paints these as the
   * solid / outlined / muted blocks.
   */
  state: 'closed' | 'open' | 'upcoming';
}

export interface PoolDetailActivityRow {
  id: string;
  /** Lucide icon name — matches the inline icon column. */
  icon: 'ArrowUp' | 'Check' | 'HandCoins' | 'UserPlus';
  title: string;
  /** Pre-formatted relative time, e.g. "2 days ago". */
  whenLabel: string;
}

export interface PoolDetail {
  pool: Group;
  /** "Weekly · NGN · cycle 10 of 12 · you contribute ₦ 12,000/wk" */
  metaLine: string;
  cycle: {
    id: string;
    index: number;
    /** Total cycles planned for the pool. */
    totalCycles: number;
    status: CycleStatus;
    /** Pre-formatted contribution for the current cycle, e.g. "₦ 12,000". */
    contributionLabel: string;
    /** Pre-formatted payout pot, e.g. "₦ 96,000". */
    payoutLabel: string;
    /** Recipient member for the current cycle (drives the "→ Adaeze O." copy). */
    recipient: Member;
  };
  /** Mini progress strip cells, one per planned cycle. */
  cycleCells: ReadonlyArray<PoolDetailCycleCell>;
  /** Per-member payment statuses for the *current* cycle. */
  members: ReadonlyArray<PoolDetailMemberRow>;
  /** Counts for the "3 paid · 1 pending · 1 outstanding" header. */
  counts: {
    paid: number;
    pending: number;
    outstanding: number;
  };
  /** Recent activity rows. Hardcoded for slice 2 — no activity feed API yet. */
  activity: ReadonlyArray<PoolDetailActivityRow>;
}

// ─── Derivation helpers ────────────────────────────────────────────────────

const SWATCHES = ['a', 'b', 'c', 'd'] as const;
type Swatch = (typeof SWATCHES)[number];

/**
 * Pick a swatch deterministically from the pool id so the same pool always
 * renders with the same accent color. A simple sum-of-codepoints hash is
 * enough — collisions are aesthetic only.
 */
function pickSwatch(id: string): Swatch {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return SWATCHES[sum % SWATCHES.length];
}

/**
 * Express a frequency from `Cycle.cycleNumber` cadence as the design's
 * lowercase phrase ("weekly", "monthly"). `Cycle.cycleNumber` doesn't
 * carry cadence directly — we read it from the group's name suffix as a
 * heuristic for slice 2's mock data, defaulting to 'weekly'. Real
 * cadence support arrives when the API ships the field.
 */
function cadenceFromGroup(group: Group): 'weekly' | 'monthly' {
  return /month/i.test(group.name) || /family/i.test(group.name)
    ? 'monthly'
    : 'weekly';
}

function uppercaseFirst(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '·';
}

interface ToPoolSummaryInput {
  group: Group;
  members: ReadonlyArray<Member>;
  cycles: ReadonlyArray<Cycle>;
  payments: ReadonlyArray<Payment>;
}

/**
 * Build a `PoolSummary` from the canonical group + members + cycles +
 * payments slices for that group. Caller is responsible for pre-filtering
 * the inputs to one pool — we don't do membership lookups here so the
 * function stays trivially testable.
 */
export function toPoolSummary({
  group,
  members,
  cycles,
  payments,
}: ToPoolSummaryInput): PoolSummary {
  const totalCycles = cycles.length;
  const closedCount = cycles.filter((c) => c.status === 'closed').length;
  const activeCycle = cycles.find((c) => c.status === 'active') ?? null;

  // Progress = closed cycles + the active cycle's collection ratio. A pool
  // with no active cycle still tracks closed-vs-total. We avoid dividing
  // by zero by short-circuiting on `totalCycles === 0`.
  const progressPct = (() => {
    if (totalCycles === 0) return 0;
    const base = (closedCount / totalCycles) * 100;
    if (!activeCycle) return Math.round(base);
    const summary = deriveCycleSummary(activeCycle, [...members], [...payments]);
    const cycleSlice = (1 / totalCycles) * 100;
    const ratio =
      summary.totalMembers === 0
        ? 0
        : summary.collectedKobo /
          (summary.totalMembers * activeCycle.contributionPerMember);
    return Math.min(100, Math.round(base + cycleSlice * ratio));
  })();

  const cadence = cadenceFromGroup(group);
  const subtitle =
    totalCycles > 0
      ? `${cadence} · ${closedCount + (activeCycle ? 1 : 0)}/${totalCycles}`
      : cadence;

  const amountLabel = activeCycle
    ? formatNgn(activeCycle.contributionPerMember * members.length)
    : formatNgn(0);

  const footnote = activeCycle
    ? `${members.length} ${members.length === 1 ? 'member' : 'members'}`
    : group.status === 'closed'
      ? 'closed'
      : 'no active cycle';

  return {
    id: group.id,
    name: group.name,
    initial: uppercaseFirst(group.name),
    swatch: pickSwatch(group.id),
    subtitle,
    progressPct,
    amountLabel,
    footnote,
  };
}

interface ToPoolDetailInput {
  group: Group;
  members: ReadonlyArray<Member>;
  cycles: ReadonlyArray<Cycle>;
  payments: ReadonlyArray<Payment>;
}

/**
 * Build a `PoolDetail` view-model. Throws if there is no active cycle —
 * the pool detail screen only renders for pools mid-flight, and the page
 * component is responsible for short-circuiting the "no active cycle"
 * empty state before calling this.
 */
export function toPoolDetail({
  group,
  members,
  cycles,
  payments,
}: ToPoolDetailInput): PoolDetail {
  const sortedCycles = [...cycles].sort(
    (a, b) => a.cycleNumber - b.cycleNumber,
  );
  const totalCycles = sortedCycles.length;
  const activeCycle = sortedCycles.find((c) => c.status === 'active') ?? null;
  if (!activeCycle) {
    throw new Error(`Pool ${group.id} has no active cycle`);
  }

  const summary = deriveCycleSummary(
    activeCycle,
    [...members],
    [...payments],
  );

  const statuses: ReadonlyArray<MemberPaymentStatus> = getMemberPaymentStatuses(
    [...members],
    [...payments],
    activeCycle.id,
    activeCycle.recipientMemberId,
  );

  const memberRows: ReadonlyArray<PoolDetailMemberRow> = [...members]
    .filter((m) => m.status === 'active')
    .sort((a, b) => a.position - b.position)
    .map((member) => {
      const isPayoutRecipient = member.id === activeCycle.recipientMemberId;
      const status = statuses.find((s) => s.member.id === member.id);
      const tone: PoolDetailMemberRow['tone'] = isPayoutRecipient
        ? 'pending'
        : status?.hasPaid
          ? 'paid'
          : 'out';
      const label: PoolDetailMemberRow['label'] = isPayoutRecipient
        ? 'pending'
        : status?.hasPaid
          ? 'paid'
          : 'overdue';
      return {
        member,
        tone,
        label,
        isPayoutRecipient,
        amountLabel: formatNgn(activeCycle.contributionPerMember),
      };
    });

  const counts = memberRows.reduce(
    (acc, row) => {
      if (row.tone === 'paid') acc.paid += 1;
      else if (row.tone === 'pending') acc.pending += 1;
      else acc.outstanding += 1;
      return acc;
    },
    { paid: 0, pending: 0, outstanding: 0 },
  );

  const cycleCells: ReadonlyArray<PoolDetailCycleCell> = sortedCycles.map(
    (cycle) => {
      const state: PoolDetailCycleCell['state'] =
        cycle.status === 'closed'
          ? 'closed'
          : cycle.status === 'active'
            ? 'open'
            : 'upcoming';
      return { index: cycle.cycleNumber, state };
    },
  );

  const cadence = cadenceFromGroup(group);
  const cadenceShort = cadence === 'weekly' ? 'wk' : 'mo';
  const metaLine = `${cadence.charAt(0).toUpperCase()}${cadence.slice(1)} · NGN · cycle ${activeCycle.cycleNumber} of ${totalCycles} · you contribute ${formatNgn(activeCycle.contributionPerMember)}/${cadenceShort}`;

  return {
    pool: group,
    metaLine,
    cycle: {
      id: activeCycle.id,
      index: activeCycle.cycleNumber,
      totalCycles,
      status: activeCycle.status,
      contributionLabel: formatNgn(activeCycle.contributionPerMember),
      payoutLabel: formatNgn(summary.totalMembers * activeCycle.contributionPerMember),
      recipient: summary.recipient,
    },
    cycleCells,
    members: memberRows,
    counts,
    activity: [],
  };
}

// ─── Home hero aggregates ───────────────────────────────────────────────────

export interface HomeAggregates {
  /** Total kobo expected across all of the member's pools this period. */
  expectedKobo: number;
  /** Total kobo already collected against `expectedKobo`. */
  collectedKobo: number;
  /** Outstanding = expected − collected, never negative. */
  outstandingKobo: number;
  /** Number of pools this member is in. */
  poolCount: number;
  /** Number of pending contributions this member still owes. */
  pendingContributionCount: number;
}

interface ToHomeAggregatesInput {
  pools: ReadonlyArray<{
    members: ReadonlyArray<Member>;
    cycles: ReadonlyArray<Cycle>;
    payments: ReadonlyArray<Payment>;
  }>;
}

/**
 * Aggregate the member's "this period" figures across every pool they're
 * in. Reads only the *active* cycle of each pool. Pools without an active
 * cycle contribute nothing to the totals.
 *
 * Pure / no I/O — caller is responsible for collecting the per-pool data
 * server-side and feeding it in. Slice 2 calls this from `/home` against
 * the `lib/data.ts` mock fan-out.
 */
export function toHomeAggregates({ pools }: ToHomeAggregatesInput): HomeAggregates {
  let expectedKobo = 0;
  let collectedKobo = 0;
  let pendingContributionCount = 0;

  for (const { members, cycles, payments } of pools) {
    const activeCycle = cycles.find((c) => c.status === 'active');
    if (!activeCycle) continue;
    const summary = deriveCycleSummary(activeCycle, [...members], [...payments]);
    expectedKobo += summary.totalMembers * activeCycle.contributionPerMember;
    collectedKobo += summary.collectedKobo;
    pendingContributionCount += summary.totalMembers - summary.paidCount;
  }

  return {
    expectedKobo,
    collectedKobo,
    outstandingKobo: Math.max(0, expectedKobo - collectedKobo),
    poolCount: pools.length,
    pendingContributionCount,
  };
}
