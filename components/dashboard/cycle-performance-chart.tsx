'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import type { Cycle, Payment } from '@/lib/types';

// Hex equivalents of --color-ajo-paid / --color-ajo-outstanding.
// SVG fill attributes don't support oklch, so we resolve to hex here.
const COLOR_PAID = '#00bc7d';
const COLOR_OUTSTANDING = '#fe9a00';
const COLOR_CUMULATIVE = '#60a5fa';

type ChartView = 'per-cycle' | 'cumulative';

interface CycleDatum {
  label: string;
  collected: number;   // NGN per cycle
  outstanding: number; // NGN gap to expected
  cumulative: number;  // Running total NGN
}

function buildChartData(cycles: Cycle[], payments: Payment[]): CycleDatum[] {
  // Pre-group by cycleId in a single pass to avoid O(cycles × payments)
  const paymentsByCycle = new Map<number, Payment[]>();
  for (const p of payments) {
    const group = paymentsByCycle.get(p.cycleId) ?? [];
    group.push(p);
    paymentsByCycle.set(p.cycleId, group);
  }

  let running = 0;
  return [...cycles]
    .sort((a, b) => a.cycleNumber - b.cycleNumber)
    .map(cycle => {
      const cyclePayments = paymentsByCycle.get(cycle.id) ?? [];
      const collectedKobo = cyclePayments.reduce((sum, p) => sum + p.amount, 0);
      const collected = collectedKobo / 100;
      const expected = cycle.totalAmount / 100;
      const outstanding = Math.max(0, expected - collected);
      running += collected;
      return { label: `Cycle ${cycle.cycleNumber}`, collected, outstanding, cumulative: running };
    });
}

function fmtTick(v: number): string {
  return `₦${(v / 1000).toFixed(0)}k`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₦{p.value.toLocaleString('en-NG')}
        </p>
      ))}
    </div>
  );
}

const AXIS_PROPS = {
  tick: { fontSize: 10, fill: 'var(--color-muted-foreground)' },
  axisLine: false as const,
  tickLine: false as const,
};

interface CyclePerformanceChartProps {
  cycles: Cycle[];
  payments: Payment[];
}

export function CyclePerformanceChart({ cycles, payments }: CyclePerformanceChartProps) {
  const [view, setView] = useState<ChartView>('per-cycle');
  const data = useMemo(() => buildChartData(cycles, payments), [cycles, payments]);
  const totalCollected = data[data.length - 1]?.cumulative ?? 0;

  const perCycleLabel = `Collection per cycle chart across ${cycles.length} cycles`;
  const cumulativeLabel = `Cumulative pot growth chart: ₦${totalCollected.toLocaleString('en-NG')} total collected`;

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
        <>
          <p className="sr-only">{perCycleLabel}</p>
          <div role="img" aria-label={perCycleLabel}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtTick} width={44} {...AXIS_PROPS} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }} />
                <Bar dataKey="collected" name="Collected" stackId="a" fill={COLOR_PAID} radius={[0, 0, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="outstanding" name="Outstanding" stackId="a" fill={COLOR_OUTSTANDING} fillOpacity={0.55} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLOR_PAID }} />
              Collected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLOR_OUTSTANDING, opacity: 0.55 }} />
              Outstanding
            </span>
          </div>
        </>
      ) : (
        <>
          <p className="sr-only">{cumulativeLabel}</p>
          <div role="img" aria-label={cumulativeLabel}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtTick} width={44} {...AXIS_PROPS} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
                <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke={COLOR_CUMULATIVE} strokeWidth={2} dot={{ r: 4, fill: COLOR_CUMULATIVE, strokeWidth: 0 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLOR_CUMULATIVE }} />
              Cumulative total
            </span>
          </div>
        </>
      )}
    </div>
  );
}
