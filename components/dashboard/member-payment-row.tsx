'use client';

import { CheckCircle2 } from 'lucide-react';
import type { MemberPaymentStatus } from '@/lib/types';

interface MemberPaymentRowProps {
  status: MemberPaymentStatus;
  rowNumber: number;
  onSelect: () => void;
}

function formatPhone(phone: string): string {
  // "2348101234567" → "+234 810 123 4567"
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('234')) {
    return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return `+${digits}`;
}

function formatPaymentDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function MemberPaymentRow({ status, rowNumber, onSelect }: MemberPaymentRowProps) {
  const { member, hasPaid, payment } = status;

  return (
    <>
      {/* Card — click opens inline overlay; toggle button stops propagation for quick inline action */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`View details for ${member.name}`}
        onClick={() => onSelect()}
        onKeyDown={e => e.key === 'Enter' && onSelect()}
        className="relative bg-muted/50 border border-border/50 rounded-xl overflow-hidden transition-all hover:brightness-95 cursor-pointer"
      >
        {/* Persistent status gradient — right-anchored */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: hasPaid
              ? 'linear-gradient(to left, oklch(0.696 0.17 162.48 / 0.10) 0%, transparent 40%)'
              : 'linear-gradient(to left, oklch(0.769 0.188 70.08 / 0.10) 0%, transparent 40%)',
          }}
        />

        {/*
          Outer 3 columns: [number] [middle: member/phone/date] [badge]
          Middle sub-grid on sm+: [name (capped)] [phone] [date]
          On mobile, middle shows name with phone stacked below.
        */}
        <div className="relative grid items-center gap-x-3 px-4 py-3.5
          [grid-template-columns:2rem_1fr_auto]">

          {/* Col 1 — number */}
          <span className="text-2xl font-bold tabular-nums text-muted-foreground/50 leading-none">
            {rowNumber < 10 ? `0${rowNumber}` : rowNumber}
          </span>

          {/* Col 2 — member / phone / date */}
          <div className="grid min-w-0 gap-x-3
            [grid-template-columns:1fr]
            sm:[grid-template-columns:minmax(0,9rem)_9rem_5rem]">

            {/* Name — phone stacked below on mobile */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground sm:hidden">{formatPhone(member.phone)}</p>
            </div>

            {/* Phone (sm+) */}
            <p className="hidden sm:block text-xs text-muted-foreground tabular-nums self-center truncate">
              {formatPhone(member.phone)}
            </p>

            {/* Date (sm+) — always rendered to hold the grid track */}
            <span className="hidden sm:block text-xs text-muted-foreground tabular-nums self-center">
              {hasPaid && payment?.paymentDate ? formatPaymentDate(payment.paymentDate) : ''}
            </span>
          </div>

          {/* Col 3 — status badge at far right */}
          {hasPaid ? (
            <div className="px-3 py-1.5 rounded-lg bg-ajo-paid/10 border border-ajo-paid/30 flex items-center gap-1.5">
              <span className="text-ajo-paid text-sm font-medium">Paid</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-ajo-paid" aria-hidden="true" />
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-ajo-outstanding/10 border border-ajo-outstanding/30">
              <span className="text-ajo-outstanding text-sm font-medium">Outstanding</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
