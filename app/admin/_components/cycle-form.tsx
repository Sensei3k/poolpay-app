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
import { createCycle, updateCycle } from '@/lib/admin-actions';
import type { Cycle, CycleStatus, Member } from '@/lib/types';

interface CycleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: Member[];
  // When provided the form is in edit mode; otherwise create mode.
  cycle?: Cycle;
}

export function CycleForm({ open, onOpenChange, groupId, members, cycle }: CycleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string>(cycle?.recipientMemberId ?? '');
  const [status, setStatus] = useState<CycleStatus>(cycle?.status ?? 'pending');

  const isEdit = !!cycle;
  const activeMembers = members.filter(m => m.status === 'active');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const cycleNumber = Number(data.get('cycleNumber'));
    const startDate = data.get('startDate') as string;
    const endDate = data.get('endDate') as string;
    // Input is NGN; backend expects kobo
    const contributionPerMember = Math.round(Number(data.get('contribution')) * 100);

    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateCycle(cycle.id, {
            startDate,
            endDate,
            contributionPerMember,
            recipientMemberId: recipientId || undefined,
            status,
          })
        : await createCycle(groupId, {
            cycleNumber,
            startDate,
            endDate,
            contributionPerMember,
            recipientMemberId: recipientId,
          });

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
          <DialogTitle>{isEdit ? 'Edit Cycle' : 'Add Cycle'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="cycle-number">Cycle Number</Label>
              <Input
                id="cycle-number"
                name="cycleNumber"
                type="number"
                required
                min={1}
                defaultValue=""
                placeholder="1"
                disabled={isPending}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cycle-start">Start Date</Label>
              <Input
                id="cycle-start"
                name="startDate"
                type="date"
                required
                defaultValue={cycle?.startDate ?? ''}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cycle-end">End Date</Label>
              <Input
                id="cycle-end"
                name="endDate"
                type="date"
                required
                defaultValue={cycle?.endDate ?? ''}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cycle-contribution">Contribution per Member (₦)</Label>
            <Input
              id="cycle-contribution"
              name="contribution"
              type="number"
              required
              min={1}
              step="0.01"
              // Convert kobo back to NGN for display
              defaultValue={cycle ? cycle.contributionPerMember / 100 : ''}
              placeholder="5000"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cycle-recipient">Recipient Member</Label>
            <Select
              value={recipientId}
              onValueChange={v => { if (v) setRecipientId(v); }}
            >
              <SelectTrigger id="cycle-recipient" disabled={isPending}>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} (#{m.position})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="cycle-status">Status</Label>
              <Select
                value={status}
                onValueChange={v => { if (v) setStatus(v as CycleStatus); }}
              >
                <SelectTrigger id="cycle-status" disabled={isPending}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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
              {isPending ? 'Saving…' : isEdit ? 'Save' : 'Add Cycle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
