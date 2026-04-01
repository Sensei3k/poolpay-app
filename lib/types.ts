export type MemberStatus = 'active' | 'inactive';
export type CycleStatus = 'pending' | 'active' | 'closed';
export type Currency = 'NGN';

export interface Member {
  id: number;
  name: string;
  phone: string; // e.g. "2349000000001" — no + prefix, no spaces
  position: number; // 1-based rotation slot
  status: MemberStatus;
}

export interface Payment {
  id: number;
  memberId: number;
  cycleId: number;
  amount: number; // kobo (NGN × 100) — integer, no float risk
  currency: Currency;
  paymentDate: string; // ISO date "YYYY-MM-DD"
}

export interface Cycle {
  id: number;
  cycleNumber: number;
  startDate: string; // ISO date "YYYY-MM-DD"
  endDate: string; // ISO date "YYYY-MM-DD"
  contributionPerMember: number; // kobo
  totalAmount: number; // kobo (= contributionPerMember × memberCount)
  recipientMemberId: number;
  status: CycleStatus;
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
