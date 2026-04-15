import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GroupSelector } from '@/components/dashboard/group-selector';
import type { CycleSummary, Group } from '@/lib/types';

interface DashboardHeaderProps {
  activeCycle: CycleSummary | null;
  groups: Group[];
  selectedGroupId: string;
}

function formatHeaderDate(isoDate: string): string {
  // Parse as local date (not UTC) to avoid off-by-one at midnight UTC
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DashboardHeader({ activeCycle, groups, selectedGroupId }: DashboardHeaderProps) {
  const today = formatHeaderDate(new Date().toISOString().slice(0, 10));
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const heading = selectedGroup?.name ?? 'Dashboard';

  return (
    <header>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tighter text-foreground">
            <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            {heading}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap justify-end">
          {groups.length > 0 && (
            <GroupSelector groups={groups} selectedGroupId={selectedGroupId} />
          )}
          {activeCycle && (
            <Badge
              className="shrink-0 bg-ajo-paid-subtle text-ajo-paid border-transparent text-xs font-medium px-2.5 py-1"
              aria-label={`Active cycle: Cycle ${activeCycle.cycle.cycleNumber}`}
            >
              Cycle {activeCycle.cycle.cycleNumber} · Active
            </Badge>
          )}
        </div>
      </div>

      <Separator className="mt-6 bg-border" />
    </header>
  );
}
