import type { Member, Payment, Cycle } from '@/lib/types';

export const MOCK_MEMBERS: Member[] = [
  { id: 1, name: 'Adaeze Okonkwo',  phone: '2348101234567', position: 1, status: 'active' },
  { id: 2, name: 'Chukwuemeka Eze', phone: '2347031234567', position: 2, status: 'active' },
  { id: 3, name: 'Ngozi Adeyemi',   phone: '2349061234567', position: 3, status: 'active' },
  { id: 4, name: 'Tunde Bakare',    phone: '2348031234567', position: 4, status: 'active' },
  { id: 5, name: 'Amaka Nwosu',     phone: '2348161234567', position: 5, status: 'active' },
  { id: 6, name: 'Seun Okafor',     phone: '2347061234567', position: 6, status: 'active' },
];

// Amounts in kobo: 1,000,000 kobo = ₦10,000
export const MOCK_CYCLES: Cycle[] = [
  {
    id: 1,
    cycleNumber: 1,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    contributionPerMember: 1_000_000,
    totalAmount: 6_000_000,
    recipientMemberId: 1,
    status: 'closed',
  },
  {
    id: 2,
    cycleNumber: 2,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    contributionPerMember: 1_000_000,
    totalAmount: 6_000_000,
    recipientMemberId: 2,
    status: 'closed',
  },
  {
    id: 3,
    cycleNumber: 3,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    contributionPerMember: 1_000_000,
    totalAmount: 6_000_000,
    recipientMemberId: 3,
    status: 'active',
  },
];

// Cycles 1 & 2: fully paid (all 6 members)
// Cycle 3: 4 of 6 paid — Tunde (id 4) and Seun (id 6) outstanding
// Progress: ₦40,000 of ₦60,000 collected
export const MOCK_PAYMENTS: Payment[] = [
  // Cycle 1 — January 2026 (fully paid)
  { id: 5,  memberId: 1, cycleId: 1, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-01-02' },
  { id: 6,  memberId: 2, cycleId: 1, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-01-03' },
  { id: 7,  memberId: 3, cycleId: 1, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-01-04' },
  { id: 8,  memberId: 4, cycleId: 1, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-01-05' },
  { id: 9,  memberId: 5, cycleId: 1, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-01-06' },
  { id: 10, memberId: 6, cycleId: 1, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-01-08' },
  // Cycle 2 — February 2026 (fully paid)
  { id: 11, memberId: 1, cycleId: 2, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-02-02' },
  { id: 12, memberId: 2, cycleId: 2, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-02-03' },
  { id: 13, memberId: 3, cycleId: 2, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-02-05' },
  { id: 14, memberId: 4, cycleId: 2, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-02-06' },
  { id: 15, memberId: 5, cycleId: 2, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-02-07' },
  { id: 16, memberId: 6, cycleId: 2, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-02-09' },
  // Cycle 3 — March 2026 (4 of 6 paid)
  { id: 1, memberId: 1, cycleId: 3, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-03-02' },
  { id: 2, memberId: 2, cycleId: 3, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-03-03' },
  { id: 3, memberId: 3, cycleId: 3, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-03-05' },
  { id: 4, memberId: 5, cycleId: 3, amount: 1_000_000, currency: 'NGN', paymentDate: '2026-03-07' },
];
