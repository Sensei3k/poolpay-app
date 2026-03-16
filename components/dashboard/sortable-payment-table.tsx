'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MemberPaymentRow } from '@/components/dashboard/member-payment-row';
import type { MemberPaymentStatus } from '@/lib/types';

type SortDir = 'asc' | 'desc' | null;

interface SortablePaymentTableProps {
  statuses: MemberPaymentStatus[];
  cycleId: number;
  cycleNumber: number;
  contributionKobo: number;
}

function sortByDate(statuses: MemberPaymentStatus[], dir: SortDir): MemberPaymentStatus[] {
  if (!dir) return statuses;

  return [...statuses].sort((a, b) => {
    const dateA = a.payment?.paymentDate ?? null;
    const dateB = b.payment?.paymentDate ?? null;

    // No date (outstanding) always sinks to the bottom
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    const cmp = dateA.localeCompare(dateB);
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function SortablePaymentTable({
  statuses,
  cycleId,
  cycleNumber,
  contributionKobo,
}: SortablePaymentTableProps) {
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function toggleSort() {
    setSortDir(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  }

  const sorted = sortByDate(statuses, sortDir);

  const SortIcon = sortDir === 'asc' ? ArrowUp : sortDir === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <Table aria-label={`Member payment statuses for Cycle ${cycleNumber}`}>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="w-10 pl-4 text-xs text-muted-foreground">#</TableHead>
          <TableHead className="text-xs text-muted-foreground">Member</TableHead>
          <TableHead className="text-right pr-4 text-xs text-muted-foreground">
            <button
              onClick={toggleSort}
              className="inline-flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors ml-auto"
              aria-label={`Sort by date ${sortDir === 'asc' ? 'descending' : 'ascending'}`}
            >
              Date / Status
              <SortIcon className="h-3 w-3" aria-hidden="true" />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map(status => (
          <MemberPaymentRow
            key={status.member.id}
            status={status}
            cycleId={cycleId}
            contributionKobo={contributionKobo}
          />
        ))}
      </TableBody>
    </Table>
  );
}
