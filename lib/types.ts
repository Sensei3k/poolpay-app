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
  phone: string; // e.g. "2349000000001", no + prefix, no spaces
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
  amount: number; // kobo (NGN × 100), integer, no float risk
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

// Derived view types used by UI components, not persisted

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
// intentionally read-only on the client, confirming, dismissing, etc. is
// out of scope for slice 2.

/**
 * Visual treatment for the inbox row's status-row gradient + icon swatch.
 * Maps to the existing `.status-row[data-tone="…"]` palette in
 * `globals.css` plus an `accent` and `muted` value for non-status events.
 */
export type InboxTone = 'paid' | 'pending' | 'out' | 'accent' | 'muted';

/**
 * Item kinds visible in the member inbox. `kind` is used to pick the icon
 * + tone in the row renderer, keep this tight; product can add more in a
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
   * Read state is server-owned, a future slice will add a mutation
   * action; today the row simply reflects the value the API returns.
   */
  readAt?: string;
  createdAt: string;
}

// ─── Admin-experience receipts (slice 3) ───────────────────────────────────
//
// Receipts are surfaced in the cross-group queue at `/admin/receipts` and in
// the per-group `?tab=receipts` tab. Slice 3 ships the queue UI + the
// receipt-detail modal layout; slice 5 wires the actual confirm / reject /
// flag action handlers against poolpay-api.

/**
 * Lifecycle states a receipt moves through. Mirrors handoff §4
 * `Receipt.status` so the backend can land 1:1.
 */
export type ReceiptStatus =
  | 'unmatched'
  | 'matched'
  | 'confirmed'
  | 'rejected_duplicate'
  | 'flagged';

/** How the receipt arrived in PoolPay's system. */
export type ReceiptSource = 'whatsapp' | 'manual_upload';

/**
 * Receipt row as held by the admin queue + per-group receipts tab. The
 * shape includes the pool and member relations the UI needs already
 * resolved so the page components stay free of joins.
 */
export interface Receipt {
  id: string;
  source: ReceiptSource;
  /** The pool this receipt is assigned to (via WhatsApp link or upload). */
  groupId: string;
  /** Resolved member when phone matched; null if `status === 'unmatched'`. */
  matchedMemberId: string | null;
  /** Cycle this receipt is settling against. */
  cycleId: string;
  /** Caption-parsed amount in kobo. Never trusted, hint only. */
  detectedAmountKobo?: number;
  /** Expected contribution amount in kobo for the matched cycle. */
  expectedAmountKobo: number;
  /** Raw sender phone the bot saw (e164, no `+`). */
  senderPhone: string;
  /** Optional short bank trace, e.g. "GTB · ref 8917-2204". */
  bankTrace?: string;
  /** Caption / note the admin sees in the row. Falls back to a placeholder. */
  note?: string;
  /** Receipt screenshot URL, placeholder striped box when missing. */
  rawImageUrl?: string;
  status: ReceiptStatus;
  /** Admin who actioned the receipt. `undefined` until reviewed. */
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  /** Server-side submission timestamp. */
  submittedAt: string;
}
