'use client';

import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createGroup, updateGroup } from '@/lib/admin-actions';
import type { Group } from '@/lib/types';

interface GroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // When provided the form is in edit mode; otherwise create mode.
  group?: Group;
}

export function GroupForm({ open, onOpenChange, group }: GroupFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!group;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = (data.get('name') as string).trim();
    const description = (data.get('description') as string).trim() || undefined;

    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateGroup(group.id, { name, description })
        : await createGroup({ name, description });

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
          <DialogTitle>{isEdit ? 'Edit Group' : 'Add Group'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              name="name"
              required
              defaultValue={group?.name ?? ''}
              placeholder="e.g. Lagos Ajo Circle"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="group-description">Description (optional)</Label>
            <Input
              id="group-description"
              name="description"
              defaultValue={group?.description ?? ''}
              placeholder="Short description"
              disabled={isPending}
            />
          </div>

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
              {isPending ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
