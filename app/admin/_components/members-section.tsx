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
import { MemberForm } from '@/app/admin/_components/member-form';
import { DeleteConfirm } from '@/app/admin/_components/delete-confirm';
import { deleteMember } from '@/lib/admin-actions';
import { formatPhone } from '@/lib/utils';
import type { Member } from '@/lib/types';

interface MembersSectionProps {
  members: Member[];
  groupId: string;
}

export function MembersSection({ members, groupId }: MembersSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  return (
    <section aria-labelledby="members-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="members-heading" className="text-lg font-semibold tracking-tight">
          Members
        </h2>
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={!groupId}>
          <Plus className="mr-1" aria-hidden="true" />
          Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No members in this group.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...members]
                .sort((a, b) => a.position - b.position)
                .map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {formatPhone(member.phone)}
                    </TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>
                      <Badge
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${member.name}`}
                          onClick={() => setEditMember(member)}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${member.name}`}
                          onClick={() => setDeleteTarget(member)}
                        >
                          <Trash2 className="text-destructive" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      <MemberForm open={addOpen} onOpenChange={setAddOpen} groupId={groupId} />

      {editMember && (
        <MemberForm
          open={!!editMember}
          onOpenChange={open => { if (!open) setEditMember(null); }}
          groupId={groupId}
          member={editMember}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          onOpenChange={open => { if (!open) setDeleteTarget(null); }}
          title={`Delete "${deleteTarget.name}"?`}
          description="This will permanently delete the member. This action cannot be undone."
          onConfirm={() => deleteMember(deleteTarget.id)}
        />
      )}
    </section>
  );
}
