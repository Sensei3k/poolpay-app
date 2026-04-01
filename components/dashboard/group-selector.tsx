'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Group } from '@/lib/types';

interface GroupSelectorProps {
  groups: Group[];
  selectedGroupId: string;
}

export function GroupSelector({ groups, selectedGroupId }: GroupSelectorProps) {
  const router = useRouter();

  function handleChange(id: string | null) {
    if (!id) return;
    router.push(`/?group=${id}`);
  }

  return (
    <Select value={selectedGroupId} onValueChange={handleChange}>
      <SelectTrigger
        className="h-8 w-[160px] text-xs"
        aria-label="Select savings group"
      >
        <SelectValue placeholder="Select group" />
      </SelectTrigger>
      <SelectContent>
        {groups.map(group => (
          <SelectItem key={group.id} value={group.id} className="text-xs">
            {group.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
