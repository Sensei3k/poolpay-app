'use client';

import { useState, useMemo } from 'react';
import type { Cycle, Payment } from '@/lib/types';
import { buildChartData } from '@/lib/chart-data';
import {
  AreaChart,
  Area,
  Grid,
  XAxis,
  ChartTooltip,
  chartCssVars,
} from '@/components/ui/area-chart';

// SVG gradient stop-color doesn't resolve CSS custom property chains reliably.
// These hex values are the resolved equivalents of --ajo-paid and --ajo-outstanding
// and are consistent across light and dark mode (brand colours don't invert).
const TEAL = '#00bc7d'; // oklch(0.696 0.17 162.48) — --ajo-paid
const GOLD = '#e8970a'; // oklch(0.769 0.188 70.08) — --ajo-outstanding

type ChartView = 'per-cycle' | 'cumulative';

interface CyclePerformanceChartProps {
  cycles: Cycle[];
  payments: Payment[];
}

export function CyclePerformanceChart({ cycles, payments }: CyclePerformanceChartProps) {
  const [view, setView] = useState<ChartView>('per-cycle');
  const rawData = useMemo(() => buildChartData(cycles, payments), [cycles, payments]);
  // AreaChart primitive requires Record<string, unknown>[] — CycleChartDatum is
  // structurally compatible but lacks an index signature, so a double cast is needed.
  const data = rawData as unknown as Record<string, unknown>[];
  const totalCollected = rawData[rawData.length - 1]?.cumulative ?? 0;

  const perCycleLabel = `Collection per cycle chart across ${cycles.length} cycles`;
  const cumulativeLabel = `Cumulative pot growth chart: ₦${totalCollected.toLocaleString('en-NG')} total collected`;

  if (rawData.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground">
        No cycle data to display.
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      {/* View toggle */}
      <div
        className="mb-3 flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5 w-fit"
        role="group"
        aria-label="Switch between per-cycle and cumulative chart"
      >
        <button
          onClick={() => setView('per-cycle')}
          aria-pressed={view === 'per-cycle'}
          className={`cursor-pointer rounded px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
            view === 'per-cycle'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Per Cycle
        </button>
        <button
          onClick={() => setView('cumulative')}
          aria-pressed={view === 'cumulative'}
          className={`cursor-pointer rounded px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
            view === 'cumulative'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Cumulative
        </button>
      </div>

      {view === 'per-cycle' ? (
        <div role="img" aria-label={perCycleLabel}>
          <AreaChart data={data} xDataKey="date" aspectRatio="2 / 1">
            <Grid horizontal />
            <Area dataKey="collected" fill={TEAL} fillOpacity={0.35} showHighlight />
            <Area dataKey="outstanding" fill={GOLD} fillOpacity={0.25} showHighlight />
            <XAxis numTicks={Math.min(data.length, 6)} />
            <ChartTooltip
              rows={(point) => [
                {
                  color: TEAL,
                  label: 'Collected',
                  value: `₦${(typeof point.collected === 'number' ? point.collected : 0).toLocaleString('en-NG')}`,
                },
                {
                  color: GOLD,
                  label: 'Outstanding',
                  value: `₦${(typeof point.outstanding === 'number' ? point.outstanding : 0).toLocaleString('en-NG')}`,
                },
              ]}
            />
          </AreaChart>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: chartCssVars.linePrimary }} />
              Collected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: chartCssVars.lineSecondary, opacity: 0.55 }} />
              Outstanding
            </span>
          </div>
        </div>
      ) : (
        <div role="img" aria-label={cumulativeLabel}>
          <AreaChart data={data} xDataKey="date" aspectRatio="2 / 1">
            <Grid horizontal />
            <Area dataKey="cumulative" fill={TEAL} fillOpacity={0.3} showHighlight />
            <XAxis numTicks={Math.min(data.length, 6)} />
            <ChartTooltip
              rows={(point) => [
                {
                  color: chartCssVars.linePrimary,
                  label: 'Total Collected',
                  value: `₦${(typeof point.cumulative === 'number' ? point.cumulative : 0).toLocaleString('en-NG')}`,
                },
              ]}
            />
          </AreaChart>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: chartCssVars.linePrimary }} />
              Cumulative total
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
