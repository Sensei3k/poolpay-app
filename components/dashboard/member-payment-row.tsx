import { CheckCircle2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { PaymentToggleButton } from '@/components/dashboard/payment-toggle-button';
import type { MemberPaymentStatus } from '@/lib/types';

interface MemberPaymentRowProps {
  status: MemberPaymentStatus;
  cycleId: number;
  contributionKobo: number;
  rowNumber: number;
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

export function MemberPaymentRow({ status, cycleId, contributionKobo, rowNumber }: MemberPaymentRowProps) {
  const { member, hasPaid, payment } = status;

  return (
    <TableRow
      className="border-border transition-colors hover:brightness-95"
      style={{
        background: hasPaid
          ? 'linear-gradient(to left, oklch(0.696 0.17 162.48 / 0.08) 0%, transparent 38%)'
          : 'linear-gradient(to left, oklch(0.769 0.188 70.08 / 0.08) 0%, transparent 38%)',
      }}
    >
      <TableCell className="w-10 py-3 pl-4">
        <span className="text-2xl font-bold tabular-nums text-muted-foreground/60 leading-none">
          {rowNumber < 10 ? `0${rowNumber}` : rowNumber}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <p className="text-sm font-medium text-foreground">{member.name}</p>
        <p className="text-xs text-muted-foreground">{formatPhone(member.phone)}</p>
      </TableCell>

      <TableCell className="py-3 pr-4">
        <div className="flex items-center justify-end gap-3">
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
          <PaymentToggleButton
            memberId={member.id}
            cycleId={cycleId}
            hasPaid={hasPaid}
            contributionKobo={contributionKobo}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
