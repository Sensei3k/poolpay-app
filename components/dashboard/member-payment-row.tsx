'use client';

import { memo } from 'react';
import { formatPhone, formatPaymentDate, padZero } from '@/lib/utils';
import { PaymentStatusBadge } from '@/components/dashboard/payment-status-badge';
import type { MemberPaymentStatus } from '@/lib/types';

interface MemberPaymentRowProps {
  status: MemberPaymentStatus;
  rowNumber: number;
  onSelect: () => void;
}

/*
  Grid columns — same template used in the header so every column aligns:
    mobile:  [2rem | 1fr        | 8rem  ]
    sm+:     [2rem | 2fr | 2fr  | 1.5fr | 1.5fr]
             NO     NAME  PHONE   DATE    STATUS

  Hidden items (phone/date on mobile) don't consume grid tracks, so
  the mobile 3-col template always sees exactly 3 items.
*/
export const GRID = '[grid-template-columns:2rem_1fr_8rem] sm:[grid-template-columns:2rem_2fr_2fr_1.5fr_1.5fr]';

export const MemberPaymentRow = memo(function MemberPaymentRow({ status, rowNumber, onSelect }: MemberPaymentRowProps) {
  const { member, hasPaid, payment } = status;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${member.name}`}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{ animationDelay: `${(rowNumber - 1) * 80}ms` }}
      className={`relative bg-muted/50 border border-border/50 rounded-xl overflow-hidden
        cursor-pointer hover:brightness-95
        animate-[row-slide-in_0.4s_ease-out_both]`}
    >
      {/* Right-anchored status gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hasPaid
            ? 'linear-gradient(to left, oklch(0.696 0.17 162.48 / 0.10) 0%, transparent 40%)'
            : 'linear-gradient(to left, oklch(0.769 0.188 70.08 / 0.10) 0%, transparent 40%)',
        }}
      />

      <div className={`relative grid items-center gap-x-4 px-4 py-3.5 ${GRID}`}>

        <span className="text-2xl font-bold tabular-nums text-muted-foreground/50 leading-none">
          {padZero(rowNumber)}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
          <p className="text-xs text-muted-foreground sm:hidden">{formatPhone(member.phone)}</p>
        </div>

        <p className="hidden sm:block text-xs text-muted-foreground tabular-nums truncate">
          {formatPhone(member.phone)}
        </p>

        <span className="hidden sm:block text-xs text-muted-foreground tabular-nums">
          {hasPaid && payment?.paymentDate ? formatPaymentDate(payment.paymentDate) : ''}
        </span>

        <div className="flex justify-end">
          <PaymentStatusBadge hasPaid={hasPaid} variant="row" />
        </div>
      </div>
    </div>
  );
});
