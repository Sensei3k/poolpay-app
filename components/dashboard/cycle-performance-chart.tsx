'use client';

import {
  ComposedChart,
  Bar,
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

interface CycleDatum {
  label: string;
  collected: number;   // NGN per cycle
  outstanding: number; // NGN gap to expected
  cumulative: number;  // Running total NGN
}

function buildChartData(cycles: Cycle[], payments: Payment[]): CycleDatum[] {
  let running = 0;
  return [...cycles]
    .sort((a, b) => a.cycleNumber - b.cycleNumber)
    .map(cycle => {
      const cyclePayments = payments.filter(p => p.cycleId === cycle.id);
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

interface CyclePerformanceChartProps {
  cycles: Cycle[];
  payments: Payment[];
}

export function CyclePerformanceChart({ cycles, payments }: CyclePerformanceChartProps) {
  const data = buildChartData(cycles, payments);
  const totalCollected = data[data.length - 1]?.cumulative ?? 0;
  const chartLabel = `Cycle performance chart: ₦${totalCollected.toLocaleString('en-NG')} total collected across ${cycles.length} cycles`;

  return (
    <div className="px-4 py-3">
      <p className="sr-only">{chartLabel}</p>
      <div role="img" aria-label={chartLabel}>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 8, right: 52, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.4} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="cycle"
              orientation="left"
              tickFormatter={fmtTick}
              tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <YAxis
              yAxisId="cumulative"
              orientation="right"
              tickFormatter={fmtTick}
              tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
            />
            <Bar
              yAxisId="cycle"
              dataKey="collected"
              name="Collected"
              stackId="a"
              fill={COLOR_PAID}
              radius={[0, 0, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              yAxisId="cycle"
              dataKey="outstanding"
              name="Outstanding"
              stackId="a"
              fill={COLOR_OUTSTANDING}
              fillOpacity={0.55}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Line
              yAxisId="cumulative"
              type="monotone"
              dataKey="cumulative"
              name="Cumulative"
              stroke={COLOR_CUMULATIVE}
              strokeWidth={2}
              dot={{ r: 4, fill: COLOR_CUMULATIVE, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground" aria-hidden="true">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLOR_PAID }} />
          Collected
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ background: COLOR_OUTSTANDING, opacity: 0.55 }}
          />
          Outstanding
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLOR_CUMULATIVE }} />
          Cumulative
        </span>
      </div>
    </div>
  );
}
