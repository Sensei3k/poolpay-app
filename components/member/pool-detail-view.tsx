import Link from 'next/link';
import { ArrowUp, Check, HandCoins, UserPlus, type LucideIcon } from 'lucide-react';
import type { PoolDetail } from '@/lib/view-models/member';
import { MemberStatusRow } from '@/components/member/member-status-row';

interface ActivityRow {
  id: string;
  icon: LucideIcon;
  title: string;
  when: string;
}

const ACTIVITY_PLACEHOLDER: ReadonlyArray<ActivityRow> = [
  { id: 'a-1', icon: ArrowUp, title: 'You paid this cycle', when: '2 days ago' },
  { id: 'a-2', icon: Check, title: 'Previous cycle closed', when: '3 days ago' },
  { id: 'a-3', icon: HandCoins, title: 'Payout sent to recipient', when: '1 week ago' },
  { id: 'a-4', icon: UserPlus, title: 'Member joined', when: '2 weeks ago' },
];

export interface PoolDetailViewProps {
  detail: PoolDetail;
}

/**
 * Presentational `/pools/:poolId` view. Decoupled from the page's
 * data-fetching so the dev-only preview route can render it against a
 * static fixture.
 */
export function PoolDetailView({ detail }: PoolDetailViewProps) {
  const closedCount = detail.cycleCells.filter((c) => c.state === 'closed').length;

  return (
    <main id="main-content" aria-labelledby="pool-title" className="flex flex-col gap-4">
      {/* Single canonical h1 — always rendered for aria-labelledby="pool-title"; visually hidden on mobile where the gradient hero provides context */}
      <h1 id="pool-title" className="sr-only md:not-sr-only">
        {detail.pool.name}
      </h1>
      <header className="hidden md:block">
        <p className="kicker-mono text-[10px]">Pools / {detail.pool.name}</p>
        <p className="mt-1 text-[1.5rem] font-semibold tracking-tight text-ink">
          {detail.pool.name}
        </p>
        <p className="mt-1 text-[13px] text-ink/55">{detail.metaLine}</p>
      </header>

      {/* Mobile gradient hero */}
      <section
        aria-label="Your payout summary"
        className="rounded-[14px] p-4 text-white md:hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--accent-primary), var(--pool-swatch-teal))',
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
        className="hidden grid-cols-[auto_1fr_auto] items-center gap-6 rounded-[14px] bg-surface-card p-5 md:grid"
        style={{
          border: '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
        }}
      >
        <div>
          <div className="kicker-mono text-[10px]">Your payout</div>
          <div className="mt-0.5 font-mono text-[1.5rem] font-semibold tracking-tight tabular-nums text-ink">
            {detail.cycle.payoutLabel}
          </div>
          <div className="text-[12px] text-ink/55">
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
                      ? 'var(--accent-primary)'
                      : cell.state === 'open'
                        ? 'var(--status-pending)'
                        : 'color-mix(in oklch, var(--ink) 8%, transparent)',
                  border:
                    cell.state === 'open' ? '2px solid var(--ink)' : 'none',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex justify-between font-mono text-[11px] text-ink/55">
            <span>
              {closedCount} closed · cycle {detail.cycle.index} open
            </span>
            <span>cycle {detail.cycle.totalCycles} total</span>
          </div>
        </div>
        <Link
          href={`/pools/${detail.pool.id}/pay`}
          className="rounded-[10px] bg-accent-primary px-4 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          Pay this week
        </Link>
      </section>

      {/* Mobile owe card */}
      <section
        aria-label="You owe this cycle"
        className="rounded-[14px] bg-surface-card p-4 md:hidden"
        style={{
          border: '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-ink/55">You owe this cycle</div>
            <div className="font-mono text-[20px] font-semibold tabular-nums">
              {detail.cycle.contributionLabel}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--status-pending-fg)' }}>
              cycle {detail.cycle.index}
            </div>
          </div>
          <Link
            href={`/pools/${detail.pool.id}/pay`}
            className="rounded-[10px] bg-ink px-4 py-2.5 text-[13px] font-semibold text-surface-page"
          >
            Pay now
          </Link>
        </div>
      </section>

      {/* Members + activity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr]">
        <section
          aria-labelledby="pool-members-title"
          className="rounded-[14px] bg-surface-card"
          style={{
            border: '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
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
          className="rounded-[14px] bg-surface-card p-4"
          style={{
            border: '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
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
                      'color-mix(in oklch, var(--ink) 6%, transparent)',
                  }}
                >
                  <row.icon size={12} aria-hidden="true" />
                </span>
                <span className="flex-1">{row.title}</span>
                <span className="font-mono text-[11px] text-ink/50">
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
