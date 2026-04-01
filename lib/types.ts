export type MemberStatus = 'active' | 'inactive';
export type CycleStatus = 'pending' | 'active' | 'completed';
export type GroupStatus = 'active' | 'closed';
export type Currency = 'NGN';

export interface Group {
  id: string;
  name: string;
  status: GroupStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Member {
  id: string;
  name: string;
  phone: string; // e.g. "2349000000001" — no + prefix, no spaces
  position: number; // 1-based rotation slot
  status: MemberStatus;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Payment {
  id: string;
  memberId: string;
  cycleId: string;
  amount: number; // kobo (NGN × 100) — integer, no float risk
  currency: Currency;
  paymentDate: string; // ISO date "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type ActionResult = { success: true } | { success: false; error: string };

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
