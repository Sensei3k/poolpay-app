import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUp, Check, HandCoins, UserPlus } from 'lucide-react';
import {
  fetchCycles,
  fetchGroups,
  fetchMembers,
  fetchPayments,
} from '@/lib/data';
import { toPoolDetail } from '@/lib/view-models/member';
import { MemberStatusRow } from '@/components/member/member-status-row';

interface PoolDetailPageProps {
  params: Promise<{ poolId: string }>;
}

const ACTIVITY_PLACEHOLDER = [
  { id: 'a-1', icon: ArrowUp, title: 'You paid this cycle', when: '2 days ago' },
  { id: 'a-2', icon: Check, title: 'Previous cycle closed', when: '3 days ago' },
  { id: 'a-3', icon: HandCoins, title: 'Payout sent to recipient', when: '1 week ago' },
  { id: 'a-4', icon: UserPlus, title: 'Member joined', when: '2 weeks ago' },
] as const;

export default async function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { poolId } = await params;

  const [groupsResult, membersResult, cyclesResult, paymentsResult] = await Promise.all([
    fetchGroups(),
    fetchMembers(poolId),
    fetchCycles(poolId),
    fetchPayments(poolId),
  ]);

  const group = groupsResult.data.find((g) => g.id === poolId);
  if (!group) {
    notFound();
  }

  const members = membersResult.data;
  const cycles = cyclesResult.data;
  const payments = paymentsResult.data;

  const activeCycle = cycles.find((c) => c.status === 'active');
  if (!activeCycle) {
    return (
      <main
        id="main-content"
        className="flex flex-col gap-3"
        aria-labelledby="pool-empty-title"
      >
        <h1
          id="pool-empty-title"
          className="text-[1.5rem] font-semibold tracking-tight text-d2-ink"
        >
          {group.name}
        </h1>
        <p className="text-[13px] text-d2-ink/55">
          This pool has no active cycle. An admin will start the next cycle when
          ready.
        </p>
        <Link
          href="/home"
          className="text-[13px] font-medium text-d2-accent"
        >
          Back to home
        </Link>
      </main>
    );
  }

  const detail = toPoolDetail({ group, members, cycles, payments });
  const closedCount = detail.cycleCells.filter((c) => c.state === 'closed').length;

  return (
    <main id="main-content" aria-labelledby="pool-title" className="flex flex-col gap-4">
      {/* Page heading — desktop renders title here, mobile relies on the app bar */}
      <header className="hidden md:block">
        <p className="kicker-mono text-[10px]">Pools / {group.name}</p>
        <h1
          id="pool-title"
          className="mt-1 text-[1.5rem] font-semibold tracking-tight text-d2-ink"
        >
          {group.name}
        </h1>
        <p className="mt-1 text-[13px] text-d2-ink/55">{detail.metaLine}</p>
      </header>
      <h1 id="pool-title" className="sr-only md:hidden">
        {group.name}
      </h1>

      {/* Cycle hero — gradient card on mobile, flat card on desktop */}
      <section
        aria-label="Your payout summary"
        className="rounded-[14px] p-4 text-white md:hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--d2-accent), oklch(0.55 0.14 190))',
        }}
      >
        <div className="kicker-mono text-[10px] text-white/85">
          Your payout · cycle {detail.cycle.index}
        </div>
        <div className="mt-1 font-mono text-[1.75rem] font-semibold leading-none tracking-tighter tabular-nums">
          {detail.cycle.payoutLabel}
        </div>
        <div className="mt-1 text-[12px] text-white/80">
          {detail.members.length} members · cycle {detail.cycle.index} of{' '}
          {detail.cycle.totalCycles}
        </div>
        <div className="mt-3 flex gap-0.5">
          {detail.cycleCells.map((cell) => (
            <div
              key={cell.index}
              className="h-4 flex-1 rounded-sm"
              style={{
                background:
                  cell.state === 'closed'
                    ? 'color-mix(in oklch, white 95%, transparent)'
                    : cell.state === 'open'
                      ? 'color-mix(in oklch, white 55%, transparent)'
                      : 'color-mix(in oklch, white 18%, transparent)',
                border: cell.state === 'open' ? '1.5px solid white' : 'none',
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-white/85">
          <span>
            {closedCount} closed · cycle {detail.cycle.index} open
          </span>
          <span>cycle {detail.cycle.totalCycles}</span>
        </div>
      </section>

      {/* Desktop summary card */}
      <section
        aria-label="Cycle progress"
        className="hidden grid-cols-[auto_1fr_auto] items-center gap-6 rounded-[14px] bg-d2-cream p-5 md:grid"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <div>
          <div className="kicker-mono text-[10px]">Your payout</div>
          <div className="mt-0.5 font-mono text-[1.5rem] font-semibold tracking-tight tabular-nums text-d2-ink">
            {detail.cycle.payoutLabel}
          </div>
          <div className="text-[12px] text-d2-ink/55">
            recipient · {detail.cycle.recipient.name}
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex gap-0.5">
            {detail.cycleCells.map((cell) => (
              <div
                key={cell.index}
                className="h-6 flex-1 rounded-sm"
                style={{
                  background:
                    cell.state === 'closed'
                      ? 'var(--d2-accent)'
                      : cell.state === 'open'
                        ? 'var(--ajo-outstanding)'
                        : 'color-mix(in oklch, var(--d2-ink) 8%, transparent)',
                  border:
                    cell.state === 'open' ? '2px solid var(--d2-ink)' : 'none',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex justify-between font-mono text-[11px] text-d2-ink/55">
            <span>
              {closedCount} closed · cycle {detail.cycle.index} open
            </span>
            <span>cycle {detail.cycle.totalCycles} total</span>
          </div>
        </div>
        <Link
          href={`/pools/${detail.pool.id}/pay`}
          className="rounded-[10px] bg-d2-accent px-4 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Pay this week
        </Link>
      </section>

      {/* Mobile owe card */}
      <section
        aria-label="You owe this cycle"
        className="rounded-[14px] bg-d2-cream p-4 md:hidden"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-d2-ink/55">You owe this cycle</div>
            <div className="font-mono text-[20px] font-semibold tabular-nums">
              {detail.cycle.contributionLabel}
            </div>
            <div className="text-[11px]" style={{ color: 'oklch(0.5 0.14 70)' }}>
              cycle {detail.cycle.index}
            </div>
          </div>
          <Link
            href={`/pools/${detail.pool.id}/pay`}
            className="rounded-[10px] bg-d2-ink px-4 py-2.5 text-[13px] font-semibold text-d2-warm-bg"
          >
            Pay now
          </Link>
        </div>
      </section>

      {/* Members + activity grid (desktop). Stacks on mobile. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr]">
        <section
          aria-labelledby="pool-members-title"
          className="rounded-[14px] bg-d2-cream"
          style={{
            border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <h2
              id="pool-members-title"
              className="text-[15px] font-semibold tracking-tight"
            >
              Members · this cycle
            </h2>
            <span className="kicker-mono text-[10px]">
              {detail.counts.paid} paid · {detail.counts.pending} pending ·{' '}
              {detail.counts.outstanding} outstanding
            </span>
          </div>
          <div className="px-1 pb-1">
            {detail.members.map((row, i, arr) => (
              <MemberStatusRow
                key={row.member.id}
                row={row}
                isLast={i === arr.length - 1}
              />
            ))}
          </div>
        </section>

        <section
          aria-labelledby="pool-activity-title"
          className="rounded-[14px] bg-d2-cream p-4"
          style={{
            border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <h2
            id="pool-activity-title"
            className="mb-2 text-[15px] font-semibold tracking-tight"
          >
            Recent activity
          </h2>
          <ul className="flex flex-col">
            {ACTIVITY_PLACEHOLDER.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-2 py-1.5 text-[13px]"
              >
                <span
                  className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md"
                  style={{
                    background:
                      'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                  }}
                >
                  <row.icon size={12} aria-hidden="true" />
                </span>
                <span className="flex-1">{row.title}</span>
                <span className="font-mono text-[11px] text-d2-ink/50">
                  {row.when}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
