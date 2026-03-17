'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
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

function filterBySearch(statuses: MemberPaymentStatus[], query: string): MemberPaymentStatus[] {
  const q = query.trim().toLowerCase();
  if (!q) return statuses;
  const digits = q.replace(/\D/g, '');
  return statuses.filter(s =>
    s.member.name.toLowerCase().includes(q) ||
    (digits.length > 0 && s.member.phone.includes(digits)),
  );
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
  const [searchQuery, setSearchQuery] = useState('');

  function toggleSort() {
    setSortDir(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  }

  const filtered = filterBySearch(statuses, searchQuery);
  const sorted = sortByDate(filtered, sortDir);

  const SortIcon = sortDir === 'asc' ? ArrowUp : sortDir === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <>
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-muted/40 py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Search members by name or phone"
          />
        </div>
      </div>

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
          {sorted.length > 0 ? (
            sorted.map(status => (
              <MemberPaymentRow
                key={status.member.id}
                status={status}
                cycleId={cycleId}
                contributionKobo={contributionKobo}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                No members match &ldquo;{searchQuery}&rdquo;
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
