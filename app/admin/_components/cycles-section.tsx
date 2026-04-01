'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CycleForm } from '@/app/admin/_components/cycle-form';
import { DeleteConfirm } from '@/app/admin/_components/delete-confirm';
import { deleteCycle } from '@/lib/admin-actions';
import { formatNgn, formatPaymentDate } from '@/lib/utils';
import type { Cycle, Member } from '@/lib/types';

const STATUS_VARIANT = {
  pending: 'secondary',
  active: 'default',
  closed: 'outline',
} as const;

interface CyclesSectionProps {
  cycles: Cycle[];
  members: Member[];
  groupId: string;
}

export function CyclesSection({ cycles, members, groupId }: CyclesSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editCycle, setEditCycle] = useState<Cycle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cycle | null>(null);

  const memberById = new Map(members.map(m => [m.id, m]));

  return (
    <section aria-labelledby="cycles-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="cycles-heading" className="text-lg font-semibold tracking-tight">
          Cycles
        </h2>
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={!groupId}>
          <Plus className="mr-1" aria-hidden="true" />
          Add Cycle
        </Button>
      </div>

      {cycles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No cycles in this group.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>#</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Contribution</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...cycles]
                .sort((a, b) => a.cycleNumber - b.cycleNumber)
                .map(cycle => {
                  const recipient = memberById.get(cycle.recipientMemberId);
                  return (
                    <TableRow key={cycle.id}>
                      <TableCell className="font-medium tabular-nums">
                        {cycle.cycleNumber}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatPaymentDate(cycle.startDate, true)} – {formatPaymentDate(cycle.endDate, true)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNgn(cycle.contributionPerMember)}
                      </TableCell>
                      <TableCell>{recipient?.name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANT[cycle.status]}
                          className="capitalize"
                        >
                          {cycle.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit cycle ${cycle.cycleNumber}`}
                            onClick={() => setEditCycle(cycle)}
                          >
                            <Pencil aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete cycle ${cycle.cycleNumber}`}
                            onClick={() => setDeleteTarget(cycle)}
                          >
                            <Trash2 className="text-destructive" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      )}

      <CycleForm
        open={addOpen}
        onOpenChange={setAddOpen}
        groupId={groupId}
        members={members}
      />

      {editCycle && (
        <CycleForm
          open={!!editCycle}
          onOpenChange={open => { if (!open) setEditCycle(null); }}
          groupId={groupId}
          members={members}
          cycle={editCycle}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          onOpenChange={open => { if (!open) setDeleteTarget(null); }}
          title={`Delete Cycle ${deleteTarget.cycleNumber}?`}
          description="This will permanently delete the cycle and all associated payments. This action cannot be undone."
          onConfirm={() => deleteCycle(deleteTarget.id)}
        />
      )}
    </section>
  );
}
