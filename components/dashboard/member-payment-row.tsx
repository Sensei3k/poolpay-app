import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    <TableRow className="border-border hover:bg-muted/40 transition-colors">
      <TableCell className="w-10 py-3 pl-4">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground"
          aria-hidden="true"
        >
          {rowNumber}
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
            <Badge className="inline-flex items-center gap-1 bg-ajo-paid-subtle text-ajo-paid border-transparent text-xs font-medium">
              Paid
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            </Badge>
          ) : (
            <Badge className="bg-ajo-outstanding-subtle text-ajo-outstanding border-transparent text-xs font-medium">
              Outstanding
            </Badge>
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
