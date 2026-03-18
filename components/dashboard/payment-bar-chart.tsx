'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { MemberPaymentStatus } from '@/lib/types';

interface PaymentBarChartProps {
  statuses: MemberPaymentStatus[];
  contributionKobo: number;
}

// Hex equivalents of --color-ajo-paid / --color-ajo-outstanding.
// SVG fill attributes don't support oklch, so we resolve to hex here.
const COLOR_PAID = '#00bc7d';
const COLOR_OUTSTANDING = '#fe9a00';

interface ChartDatum {
  name: string;
  fullName: string;
  amount: number;
  hasPaid: boolean;
}

// "Chukwuemeka Eze" → "Chukwueme… E." — first name + last initial.
// Total label capped at 13 chars so it never wraps in the SVG Y-axis.
function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 13);
  const lastInitial = ` ${parts[parts.length - 1][0]}.`;
  const maxFirst = 13 - lastInitial.length; // 10 chars for first name
  const first = parts[0].length > maxFirst
    ? parts[0].slice(0, maxFirst - 1) + '…'
    : parts[0];
  return `${first}${lastInitial}`;
}

function buildChartData(
  statuses: MemberPaymentStatus[],
  contributionKobo: number,
): ChartDatum[] {
  return statuses.map(s => ({
    name: shortName(s.member.name),
    fullName: s.member.name,
    amount: contributionKobo / 100,
    hasPaid: s.hasPaid,
  }));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: ChartDatum }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const { hasPaid, fullName } = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{fullName}</p>
      <p style={{ color: hasPaid ? COLOR_PAID : COLOR_OUTSTANDING }}>
        {hasPaid ? 'Paid' : 'Outstanding'} — ₦{payload[0].value.toLocaleString('en-NG')}
      </p>
    </div>
  );
}

export function PaymentBarChart({ statuses, contributionKobo }: PaymentBarChartProps) {
  const data = buildChartData(statuses, contributionKobo);
  const paidCount = statuses.filter(s => s.hasPaid).length;
  const barHeight = 36;
  const chartHeight = Math.max(data.length * barHeight, 120);
  const chartLabel = `Payment status bar chart: ${paidCount} of ${statuses.length} members paid, ${statuses.length - paidCount} outstanding`;

  return (
    <div className="px-4 py-3">
      {/* Visually hidden summary for screen readers */}
      <p className="sr-only">{chartLabel}</p>
      <div role="img" aria-label={chartLabel}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            domain={[0, contributionKobo / 100]}
            tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 11, fill: 'var(--color-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.hasPaid ? COLOR_PAID : COLOR_OUTSTANDING}
                fillOpacity={entry.hasPaid ? 1 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground" aria-hidden="true">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLOR_PAID }} />
          Paid
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ background: COLOR_OUTSTANDING, opacity: 0.55 }}
          />
          Outstanding
        </span>
      </div>
    </div>
  );
}
