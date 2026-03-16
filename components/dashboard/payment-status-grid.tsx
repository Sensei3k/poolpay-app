import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SortablePaymentTable } from '@/components/dashboard/sortable-payment-table';
import type { MemberPaymentStatus } from '@/lib/types';

interface PaymentStatusGridProps {
  statuses: MemberPaymentStatus[];
  cycleId: number;
  cycleNumber: number;
  contributionKobo: number;
}

export function PaymentStatusGrid({ statuses, cycleId, cycleNumber, contributionKobo }: PaymentStatusGridProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Member Payments
        </CardTitle>
        <p className="text-xs text-muted-foreground">Cycle {cycleNumber}</p>
      </CardHeader>

      <CardContent className="p-0 pb-1">
        <SortablePaymentTable
          statuses={statuses}
          cycleId={cycleId}
          cycleNumber={cycleNumber}
          contributionKobo={contributionKobo}
        />
      </CardContent>
    </Card>
  );
}
