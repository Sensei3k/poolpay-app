import { Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CollectionProgress } from '@/components/dashboard/collection-progress';
import type { CycleSummary } from '@/lib/types';

interface ActiveCycleCardProps {
  summary: CycleSummary;
}

function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    parseLocalDate(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export function ActiveCycleCard({ summary }: ActiveCycleCardProps) {
  const { cycle, recipient, paidCount, totalMembers, collectedKobo } = summary;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground" style={{ letterSpacing: '-0.02em' }}>
            Cycle {cycle.cycleNumber}
          </h2>
          <Badge className="shrink-0 bg-ajo-paid-subtle text-ajo-paid border-transparent text-xs font-medium">
            Active
          </Badge>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground pt-0.5">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {formatDateRange(cycle.startDate, cycle.endDate)}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        <section aria-label="Recipient information">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            <User className="h-3 w-3 shrink-0" aria-hidden="true" />
            Collecting this cycle
          </p>
          <p className="text-base font-semibold text-foreground">{recipient.name}</p>
          <p className="text-sm text-muted-foreground">Position #{recipient.position}</p>
        </section>

        <Separator className="bg-border" />

        <section aria-label="Collection progress">
          <CollectionProgress
            collectedKobo={collectedKobo}
            totalKobo={cycle.totalAmount}
            paidCount={paidCount}
            totalMembers={totalMembers}
          />
        </section>
      </CardContent>
    </Card>
  );
}
