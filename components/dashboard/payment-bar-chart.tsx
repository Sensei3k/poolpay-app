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

const COLOR_PAID = 'oklch(0.696 0.17 162.48)';
const COLOR_OUTSTANDING = 'oklch(0.769 0.188 70.08)';

interface ChartDatum {
  name: string;
  amount: number;
  hasPaid: boolean;
}

function buildChartData(
  statuses: MemberPaymentStatus[],
  contributionKobo: number,
): ChartDatum[] {
  return statuses.map(s => ({
    name: s.member.name.split(' ')[0], // first name keeps bars readable
    amount: contributionKobo / 100,    // display in NGN, not kobo
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
  const { hasPaid } = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className={hasPaid ? 'text-ajo-paid' : 'text-ajo-outstanding'}>
        {hasPaid ? 'Paid' : 'Outstanding'} — ₦{payload[0].value.toLocaleString('en-NG')}
      </p>
    </div>
  );
}

export function PaymentBarChart({ statuses, contributionKobo }: PaymentBarChartProps) {
  const data = buildChartData(statuses, contributionKobo);
  const barHeight = 36;
  const chartHeight = Math.max(data.length * barHeight, 120);

  return (
    <div className="px-4 py-3">
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
            width={72}
            tick={{ fontSize: 11, fill: 'var(--color-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.hasPaid ? COLOR_PAID : COLOR_OUTSTANDING}
                fillOpacity={entry.hasPaid ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLOR_PAID }} />
          Paid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: COLOR_OUTSTANDING, opacity: 0.6 }} />
          Outstanding
        </span>
      </div>
    </div>
  );
}
