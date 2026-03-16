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

      <div
        role="progressbar"
        aria-label="Collection progress"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-ajo-paid transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {paidCount} of {totalMembers} members paid · {percent}%
      </p>
    </div>
  );
}
