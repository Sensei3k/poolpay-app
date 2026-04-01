'use client';

import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createMember, updateMember } from '@/lib/admin-actions';
import type { Member, MemberStatus } from '@/lib/types';

interface MemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  // When provided the form is in edit mode; otherwise create mode.
  member?: Member;
}

export function MemberForm({ open, onOpenChange, groupId, member }: MemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<MemberStatus>(member?.status ?? 'active');

  const isEdit = !!member;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = (data.get('name') as string).trim();
    const phone = (data.get('phone') as string).trim();
    const position = Number(data.get('position'));

    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateMember(member.id, { name, phone, position, status })
        : await createMember(groupId, { name, phone, position });

      if (result.success) {
        onOpenChange(false);
      } else {
        setError(result.error);
      }
    });
  }

  function handleOpenChange(next: boolean) {
    if (!isPending) {
      setError(null);
      onOpenChange(next);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Member' : 'Add Member'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              name="name"
              required
              defaultValue={member?.name ?? ''}
              placeholder="e.g. Adaeze Okafor"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-phone">Phone</Label>
            <Input
              id="member-phone"
              name="phone"
              required
              defaultValue={member?.phone ?? ''}
              placeholder="2349000000001"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-position">Position</Label>
            <Input
              id="member-position"
              name="position"
              type="number"
              required
              min={1}
              defaultValue={member?.position ?? ''}
              placeholder="1"
              disabled={isPending}
            />
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="member-status">Status</Label>
              <Select
                value={status}
                onValueChange={v => { if (v) setStatus(v as MemberStatus); }}
              >
                <SelectTrigger id="member-status" disabled={isPending}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
