import { Progress } from '@/components/ui/progress';
import { formatNgn } from '@/lib/utils';

interface CollectionProgressProps {
  collectedKobo: number;
  totalKobo: number;
  paidCount: number;
  totalMembers: number;
}

export function CollectionProgress({
  collectedKobo,
  totalKobo,
  paidCount,
  totalMembers,
}: CollectionProgressProps) {
  const percent = totalKobo > 0 ? Math.round((collectedKobo / totalKobo) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {formatNgn(collectedKobo)}
        </span>
        <span className="text-sm text-muted-foreground">
          of {formatNgn(totalKobo)}
        </span>
      </div>

      <Progress
        value={percent}
        className="h-2 bg-muted"
        aria-label="Collection progress"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <p className="text-xs text-muted-foreground">
        {paidCount} of {totalMembers} members paid · {percent}%
      </p>
    </div>
  );
}
