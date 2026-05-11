/**
 * Admin-experience view models.
 *
 * The handoff's admin screens (AD_Receipts, AD_Group with 6 tabs) render
 * from shapes that don't exist 1:1 in the canonical domain types, the
 * receipts queue wants a pre-joined `(pool · cycle · member)` row, the
 * group overview wants a cycle-timeline strip, etc. This module is the
 * single place where those derived shapes get computed so the admin
 * page components stay thin.
 *
 * Domain → view-model is a one-way transform. Nothing here mutates the
 * inputs and nothing touches the network, the page or preview fixture
 * supplies fully-resolved domain rows.
 */

import type {
  Cycle,
  CycleStatus,
  Group,
  Member,
  Payment,
  Receipt,
  ReceiptStatus,
} from '@/lib/types';
import { formatNgn } from '@/lib/utils';

// ─── Shared swatch helpers ─────────────────────────────────────────────────

const SWATCHES = ['a', 'b', 'c', 'd'] as const;
export type PoolSwatchSlot = (typeof SWATCHES)[number];

/**
 * Pick a swatch deterministically from the pool id so the same pool
 * always renders with the same accent across surfaces (matches
 * `view-models/member.ts` so member + admin views agree).
 */
export function pickPoolSwatch(id: string): PoolSwatchSlot {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return SWATCHES[sum % SWATCHES.length];
}

function uppercaseFirst(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '·';
}

// ─── ReceiptQueueRow, cross-group + per-group receipts list ───────────────

/**
 * Visual tone for the row's status-row gradient. `pending` covers
 * unmatched + matched (awaiting review); `stale` is used for the
 * "older than 24h, still pending" treatment shown in the artboard.
 */
export type ReceiptRowTone = 'pending' | 'stale' | 'paid' | 'out';

export interface ReceiptQueueRow {
  receiptId: string;
  /** Pool name (e.g. "Lagos Rent Q2") for the row's left-side glyph. */
  poolName: string;
  /** Single-letter glyph for the pool tile. */
  poolInitial: string;
  /** Swatch slot 'a'..'d', paired to the gradient set in <PoolSwatch>. */
  poolSwatch: PoolSwatchSlot;
  /** Resolved member name. `null` only when status === 'unmatched'. */
  memberName: string | null;
  /** Masked sender phone for the row sub-label (e.g. "+234 803 •••"). */
  memberPhoneMasked: string;
  /** Pre-formatted amount (e.g. "₦ 12,000"). */
  amountLabel: string;
  /** Cycle subtitle, e.g. "cycle 10 · w10". */
  cycleLabel: string;
  /** Relative submitted-at, e.g. "2h ago · WhatsApp". */
  submittedLabel: string;
  /** Caption / note the admin sees. Falls back to "(no note)". */
  note: string;
  tone: ReceiptRowTone;
  status: ReceiptStatus;
}

interface ToReceiptQueueRowInput {
  receipt: Receipt;
  group: Group;
  cycle: Cycle | undefined;
  member: Member | null;
  /** Wall-clock reference for the relative timestamp. */
  now: Date;
}

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86_400;
const STALE_THRESHOLD_HOURS = 24;

/**
 * Mask a phone number to "+<cc> <prefix> •••" so PII stays out of the
 * queue's secondary column. The shape mirrors the artboard's "+234 803
 * •••" treatment.
 */
function maskPhone(phone: string): string {
  if (!phone) return '';
  // Cheap heuristic: keep country-code group + first 3-digit block, mask
  // the rest. The bot writes phones as e164 without `+`; the design
  // shows the leading `+` so we add it back.
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return `+${digits} •••`;
  const cc = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  return `+${cc} ${prefix} •••`;
}

function relativeTimeLabel(target: string, now: Date): string {
  const targetMs = Date.parse(target);
  if (Number.isNaN(targetMs)) return 'unknown';
  const deltaSec = Math.max(0, Math.round((now.getTime() - targetMs) / 1000));
  if (deltaSec < SECONDS_PER_HOUR) {
    const mins = Math.max(1, Math.round(deltaSec / 60));
    return `${mins}m ago`;
  }
  if (deltaSec < SECONDS_PER_DAY) {
    return `${Math.round(deltaSec / SECONDS_PER_HOUR)}h ago`;
  }
  return `${Math.round(deltaSec / SECONDS_PER_DAY)}d ago`;
}

function hoursBetween(targetIso: string, now: Date): number {
  const targetMs = Date.parse(targetIso);
  if (Number.isNaN(targetMs)) return 0;
  return Math.max(0, (now.getTime() - targetMs) / 1000 / SECONDS_PER_HOUR);
}

/**
 * Build a queue row from the canonical receipt + the group, cycle, and
 * member it joins. Status drives the tone:
 *   - confirmed         → paid
 *   - rejected_duplicate → out
 *   - flagged           → out
 *   - matched/unmatched → pending (or stale, if older than 24h)
 */
export function toReceiptQueueRow({
  receipt,
  group,
  cycle,
  member,
  now,
}: ToReceiptQueueRowInput): ReceiptQueueRow {
  const cycleLabel = cycle
    ? `cycle ${cycle.cycleNumber} · w${cycle.cycleNumber}`
    : 'cycle -';

  const submittedLabel = `${relativeTimeLabel(receipt.submittedAt, now)} · ${
    receipt.source === 'whatsapp' ? 'WhatsApp' : 'upload'
  }`;

  const tone: ReceiptRowTone = (() => {
    if (receipt.status === 'confirmed') return 'paid';
    if (
      receipt.status === 'rejected_duplicate' ||
      receipt.status === 'flagged'
    ) {
      return 'out';
    }
    return hoursBetween(receipt.submittedAt, now) >= STALE_THRESHOLD_HOURS
      ? 'stale'
      : 'pending';
  })();

  return {
    receiptId: receipt.id,
    poolName: group.name,
    poolInitial: uppercaseFirst(group.name),
    poolSwatch: pickPoolSwatch(group.id),
    memberName: member?.name ?? null,
    memberPhoneMasked: maskPhone(receipt.senderPhone),
    amountLabel: formatNgn(
      receipt.detectedAmountKobo ?? receipt.expectedAmountKobo,
    ),
    cycleLabel,
    submittedLabel,
    note: receipt.note?.trim() || '(no note)',
    tone,
    status: receipt.status,
  };
}

// ─── Queue signal-row aggregates ───────────────────────────────────────────

export interface QueueAggregates {
  /** Receipts awaiting review (status === matched | unmatched). */
  awaiting: number;
  /** Submitted in the trailing 24h. */
  today: number;
  /** Oldest pending row, formatted (e.g. "2d", "5h"). `null` when empty. */
  oldestLabel: string | null;
  /** Confirmed receipts in the trailing 7 days. */
  confirmedThisWeek: number;
}

interface ToQueueAggregatesInput {
  receipts: ReadonlyArray<Receipt>;
  now: Date;
}

const DAYS_PER_WEEK = 7;

export function toQueueAggregates({
  receipts,
  now,
}: ToQueueAggregatesInput): QueueAggregates {
  let awaiting = 0;
  let today = 0;
  let confirmedThisWeek = 0;
  let oldestPendingHours = 0;
  let hasPending = false;

  for (const r of receipts) {
    const ageHours = hoursBetween(r.submittedAt, now);

    if (r.status === 'matched' || r.status === 'unmatched') {
      awaiting += 1;
      if (ageHours < 24) today += 1;
      if (ageHours > oldestPendingHours) {
        oldestPendingHours = ageHours;
        hasPending = true;
      }
    }
    if (r.status === 'confirmed') {
      const reviewedAge = r.reviewedAt
        ? hoursBetween(r.reviewedAt, now)
        : ageHours;
      if (reviewedAge / 24 < DAYS_PER_WEEK) confirmedThisWeek += 1;
    }
  }

  const oldestLabel = hasPending
    ? oldestPendingHours >= 24
      ? `${Math.round(oldestPendingHours / 24)}d`
      : `${Math.round(oldestPendingHours)}h`
    : null;

  return { awaiting, today, oldestLabel, confirmedThisWeek };
}

// ─── Group overview / detail tabs ──────────────────────────────────────────

export interface AdminGroupHeader {
  name: string;
  /** Subline e.g. "Weekly · NGN · 5 members · you admin this group". */
  metaLine: string;
  /** Single-letter glyph for the breadcrumb pool tile. */
  initial: string;
  swatch: PoolSwatchSlot;
}

export function toAdminGroupHeader(group: Group, members: ReadonlyArray<Member>): AdminGroupHeader {
  const memberCount = members.filter((m) => m.status === 'active').length;
  return {
    name: group.name,
    metaLine: `Weekly · NGN · ${memberCount} members · you admin this group`,
    initial: uppercaseFirst(group.name),
    swatch: pickPoolSwatch(group.id),
  };
}

//, Overview tab,

export interface AdminGroupOverviewStat {
  kicker: string;
  value: string;
  detail: string;
}

export interface AdminGroupTimelineCell {
  index: number;
  state: 'closed' | 'open' | 'upcoming';
  label: string;
}

export interface AdminGroupActivityRow {
  id: string;
  icon: 'Check' | 'MessageSquare' | 'HandCoins' | 'UserPlus';
  title: string;
  whenLabel: string;
}

export interface AdminGroupOverview {
  stats: ReadonlyArray<AdminGroupOverviewStat>;
  timeline: ReadonlyArray<AdminGroupTimelineCell>;
  rotationOrder: ReadonlyArray<{ name: string; isCurrent: boolean }>;
  activity: ReadonlyArray<AdminGroupActivityRow>;
}

interface ToAdminGroupOverviewInput {
  group: Group;
  members: ReadonlyArray<Member>;
  cycles: ReadonlyArray<Cycle>;
  payments: ReadonlyArray<Payment>;
  activity: ReadonlyArray<AdminGroupActivityRow>;
}

/**
 * Compute the overview tab payload. We do the math against the canonical
 * domain shapes so the page is a pure render of the result.
 */
export function toAdminGroupOverview({
  members,
  cycles,
  payments,
  activity,
}: ToAdminGroupOverviewInput): AdminGroupOverview {
  const memberCount = members.length;
  const activeCycle = cycles.find((c) => c.status === 'active');
  const closedCycles = cycles.filter((c) => c.status === 'closed').length;
  const totalCycles = cycles.length;

  // Pool balance, sum of confirmed contributions for the active cycle.
  const activeCyclePayments = activeCycle
    ? payments.filter((p) => p.cycleId === activeCycle.id && p.confirmedAt)
    : [];
  const collectedKoboActive = activeCyclePayments.reduce(
    (acc, p) => acc + p.amount,
    0,
  );
  const expectedKoboActive = activeCycle
    ? activeCycle.contributionPerMember * memberCount
    : 0;
  const paidCount = new Set(activeCyclePayments.map((p) => p.memberId)).size;

  // Health, % of contributions paid across active+closed cycles.
  const relevantCycles = cycles.filter(
    (c) => c.status === 'active' || c.status === 'closed',
  );
  const expectedTotal = relevantCycles.reduce(
    (acc, c) => acc + c.contributionPerMember * memberCount,
    0,
  );
  const paidTotal = payments
    .filter((p) => relevantCycles.some((c) => c.id === p.cycleId) && p.confirmedAt)
    .reduce((acc, p) => acc + p.amount, 0);
  const healthPct =
    expectedTotal === 0 ? 100 : Math.round((paidTotal / expectedTotal) * 100);
  const overdueCount = Math.max(0, memberCount - paidCount);

  // Next payout, first non-closed cycle's pot.
  const nextCycle =
    cycles.find((c) => c.status === 'active') ??
    cycles.find((c) => c.status === 'pending');
  const nextPayoutKobo = nextCycle
    ? nextCycle.contributionPerMember * memberCount
    : 0;
  const nextPayoutCycleLabel = nextCycle ? `w${nextCycle.cycleNumber}` : '-';

  const stats: ReadonlyArray<AdminGroupOverviewStat> = [
    {
      kicker: 'Pool balance',
      value: formatNgn(collectedKoboActive),
      detail: activeCycle
        ? `available · cycle ${activeCycle.cycleNumber} open`
        : 'no active cycle',
    },
    {
      kicker: activeCycle
        ? `Collected · cycle ${activeCycle.cycleNumber}`
        : 'Collected · this cycle',
      value: `${formatNgn(collectedKoboActive)} / ${formatNgn(expectedKoboActive)}`,
      detail: `${paidCount} of ${memberCount} paid`,
    },
    {
      kicker: 'Next payout',
      value: formatNgn(nextPayoutKobo),
      detail: `${nextPayoutCycleLabel} · pot`,
    },
    {
      kicker: 'Health',
      value: `${healthPct}%`,
      detail:
        overdueCount > 0
          ? `${overdueCount} member${overdueCount === 1 ? '' : 's'} overdue`
          : 'on track',
    },
  ];

  const timeline: ReadonlyArray<AdminGroupTimelineCell> = Array.from(
    { length: totalCycles },
    (_, i) => {
      const cycleNumber = i + 1;
      const state: AdminGroupTimelineCell['state'] =
        cycleNumber <= closedCycles
          ? 'closed'
          : activeCycle && cycleNumber === activeCycle.cycleNumber
            ? 'open'
            : 'upcoming';
      return { index: cycleNumber, state, label: `w${cycleNumber}` };
    },
  );

  const rotationOrder = cycles
    .slice()
    .sort((a, b) => a.cycleNumber - b.cycleNumber)
    .slice(0, 5)
    .map((c) => {
      const recipient = members.find((m) => m.id === c.recipientMemberId);
      return {
        name: recipient?.name ?? '-',
        isCurrent: c.status === 'active',
      };
    });

  return {
    stats,
    timeline,
    rotationOrder,
    activity,
  };
}

//, Members tab,

export interface AdminMemberRow {
  member: Member;
  /** Joined-month label, e.g. "Jan 2026". */
  joinedLabel: string;
  /** "9/9" or "8/9 · 1 miss", payments-vs-cycles + missed badge. */
  paidLabel: string;
  missedCount: number;
  /** Pre-formatted outstanding balance, or "₦ 0". */
  dueLabel: string;
  tone: 'ok' | 'pending' | 'out';
  /** Pill label: 'current' | 'pending' | 'out'. */
  pillLabel: 'current' | 'pending' | 'out';
}

interface ToAdminMemberRowInput {
  member: Member;
  cycles: ReadonlyArray<Cycle>;
  payments: ReadonlyArray<Payment>;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function formatJoined(value: string | undefined): string {
  if (!value) return '-';
  const parsedMs = Date.parse(value);
  if (Number.isNaN(parsedMs)) return '-';
  const date = new Date(parsedMs);
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function toAdminMemberRow({
  member,
  cycles,
  payments,
}: ToAdminMemberRowInput): AdminMemberRow {
  const relevantCycles = cycles.filter(
    (c) => c.status === 'active' || c.status === 'closed',
  );
  const expectedCount = relevantCycles.length;
  const paidCycleIds = new Set(
    payments
      .filter((p) => p.memberId === member.id && p.confirmedAt)
      .map((p) => p.cycleId),
  );
  const paidCount = relevantCycles.filter((c) => paidCycleIds.has(c.id)).length;
  const missedCount = Math.max(0, expectedCount - paidCount - 1);

  const dueCycles = relevantCycles.filter((c) => !paidCycleIds.has(c.id));
  const dueKobo = dueCycles.reduce(
    (acc, c) => acc + c.contributionPerMember,
    0,
  );
  const isPendingActive = relevantCycles.some(
    (c) => c.status === 'active' && !paidCycleIds.has(c.id),
  );

  const tone: AdminMemberRow['tone'] =
    dueKobo === 0 ? 'ok' : isPendingActive && missedCount === 0 ? 'pending' : 'out';
  const pillLabel: AdminMemberRow['pillLabel'] =
    tone === 'ok' ? 'current' : tone === 'pending' ? 'pending' : 'out';

  return {
    member,
    joinedLabel: formatJoined(member.joinedAt ?? member.createdAt),
    paidLabel:
      missedCount > 0
        ? `${paidCount}/${expectedCount}`
        : `${paidCount}/${expectedCount}`,
    missedCount,
    dueLabel: tone === 'pending' ? 'pending' : formatNgn(dueKobo),
    tone,
    pillLabel,
  };
}

//, Cycles tab,

export interface AdminCycleRow {
  cycleNumber: number;
  recipientName: string;
  amountLabel: string;
  collectedLabel: string;
  /** Window label e.g. "Apr 22-28", "Feb 1" or "-". */
  windowLabel: string;
  status: CycleStatus;
  tone: 'paid' | 'pending' | 'muted';
  pillLabel: 'closed' | 'open' | 'future';
}

interface ToAdminCycleRowInput {
  cycle: Cycle;
  members: ReadonlyArray<Member>;
  payments: ReadonlyArray<Payment>;
}

export function toAdminCycleRow({
  cycle,
  members,
  payments,
}: ToAdminCycleRowInput): AdminCycleRow {
  const recipient = members.find((m) => m.id === cycle.recipientMemberId);
  const cyclePayments = payments.filter(
    (p) => p.cycleId === cycle.id && p.confirmedAt,
  );
  const collectedKobo = cyclePayments.reduce((acc, p) => acc + p.amount, 0);
  const totalKobo = cycle.contributionPerMember * members.length;

  const tone: AdminCycleRow['tone'] =
    cycle.status === 'closed'
      ? 'paid'
      : cycle.status === 'active'
        ? 'pending'
        : 'muted';
  const pillLabel: AdminCycleRow['pillLabel'] =
    cycle.status === 'closed'
      ? 'closed'
      : cycle.status === 'active'
        ? 'open'
        : 'future';

  const collectedLabel =
    cycle.status === 'pending' ? '-' : formatNgn(collectedKobo);
  const windowLabel = (() => {
    if (cycle.status === 'pending') return '-';
    if (cycle.status === 'active') {
      return `cycle ${cycle.cycleNumber}`;
    }
    return cycle.endDate;
  })();

  return {
    cycleNumber: cycle.cycleNumber,
    recipientName: recipient?.name ?? '-',
    amountLabel: formatNgn(totalKobo),
    collectedLabel,
    windowLabel,
    status: cycle.status,
    tone,
    pillLabel,
  };
}

//, Payments tab,

export interface AdminPaymentRow {
  id: string;
  whoName: string;
  cycleLabel: string;
  amountLabel: string;
  whenLabel: string;
  /** Pre-formatted "confirmed by" label, "-" when pending. */
  confirmedByLabel: string;
  status: 'confirmed' | 'pending' | 'overdue' | 'payout';
  tone: 'paid' | 'pending' | 'out';
  /** `true` for payout rows (money flowing OUT of the pool). */
  isPayout: boolean;
}

interface ToAdminPaymentRowInput {
  payment: Payment;
  member: Member | undefined;
  cycle: Cycle | undefined;
  now: Date;
}

export function toAdminPaymentRow({
  payment,
  member,
  cycle,
  now,
}: ToAdminPaymentRowInput): AdminPaymentRow {
  const isPayout = payment.id.includes('payout');
  const status: AdminPaymentRow['status'] = (() => {
    if (isPayout) return 'payout';
    if (payment.confirmedAt) return 'confirmed';
    if (cycle && cycle.status === 'closed' && !payment.confirmedAt) {
      return 'overdue';
    }
    return 'pending';
  })();

  const tone: AdminPaymentRow['tone'] =
    status === 'confirmed' || status === 'payout'
      ? 'paid'
      : status === 'pending'
        ? 'pending'
        : 'out';

  return {
    id: payment.id,
    whoName: member?.name ?? '-',
    cycleLabel: cycle
      ? isPayout
        ? `cycle ${cycle.cycleNumber} payout`
        : `cycle ${cycle.cycleNumber}`
      : 'cycle -',
    amountLabel: formatNgn(payment.amount),
    whenLabel: relativeTimeLabel(payment.paymentDate, now),
    confirmedByLabel: payment.confirmedBy ?? (isPayout ? 'system' : '-'),
    status,
    tone,
    isPayout,
  };
}

// ─── Mobile-blocked-tab id list ────────────────────────────────────────────

/**
 * Tabs that show the "Open on desktop" prompt below 768px because they
 * require configuration affordances that don't fit on mobile.
 */
export const MOBILE_BLOCKED_TABS = ['settings', 'members', 'cycles'] as const;
export type MobileBlockedTab = (typeof MOBILE_BLOCKED_TABS)[number];

export function isMobileBlockedTab(
  tab: string,
): tab is MobileBlockedTab {
  return (MOBILE_BLOCKED_TABS as ReadonlyArray<string>).includes(tab);
}

// ─── Tab id set ────────────────────────────────────────────────────────────

export const ADMIN_GROUP_TAB_IDS = [
  'overview',
  'members',
  'cycles',
  'payments',
  'receipts',
  'settings',
] as const;
export type AdminGroupTabId = (typeof ADMIN_GROUP_TAB_IDS)[number];

export function isAdminGroupTabId(value: string): value is AdminGroupTabId {
  return (ADMIN_GROUP_TAB_IDS as ReadonlyArray<string>).includes(value);
}
