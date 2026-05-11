/**
 * Super-admin view models.
 *
 * Mirror of `view-models/admin.ts`: pure shape transforms feeding the
 * `/sys/*` desktop surfaces. Each shape carries the joins and labels
 * the design source (`docs/design-handoff/poolpay/super-desktop.jsx`)
 * needs so page components stay free of inline data wrangling.
 *
 * Slice-4 deviation #2: the BE has no super-view list endpoints yet,
 * so today the only producer of these shapes is the preview fixture
 * (`lib/preview/super-fixtures.ts`). Pages render against the fixture
 * with FIXME pointers naming the missing endpoints. Once BE-9 lands
 * the list endpoints, these shapes stay; only the producer swaps.
 */

import type { AnyCurrency } from '@/lib/format/currency';
import { formatCurrency } from '@/lib/format/currency';
import { pickPoolSwatch, type PoolSwatchSlot } from '@/lib/view-models/admin';

// ─── SD_Receipts (system-wide queue) ────────────────────────────────────

/** Per-row signal for the system-wide queue. */
export type SystemReceiptFlag = 'stale' | 'no-admin' | null;

export type SystemReceiptTone = 'pending' | 'stale' | 'out';

export interface SystemReceiptRow {
  receiptId: string;
  poolId: string;
  poolName: string;
  poolInitial: string;
  poolSwatch: PoolSwatchSlot;
  /** Admin display name, or null when no admin is assigned to the pool. */
  adminName: string | null;
  /** Member who sent the receipt. */
  fromName: string;
  /** Pre-formatted amount (e.g. "₦12,000"). */
  amountLabel: string;
  /** "Submitted" column copy, e.g. "2h · WhatsApp". */
  submittedLabel: string;
  /** "Waiting" column copy, e.g. "2h". */
  waitingLabel: string;
  flag: SystemReceiptFlag;
  tone: SystemReceiptTone;
}

export interface SystemReceiptsAggregates {
  pending: number;
  groups: number;
  stale: number;
  oldestLabel: string | null;
  noAdmin: number;
  noAdminPoolName: string | null;
  confirmedLast7d: number;
  confirmedAdmins: number;
  /** Pre-formatted percent, e.g. "78%". Null when unknown. */
  autoMatchRateLabel: string | null;
}

// ─── SD_Groups (system list) ────────────────────────────────────────────

/** "linked" | "pending" | "unlinked", `unlinked` is the only red status. */
export type SystemGroupWaStatus = 'linked' | 'pending' | 'unlinked';

export type SystemGroupTone = 'paid' | 'pending' | 'out' | 'orphan';

export interface SystemGroupRow {
  poolId: string;
  poolName: string;
  poolInitial: string;
  poolSwatch: PoolSwatchSlot;
  currency: AnyCurrency;
  memberCount: number;
  /** Compact cycles label, e.g. "10/12". */
  cyclesLabel: string;
  cadence: string;
  /** Admin name, or null when unassigned. */
  adminName: string | null;
  waStatus: SystemGroupWaStatus;
  pendingReceiptsCount: number;
  /** Health score 0..100, used to colour the bar in the row. */
  health: number;
  tone: SystemGroupTone;
}

export interface SystemGroupsAggregates {
  groupCount: number;
  adminCount: number;
  unlinkedFromWhatsApp: number;
}

// ─── SD_GroupDetail ─────────────────────────────────────────────────────

/** A single key/value row in the group-record card. */
export interface GroupRecordRow {
  kicker: string;
  value: string;
  /** Render in mono font (used for the opaque ID-shaped values). */
  mono?: boolean;
}

export interface GroupAuditRow {
  id: string;
  /** Relative-time label, e.g. "2h", "1d". */
  whenLabel: string;
  /** Actor name; bot/system get a special tone. */
  who: string;
  isMachine: boolean;
  action: string;
}

export interface SystemGroupDetail {
  poolId: string;
  poolName: string;
  poolInitial: string;
  poolSwatch: PoolSwatchSlot;
  /** Page-sub line, e.g. "group_id · grp_01HXV4K9 · created 12 Jan 2026 by Ngozi O.". */
  subLabel: string;
  record: ReadonlyArray<GroupRecordRow>;
  /** When the group has no admin on duty this is null. */
  admin: {
    name: string;
    email: string;
    groupCount: number;
    initial: string;
  } | null;
  whatsapp: {
    linked: boolean;
    chatName: string | null;
    waGroupId: string | null;
    botActive: boolean;
  };
  audit: ReadonlyArray<GroupAuditRow>;
}

// ─── SD_Admins ──────────────────────────────────────────────────────────

export interface SystemAdminRow {
  userId: string;
  name: string;
  email: string;
  phoneE164: string;
  /** Pre-joined: pool names granted to this admin. */
  grantedGroupNames: ReadonlyArray<string>;
  /** Relative-time label, e.g. "2h ago". */
  lastSeenLabel: string;
  active: boolean;
  grantCount: number;
  initial: string;
}

export interface SystemAdminsAggregates {
  totalAdmins: number;
  inactive: number;
  totalGrants: number;
}

/** Group-grant chip available in the add-admin modal. */
export interface GroupChipOption {
  poolId: string;
  poolName: string;
}

// ─── SD_WhatsApp ────────────────────────────────────────────────────────

export type WhatsAppLinkStatus = 'healthy' | 'drift' | 'pending' | 'unlinked';

export interface WhatsAppLinkRow {
  poolId: string;
  poolName: string;
  poolInitial: string;
  poolSwatch: PoolSwatchSlot;
  /** "Lagos Rent Q2" or null when unlinked. */
  chatName: string | null;
  /** Mock-style id label like "120363…4492" or null when unlinked. */
  waGroupIdLabel: string | null;
  /** "5/5", members in PoolPay roster. */
  rosterLabel: string;
  /** "5/5" or null when unlinked. */
  matchedLabel: string | null;
  botStatusLabel: 'active' | 'pending' | 'unlinked';
  /** "2h ago" or null. */
  lastEventLabel: string | null;
  status: WhatsAppLinkStatus;
  /** Whether matched < members, triggers the warning amber. */
  hasDrift: boolean;
}

export interface WhatsAppBotStats {
  ingested7d: number;
  matchedRateLabel: string;
  needsAdmin: number;
  avgAckLabel: string;
  online: boolean;
  /** Phone number string used as the bot's identity. */
  botPhone: string;
}

export interface WhatsAppLinksAggregates {
  total: number;
  linked: number;
  pending: number;
  unlinked: number;
}

// ─── Helpers, re-exported for the fixture ──────────────────────────────

export { pickPoolSwatch };

/**
 * Build the "Contribution" record-row value for the group detail card.
 * Centralised here so the currency formatter is the single source of
 * truth (no scattering of `(kobo/100).toLocaleString(...)`).
 */
export function formatContributionLabel(
  amountMinor: number,
  currency: AnyCurrency,
): string {
  return formatCurrency(amountMinor, currency);
}
