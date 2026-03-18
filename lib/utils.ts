import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Member, Payment, Cycle, MemberPaymentStatus, CycleSummary } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function koboToNgn(kobo: number): number {
  return kobo / 100;
}

export function formatNgn(kobo: number): string {
  return `₦${koboToNgn(kobo).toLocaleString('en-NG')}`;
}

export function getMemberPaymentStatuses(
  members: Member[],
  payments: Payment[],
  cycleId: number,
): MemberPaymentStatus[] {
  const paymentsByMember = new Map(
    payments
      .filter(p => p.cycleId === cycleId)
      .map(p => [p.memberId, p]),
  );

  return members
    .filter(m => m.status === 'active')
    .sort((a, b) => a.position - b.position)
    .map(member => {
      const payment = paymentsByMember.get(member.id) ?? null;
      return { member, hasPaid: payment !== null, payment };
    });
}

export function deriveCycleSummary(
  cycle: Cycle,
  members: Member[],
  payments: Payment[],
): CycleSummary {
  const recipient = members.find(m => m.id === cycle.recipientMemberId);
  if (!recipient) throw new Error(`Recipient member ${cycle.recipientMemberId} not found`);

  const activeMembers = members.filter(m => m.status === 'active');
  const cyclePayments = payments.filter(p => p.cycleId === cycle.id);
  const collectedKobo = cyclePayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    cycle,
    recipient,
    paidCount: cyclePayments.length,
    totalMembers: activeMembers.length,
    collectedKobo,
  };
}
