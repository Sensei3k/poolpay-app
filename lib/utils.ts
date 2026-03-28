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

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('234')) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return `+${digits}`;
}

export function padZero(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatPaymentDate(isoDate: string, includeYear = false): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

export function getMemberPaymentStatuses(
  members: Member[],
  payments: Payment[],
  cycleId: number,
  recipientMemberId: number,
): MemberPaymentStatus[] {
  const paymentsByMember = new Map(
    payments
      .filter(p => p.cycleId === cycleId)
      .map(p => [p.memberId, p]),
  );

  return members
    .filter(m => m.status === 'active' && m.id !== recipientMemberId)
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
  // The recipient collects the pot this cycle — they are not expected to pay in.
  // All counts and totals exclude them so the UI doesn't show them as a payer.
  const contributingMembers = activeMembers.filter(m => m.id !== cycle.recipientMemberId);
  const cyclePayments = payments
    .filter(p => p.cycleId === cycle.id && p.memberId !== cycle.recipientMemberId);
  const collectedKobo = cyclePayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    cycle,
    recipient,
    paidCount: cyclePayments.length,
    totalMembers: contributingMembers.length,
    collectedKobo,
  };
}
