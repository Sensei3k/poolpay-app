import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import type { MemberPaymentStatus } from '@/lib/types';

interface MemberPaymentRowProps {
  status: MemberPaymentStatus;
}

function formatPaymentDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function MemberPaymentRow({ status }: MemberPaymentRowProps) {
  const { member, hasPaid, payment } = status;

  return (
    <TableRow className="border-border hover:bg-muted/40 transition-colors">
      <TableCell className="w-10 py-3 pl-4">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground"
          aria-label={`Position ${member.position}`}
        >
          {member.position}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <p className="text-sm font-medium text-foreground">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.phone}</p>
      </TableCell>

      <TableCell className="py-3 text-right pr-4">
        {hasPaid ? (
          <div className="flex flex-col items-end gap-0.5">
            <Badge className="bg-ajo-paid-subtle text-ajo-paid border-transparent text-xs font-medium">
              Paid ✓
            </Badge>
            {payment?.paymentDate && (
              <span className="text-xs text-muted-foreground">
                {formatPaymentDate(payment.paymentDate)}
              </span>
            )}
          </div>
        ) : (
          <Badge className="bg-ajo-outstanding-subtle text-ajo-outstanding border-transparent text-xs font-medium">
            Outstanding
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
