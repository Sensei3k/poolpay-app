import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { PoolSummary } from '@/lib/view-models/member';
import { PoolSwatch } from '@/components/member/pool-swatch';

export interface PoolCardProps {
  pool: PoolSummary;
}

/**
 * Pool card used in the home grid. Mirrors the design's `<div className="pool">`
 * markup from `member-desktop.jsx`: top row with avatar / name / chevron,
 * progress bar below, footnote and amount on the bottom row.
 *
 * Renders as a link to `/pools/:poolId` so the entire card is clickable;
 * the chevron is aria-hidden because the surrounding link covers it.
 */
export function PoolCard({ pool }: PoolCardProps) {
  return (
    <Link
      href={`/pools/${pool.id}`}
      aria-label={`Open ${pool.name}`}
      className="block rounded-[14px] bg-d2-cream p-4 transition-colors hover:bg-d2-warm-bg/40"
      style={{
        border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <PoolSwatch glyph={pool.initial} swatch={pool.swatch} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold tracking-tight text-d2-ink">
            {pool.name}
          </div>
          <div className="truncate text-[11px] text-d2-ink/55">
            {pool.subtitle}
          </div>
        </div>
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="text-d2-ink/40"
        />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-d2-ink/[0.08]">
        <div
          className="h-full rounded-full bg-d2-accent"
          style={{ width: `${pool.progressPct}%` }}
          role="progressbar"
          aria-valuenow={pool.progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pool.name} progress`}
        />
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-d2-ink/55">
        <span>{pool.footnote}</span>
        <span className="font-mono tabular-nums text-d2-ink/75">
          {pool.amountLabel}
        </span>
      </div>
    </Link>
  );
}
