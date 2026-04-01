'use client';

import { useRouter } from 'next/navigation';
import type { Group } from '@/lib/types';

interface GroupTabsProps {
  groups: Group[];
  selectedGroupId: string;
}

export function GroupTabs({ groups, selectedGroupId }: GroupTabsProps) {
  const router = useRouter();

  if (groups.length === 0) return null;

  return (
    <div
      className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto"
      role="tablist"
      aria-label="Select group"
    >
      {groups.map(group => {
        const isSelected = group.id === selectedGroupId;
        return (
          <button
            key={group.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => router.push(`/admin?group=${group.id}`)}
            className={`cursor-pointer shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isSelected
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {group.name}
          </button>
        );
      })}
    </div>
  );
}
