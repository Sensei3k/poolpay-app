'use client';

import { useState, useEffect } from 'react';
import { BarChart2, TableIcon, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SortablePaymentTable } from '@/components/dashboard/sortable-payment-table';
import { CyclePerformanceChart } from '@/components/dashboard/cycle-performance-chart';
import { PaymentToggleButton } from '@/components/dashboard/payment-toggle-button';
import { PaymentStatusBadge } from '@/components/dashboard/payment-status-badge';
import { formatPhone, formatPaymentDate, formatNgn, padZero } from '@/lib/utils';
import type { MemberPaymentStatus, Cycle, Payment } from '@/lib/types';

type ViewMode = 'table' | 'chart';

interface PaymentStatusGridProps {
  statuses: MemberPaymentStatus[];
  cycleId: string;
  cycleNumber: number;
  contributionKobo: number;
  cycles: Cycle[];
  payments: Payment[];
}

export function PaymentStatusGrid({ statuses, cycleId, cycleNumber, contributionKobo, cycles, payments }: PaymentStatusGridProps) {
  const [view, setView] = useState<ViewMode>('table');
  const [selectedMember, setSelectedMember] = useState<MemberPaymentStatus | null>(null);
  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(null);

  const activeCycle = cycles.find(c => c.id === cycleId);

  // Sync overlay with server re-renders after payment toggle
  useEffect(() => {
    if (!selectedMember) return;
    const updated = statuses.find(s => s.member.id === selectedMember.member.id);
    if (updated) setSelectedMember(updated);
  }, [statuses, selectedMember]);

  return (
    <Card className="relative overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Member Payments</h2>
            <p className="text-sm text-muted-foreground">{view === 'chart' ? 'All cycles' : `Cycle ${cycleNumber}`}</p>
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
              className={`cursor-pointer rounded p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
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
              className={`cursor-pointer rounded p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
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
            cycleNumber={cycleNumber}
            onSelectMember={(status, rowNumber) => { setSelectedMember(status); setSelectedRowNumber(rowNumber); }}
          />
        ) : (
          <CyclePerformanceChart
            cycles={cycles}
            payments={payments}
          />
        )}
      </CardContent>

      {selectedMember && (
        <div className="absolute inset-0 bg-card flex flex-col rounded-xl z-10 overflow-hidden border border-border">

          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl font-bold tabular-nums text-muted-foreground/30 leading-none shrink-0 w-9">
                {padZero(selectedRowNumber ?? selectedMember.member.position)}
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground truncate leading-tight">
                  {selectedMember.member.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPhone(selectedMember.member.phone)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <PaymentToggleButton
                memberId={selectedMember.member.id}
                cycleId={cycleId}
                hasPaid={selectedMember.hasPaid}
                contributionKobo={contributionKobo}
              />
              <button
                onClick={() => { setSelectedMember(null); setSelectedRowNumber(null); }}
                aria-label="Close member detail"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-border/60">
            <div className="bg-muted/40 rounded-lg px-3 py-2.5 border border-border/40">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Paid Date
              </p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {selectedMember.hasPaid && selectedMember.payment?.paymentDate
                  ? formatPaymentDate(selectedMember.payment.paymentDate)
                  : '—'}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg px-3 py-2.5 border border-border/40">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Due Date
              </p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {activeCycle?.endDate ? formatPaymentDate(activeCycle.endDate) : '—'}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg px-3 py-2.5 border border-border/40 flex flex-col">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Status
              </p>
              <PaymentStatusBadge hasPaid={selectedMember.hasPaid} variant="tile" />
            </div>
          </div>

          <div className="px-5 py-4 border-b border-border/60">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Contribution
            </p>
            <div className="flex items-baseline justify-between">
              <p className="text-xl font-bold text-foreground tabular-nums">
                {formatNgn(contributionKobo)}
              </p>
              <p className="text-xs text-muted-foreground">
                Cycle {cycleNumber}
              </p>
            </div>
          </div>

          <div className="flex-1 px-5 py-4 overflow-hidden">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Payment History
            </p>
            <div className="space-y-1.5 font-mono text-xs text-muted-foreground/50">
              <p>— No additional history available</p>
            </div>
          </div>

        </div>
      )}
    </Card>
  );
}
