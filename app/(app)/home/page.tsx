import { Clock, HandCoins, TrendingUp } from 'lucide-react';
import { fetchCycles, fetchGroups, fetchMembers, fetchPayments } from '@/lib/data';
import { formatNgn } from '@/lib/utils';
import {
  toHomeAggregates,
  toPoolSummary,
  type PoolSummary,
} from '@/lib/view-models/member';
import { PoolCard } from '@/components/member/pool-card';

export const metadata = {
  title: 'Home · PoolPay',
  description: 'Your savings groups at a glance.',
};

const TODAY_LABEL = (() => {
  // Render once on each request — pages are RSC and re-render naturally.
  // No timezone fixture today; production can swap to user-locale Date later.
  const now = new Date();
  return now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
})();

interface HomeStatCardProps {
  kicker: string;
  icon: 'collected' | 'outstanding' | 'next-payout';
  value: string;
  detail: string;
}

const STAT_ICONS = {
  collected: TrendingUp,
  outstanding: Clock,
  'next-payout': HandCoins,
} as const;

const STAT_TINTS: Record<
  HomeStatCardProps['icon'],
  { background: string; borderColor: string }
> = {
  collected: {
    background:
      'color-mix(in oklch, var(--d2-accent) 8%, var(--d2-cream))',
    borderColor:
      'color-mix(in oklch, var(--d2-accent) 22%, transparent)',
  },
  outstanding: {
    background:
      'color-mix(in oklch, var(--d2-coral) 10%, var(--d2-cream))',
    borderColor:
      'color-mix(in oklch, var(--d2-coral) 22%, transparent)',
  },
  'next-payout': {
    background:
      'color-mix(in oklch, var(--d2-lav) 12%, var(--d2-cream))',
    borderColor:
      'color-mix(in oklch, var(--d2-lav) 22%, transparent)',
  },
};

function HomeStatCard({ kicker, icon, value, detail }: HomeStatCardProps) {
  const Icon = STAT_ICONS[icon];
  return (
    <div
      className="flex flex-col gap-1 rounded-[14px] border p-4"
      style={STAT_TINTS[icon]}
    >
      <span className="kicker-mono flex items-center gap-1.5 text-[10px]">
        <Icon size={12} aria-hidden="true" />
        {kicker}
      </span>
      <span className="font-mono text-[1.625rem] font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      <span className="text-[11px] text-d2-ink/55">{detail}</span>
    </div>
  );
}

export default async function HomePage() {
  const [groupsResult, membersResult, cyclesResult, paymentsResult] = await Promise.all([
    fetchGroups(),
    fetchMembers(),
    fetchCycles(),
    fetchPayments(),
  ]);

  const groups = groupsResult.data;
  const members = membersResult.data;
  const cycles = cyclesResult.data;
  const payments = paymentsResult.data;

  const poolBundles = groups.map((group) => ({
    group,
    members: members.filter((m) => m.groupId === group.id),
    cycles: cycles.filter((c) => c.groupId === group.id),
    payments: payments.filter((p) =>
      cycles.some((c) => c.id === p.cycleId && c.groupId === group.id),
    ),
  }));

  const aggregates = toHomeAggregates({
    pools: poolBundles.map(({ members: m, cycles: c, payments: p }) => ({
      members: m,
      cycles: c,
      payments: p,
    })),
  });

  const poolSummaries: PoolSummary[] = poolBundles.map((b) =>
    toPoolSummary({
      group: b.group,
      members: b.members,
      cycles: b.cycles,
      payments: b.payments,
    }),
  );

  // Estimated next payout = the smallest active-cycle payout (heuristic
  // for slice 2 mock data; real "next due cycle" arrives with the API).
  const nextPayoutKobo = (() => {
    let best = 0;
    for (const { cycles: c } of poolBundles) {
      const active = c.find((cc) => cc.status === 'active');
      if (!active) continue;
      const total =
        active.contributionPerMember *
        Math.max(0, poolBundles[0]?.members.length ?? 0);
      if (best === 0 || total < best) best = total;
    }
    return best;
  })();

  const collectedPctOfExpected =
    aggregates.expectedKobo === 0
      ? 0
      : Math.round((aggregates.collectedKobo / aggregates.expectedKobo) * 100);

  return (
    <main id="main-content" aria-labelledby="home-title" className="flex flex-col gap-6">
      {/* Mobile hero — full-bleed dark ink card */}
      <section
        className="rounded-[14px] bg-d2-ink p-4 text-d2-warm-bg md:hidden"
        aria-label="This month summary"
      >
        <div className="kicker-mono text-[10px] text-d2-warm-bg/70">
          This month · on track
        </div>
        <div className="mt-1 font-mono text-[1.875rem] font-semibold leading-none tracking-tighter tabular-nums">
          {formatNgn(aggregates.expectedKobo)}
        </div>
        <div className="mt-1 text-[12px] text-d2-warm-bg/70">
          across {aggregates.poolCount} pools · {collectedPctOfExpected}% collected
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled
            aria-label="Pay contribution — coming in slice 3"
            title="Coming in slice 3"
            className="flex-1 rounded-[10px] bg-d2-accent py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-90"
          >
            Pay contribution
          </button>
          <button
            type="button"
            disabled
            aria-label="Request — coming in slice 6"
            title="Coming in slice 6"
            className="rounded-[10px] px-3.5 py-2 text-[13px] font-medium text-d2-warm-bg disabled:cursor-not-allowed disabled:opacity-90"
            style={{ background: 'color-mix(in oklch, white 12%, transparent)' }}
          >
            Request
          </button>
        </div>
      </section>

      {/* Desktop hero — plain text */}
      <header className="hidden md:block">
        <p className="kicker-mono text-[11px]">This month</p>
        <h1
          id="home-title"
          className="mt-2 text-[2rem] font-semibold leading-tight tracking-tighter text-d2-ink"
        >
          You{"'"}re on track to collect
          <br />
          <span className="font-mono">{formatNgn(aggregates.expectedKobo)}</span>{' '}
          across {aggregates.poolCount} pools.
        </h1>
        <p className="mt-2 text-[13px] text-d2-ink/55">{TODAY_LABEL}</p>
      </header>

      {/* Mobile-only screen-reader title — desktop uses the H1 above */}
      <h1 className="sr-only md:hidden" id="home-title">
        Home
      </h1>

      {/* Stat cards */}
      <section
        aria-label="Money summary"
        className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3"
      >
        <HomeStatCard
          kicker="Collected"
          icon="collected"
          value={formatNgn(aggregates.collectedKobo)}
          detail={`${collectedPctOfExpected}% of period target`}
        />
        <HomeStatCard
          kicker="Outstanding"
          icon="outstanding"
          value={formatNgn(aggregates.outstandingKobo)}
          detail={`${aggregates.pendingContributionCount} ${
            aggregates.pendingContributionCount === 1
              ? 'contribution'
              : 'contributions'
          } pending`}
        />
        <HomeStatCard
          kicker="Next payout"
          icon="next-payout"
          value={formatNgn(nextPayoutKobo)}
          detail="next active cycle"
        />
      </section>

      {/* Pool grid */}
      <section aria-labelledby="home-pools-title" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2
            id="home-pools-title"
            className="text-[15px] font-semibold tracking-tight text-d2-ink"
          >
            Your pools
          </h2>
          <span className="kicker-mono text-[10px]">
            {poolSummaries.length} {poolSummaries.length === 1 ? 'pool' : 'pools'}
          </span>
        </div>
        {poolSummaries.length === 0 ? (
          <div
            className="rounded-[14px] bg-d2-cream p-6 text-center text-[13px] text-d2-ink/65"
            style={{
              border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
            }}
          >
            You{"'"}re not in any pools yet. An admin will add you when one opens.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
            {poolSummaries.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
