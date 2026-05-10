export type MemberStatus = 'active' | 'inactive';
export type CycleStatus = 'pending' | 'active' | 'closed';
export type GroupStatus = 'active' | 'closed';
export type Currency = 'NGN';

export interface Group {
  id: string;
  name: string;
  status: GroupStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}

export interface Member {
  id: string;
  name: string;
  phone: string; // e.g. "2349000000001" — no + prefix, no spaces
  position: number; // 1-based rotation slot
  status: MemberStatus;
  groupId: string;
  notes?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}

export interface Payment {
  id: string;
  memberId: string;
  cycleId: string;
  amount: number; // kobo (NGN × 100) — integer, no float risk
  currency: Currency;
  paymentDate: string; // ISO date "YYYY-MM-DD"
  paymentMethod?: string;
  reference?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Cycle {
  id: string;
  cycleNumber: number;
  startDate: string; // ISO date "YYYY-MM-DD"
  endDate: string; // ISO date "YYYY-MM-DD"
  contributionPerMember: number; // kobo
  totalAmount: number; // kobo (= contributionPerMember × memberCount)
  recipientMemberId: string;
  status: CycleStatus;
  groupId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Derived view types used by UI components — not persisted

export interface MemberPaymentStatus {
  member: Member;
  hasPaid: boolean;
  payment: Payment | null; // null if not yet paid
}

export interface CycleSummary {
  cycle: Cycle;
  recipient: Member;
  paidCount: number;
  totalMembers: number;
  collectedKobo: number;
}

export type ActionResult = { success: true } | { success: false; error: string };

// ─── Member-experience inbox (slice 2) ─────────────────────────────────────
//
// Inbox items are user-facing notifications the member sees in `/inbox` and
// in-line on `/home` empty states. They are derivative of system events
// (payment confirmations, payouts, joins, overdue contributions) and are
// intentionally read-only on the client — confirming, dismissing, etc. is
// out of scope for slice 2.

/**
 * Visual treatment for the inbox row's status-row gradient + icon swatch.
 * Maps to the existing `.status-row[data-tone="…"]` palette in
 * `globals.css` plus an `accent` and `muted` value for non-status events.
 */
export type InboxTone = 'paid' | 'pending' | 'out' | 'accent' | 'muted';

/**
 * Item kinds visible in the member inbox. `kind` is used to pick the icon
 * + tone in the row renderer — keep this tight; product can add more in a
 * follow-up slice.
 */
export type InboxItemKind =
  | 'receipt_confirmed'
  | 'cycle_starting'
  | 'payout_scheduled'
  | 'admin_message'
  | 'overdue';

export interface InboxItem {
  id: string;
  /** Owner of the inbox row. The list endpoint already filters by this. */
  userId: string;
  kind: InboxItemKind;
  title: string;
  body: string;
  /** Optional pool reference for click-through (slice 6 wires the link). */
  poolId?: string;
  cycleId?: string;
  /**
   * ISO timestamp the user last read the row. `undefined` = unread.
   * Read state is server-owned — a future slice will add a mutation
   * action; today the row simply reflects the value the API returns.
   */
  readAt?: string;
  createdAt: string;
}
