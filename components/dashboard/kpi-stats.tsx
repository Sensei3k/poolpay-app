import { TrendingUp, Wallet, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNgn } from '@/lib/utils';

interface KpiStatsProps {
  totalKobo: number;
  collectedKobo: number;
  paidCount: number;
  totalMembers: number;
}

interface StatTileProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent?: 'default' | 'paid' | 'outstanding';
}

function StatTile({ label, value, sub, icon, accent = 'default' }: StatTileProps) {
  const accentClass = {
    default: 'text-muted-foreground',
    paid: 'text-ajo-paid',
    outstanding: 'text-ajo-outstanding',
  }[accent];

  const iconBg = {
    default: 'bg-muted',
    paid: 'bg-ajo-paid-subtle',
    outstanding: 'bg-ajo-outstanding-subtle',
  }[accent];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {label}
            </p>
            <p className={`mt-1 text-3xl font-bold tabular-nums leading-none tracking-tight ${accentClass}`}>
              {value}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>
          </div>
          <div className={`shrink-0 rounded-lg p-2 ${iconBg}`} aria-hidden="true">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiStats({ totalKobo, collectedKobo, paidCount, totalMembers }: KpiStatsProps) {
  const outstandingKobo = totalKobo - collectedKobo;
  const outstandingCount = totalMembers - paidCount;

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      aria-label="Cycle summary statistics"
      role="region"
    >
      <StatTile
        label="Total Pot"
        value={formatNgn(totalKobo)}
        sub={`${totalMembers} members`}
        icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
      />
      <StatTile
        label="Collected"
        value={formatNgn(collectedKobo)}
        sub={`${paidCount} of ${totalMembers} paid`}
        icon={<TrendingUp className="h-4 w-4 text-ajo-paid" />}
        accent="paid"
      />
      <StatTile
        label="Outstanding"
        value={formatNgn(outstandingKobo)}
        sub={`${outstandingCount} member${outstandingCount !== 1 ? 's' : ''} pending`}
        icon={<Users className="h-4 w-4 text-ajo-outstanding" />}
        accent={outstandingCount > 0 ? 'outstanding' : 'default'}
      />
    </div>
  );
}
