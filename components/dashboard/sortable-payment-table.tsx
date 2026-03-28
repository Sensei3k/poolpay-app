'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { MemberPaymentRow, GRID } from '@/components/dashboard/member-payment-row';
import type { MemberPaymentStatus } from '@/lib/types';

type SortDir = 'asc' | 'desc' | null;

interface SortablePaymentTableProps {
  statuses: MemberPaymentStatus[];
  cycleNumber: number;
  onSelectMember: (status: MemberPaymentStatus) => void;
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
  cycleNumber,
  onSelectMember,
}: SortablePaymentTableProps) {
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [searchQuery, setSearchQuery] = useState('');

  function toggleSort() {
    setSortDir(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  }

  const filtered = useMemo(() => filterBySearch(statuses, searchQuery), [statuses, searchQuery]);
  const sorted = useMemo(() => sortByDate(filtered, sortDir), [filtered, sortDir]);

  const SortIcon = sortDir === 'asc' ? ArrowUp : sortDir === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <div aria-label={`Member payment statuses for Cycle ${cycleNumber}`}>
      {/* Search */}
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
            className="w-full rounded-md border border-border bg-muted/40 py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search members by name or phone"
          />
        </div>
      </div>

      <div className={`grid gap-x-4 px-8 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider ${GRID}`}>
        <span>No</span>
        <span>Member</span>
        <span className="hidden sm:block">Phone</span>
        <button
          onClick={toggleSort}
          className="hidden sm:inline-flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Sort by date ${sortDir === 'asc' ? 'descending' : 'ascending'}`}
        >
          Date
          <SortIcon className="h-3 w-3" aria-hidden="true" />
        </button>
        <span className="text-right">Status</span>
      </div>

      {/* Card list */}
      <div className="pb-4 px-4 space-y-2">
        {sorted.length > 0 ? (
          sorted.map((status, i) => (
            <MemberPaymentRow
              key={status.member.id}
              status={status}
              rowNumber={i + 1}
              onSelect={() => onSelectMember(status)}
            />
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No members match &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
