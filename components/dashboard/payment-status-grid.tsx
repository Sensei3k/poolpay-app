'use client';

import { useState } from 'react';
import { BarChart2, TableIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SortablePaymentTable } from '@/components/dashboard/sortable-payment-table';
import { PaymentBarChart } from '@/components/dashboard/payment-bar-chart';
import type { MemberPaymentStatus } from '@/lib/types';

type ViewMode = 'table' | 'chart';

interface PaymentStatusGridProps {
  statuses: MemberPaymentStatus[];
  cycleId: number;
  cycleNumber: number;
  contributionKobo: number;
}

export function PaymentStatusGrid({ statuses, cycleId, cycleNumber, contributionKobo }: PaymentStatusGridProps) {
  const [view, setView] = useState<ViewMode>('table');

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-medium text-foreground">Member Payments</h2>
            <p className="text-xs text-muted-foreground">Cycle {cycleNumber}</p>
          </div>

          <div
            className="flex items-center rounded-md border border-border bg-muted/40 p-0.5"
            role="group"
            aria-label="Switch between table and chart view"
          >
            <button
              onClick={() => setView('table')}
              aria-label="Table view"
              aria-pressed={view === 'table'}
              className={`rounded p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                view === 'table'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setView('chart')}
              aria-label="Chart view"
              aria-pressed={view === 'chart'}
              className={`rounded p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                view === 'chart'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 pb-1">
        {view === 'table' ? (
          <SortablePaymentTable
            statuses={statuses}
            cycleId={cycleId}
            cycleNumber={cycleNumber}
            contributionKobo={contributionKobo}
          />
        ) : (
          <PaymentBarChart
            statuses={statuses}
            contributionKobo={contributionKobo}
          />
        )}
      </CardContent>
    </Card>
  );
}
