'use client';

import { useState, useEffect } from 'react';
import { BarChart2, TableIcon, X, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SortablePaymentTable } from '@/components/dashboard/sortable-payment-table';
import { CyclePerformanceChart } from '@/components/dashboard/cycle-performance-chart';
import { PaymentToggleButton } from '@/components/dashboard/payment-toggle-button';
import { formatPhone, formatPaymentDate } from '@/lib/utils';
import type { MemberPaymentStatus, Cycle, Payment } from '@/lib/types';

type ViewMode = 'table' | 'chart';

interface PaymentStatusGridProps {
  statuses: MemberPaymentStatus[];
  cycleId: number;
  cycleNumber: number;
  contributionKobo: number;
  cycles: Cycle[];
  payments: Payment[];
}

export function PaymentStatusGrid({ statuses, cycleId, cycleNumber, contributionKobo, cycles, payments }: PaymentStatusGridProps) {
  const [view, setView] = useState<ViewMode>('table');
  const [selectedMember, setSelectedMember] = useState<MemberPaymentStatus | null>(null);

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
            onSelectMember={setSelectedMember}
          />
        ) : (
          <CyclePerformanceChart
            cycles={cycles}
            payments={payments}
          />
        )}
      </CardContent>

      {/* Inline overlay — sits inside the card, not full-screen */}
      {selectedMember && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col rounded-xl z-10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/40 bg-muted/30">
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground truncate">{selectedMember.member.name}</p>
              <p className="text-xs text-muted-foreground">{formatPhone(selectedMember.member.phone)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div
                onClick={e => e.stopPropagation()}
                onKeyDown={e => e.stopPropagation()}
              >
                <PaymentToggleButton
                  memberId={selectedMember.member.id}
                  cycleId={cycleId}
                  hasPaid={selectedMember.hasPaid}
                  contributionKobo={contributionKobo}
                />
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                aria-label="Close member detail"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-border/50 bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-xs space-y-4">
              {/* Status */}
              <div className="flex justify-center">
                {selectedMember.hasPaid ? (
                  <div className="px-5 py-2.5 rounded-lg bg-ajo-paid/10 border border-ajo-paid/30 flex items-center gap-2">
                    <span className="text-ajo-paid text-base font-medium">Paid</span>
                    <CheckCircle2 className="h-4 w-4 text-ajo-paid" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="px-5 py-2.5 rounded-lg bg-ajo-outstanding/10 border border-ajo-outstanding/30">
                    <span className="text-ajo-outstanding text-base font-medium">Outstanding</span>
                  </div>
                )}
              </div>

              {/* Payment date if paid */}
              {selectedMember.hasPaid && selectedMember.payment?.paymentDate && (
                <div className="bg-muted/40 rounded-lg px-4 py-3 border border-border/30 text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Paid on</p>
                  <p className="text-sm font-medium text-foreground">{formatPaymentDate(selectedMember.payment.paymentDate, true)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
