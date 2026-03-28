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

/*
  Grid columns — same template used in the header so every column aligns:
    mobile:  [2rem | 1fr        | 8rem  ]
    sm+:     [2rem | 2fr | 2fr  | 1.5fr | 1.5fr]
             NO     NAME  PHONE   DATE    STATUS

  Hidden items (phone/date on mobile) don't consume grid tracks, so
  the mobile 3-col template always sees exactly 3 items.
*/
const GRID = '[grid-template-columns:2rem_1fr_8rem] sm:[grid-template-columns:2rem_2fr_2fr_1.5fr_1.5fr]';

export function MemberPaymentRow({ status, rowNumber, onSelect }: MemberPaymentRowProps) {
  const { member, hasPaid, payment } = status;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`View details for ${member.name}`}
        onClick={() => onSelect()}
        onKeyDown={e => e.key === 'Enter' && onSelect()}
        style={{ animationDelay: `${(rowNumber - 1) * 80}ms` }}
        className={`relative bg-muted/50 border border-border/50 rounded-xl overflow-hidden
          cursor-pointer hover:brightness-95
          animate-[row-slide-in_0.4s_ease-out_both]`}
      >
        {/* Status gradient — right-anchored */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: hasPaid
              ? 'linear-gradient(to left, oklch(0.696 0.17 162.48 / 0.10) 0%, transparent 40%)'
              : 'linear-gradient(to left, oklch(0.769 0.188 70.08 / 0.10) 0%, transparent 40%)',
          }}
        />

        <div className={`relative grid items-center gap-x-4 px-4 py-3.5 ${GRID}`}>

          {/* NO */}
          <span className="text-2xl font-bold tabular-nums text-muted-foreground/50 leading-none">
            {rowNumber < 10 ? `0${rowNumber}` : rowNumber}
          </span>

          {/* MEMBER — phone stacked below on mobile */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground sm:hidden">{formatPhone(member.phone)}</p>
          </div>

          {/* PHONE — sm+ only */}
          <p className="hidden sm:block text-xs text-muted-foreground tabular-nums truncate">
            {formatPhone(member.phone)}
          </p>

          {/* DATE — sm+ only; always rendered to hold the grid track */}
          <span className="hidden sm:block text-xs text-muted-foreground tabular-nums">
            {hasPaid && payment?.paymentDate ? formatPaymentDate(payment.paymentDate) : ''}
          </span>

          {/* STATUS — right-aligned at far end */}
          <div className="flex justify-end">
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
      </div>
    </>
  );
}
