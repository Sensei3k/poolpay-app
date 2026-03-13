import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberPaymentRow } from '@/components/dashboard/member-payment-row';
import type { MemberPaymentStatus } from '@/lib/types';

interface PaymentStatusGridProps {
  statuses: MemberPaymentStatus[];
  cycleNumber: number;
}

export function PaymentStatusGrid({ statuses, cycleNumber }: PaymentStatusGridProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Member Payments
        </CardTitle>
        <p className="text-xs text-muted-foreground">Cycle {cycleNumber}</p>
      </CardHeader>

      <CardContent className="p-0 pb-1">
        <Table aria-label={`Member payment statuses for Cycle ${cycleNumber}`}>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-10 pl-4 text-xs text-muted-foreground">#</TableHead>
              <TableHead className="text-xs text-muted-foreground">Member</TableHead>
              <TableHead className="text-right pr-4 text-xs text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map(status => (
              <MemberPaymentRow key={status.member.id} status={status} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
