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

        <div className="relative flex items-center gap-4 px-4 py-3.5">
          {/* Row number */}
          <span className="w-8 shrink-0 text-2xl font-bold tabular-nums text-muted-foreground/50 leading-none">
            {rowNumber < 10 ? `0${rowNumber}` : rowNumber}
          </span>

          {/* Member info — name and phone are separate lines; more fields can be added here */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground">{formatPhone(member.phone)}</p>
          </div>

          {/* Date + status badge only */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            {hasPaid && payment?.paymentDate && (
              <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
                {formatPaymentDate(payment.paymentDate)}
              </span>
            )}
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
