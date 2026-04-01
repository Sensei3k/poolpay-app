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
import { GroupForm } from '@/app/admin/_components/group-form';
import { DeleteConfirm } from '@/app/admin/_components/delete-confirm';
import { deleteGroup } from '@/lib/admin-actions';
import type { Group } from '@/lib/types';

interface GroupsSectionProps {
  groups: Group[];
}

export function GroupsSection({ groups }: GroupsSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  return (
    <section aria-labelledby="groups-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="groups-heading" className="text-lg font-semibold tracking-tight">
          Groups
        </h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1" aria-hidden="true" />
          Add Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No groups found.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map(group => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={group.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {group.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {group.description ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${group.name}`}
                        onClick={() => setEditGroup(group)}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${group.name}`}
                        onClick={() => setDeleteTarget(group)}
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

      <GroupForm open={addOpen} onOpenChange={setAddOpen} />

      {editGroup && (
        <GroupForm
          open={!!editGroup}
          onOpenChange={open => { if (!open) setEditGroup(null); }}
          group={editGroup}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          onOpenChange={open => { if (!open) setDeleteTarget(null); }}
          title={`Delete "${deleteTarget.name}"?`}
          description="This will permanently delete the group. This action cannot be undone."
          onConfirm={() => deleteGroup(deleteTarget.id)}
        />
      )}
    </section>
  );
}
