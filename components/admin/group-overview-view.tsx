import { Check, HandCoins, MessageSquare, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  AdminGroupActivityRow,
  AdminGroupOverview,
} from '@/lib/view-models/admin';

const ACTIVITY_ICONS: Record<AdminGroupActivityRow['icon'], LucideIcon> = {
  Check,
  MessageSquare,
  HandCoins,
  UserPlus,
};

export interface GroupOverviewViewProps {
  overview: AdminGroupOverview;
}

const TIMELINE_TONE: Record<
  'closed' | 'open' | 'upcoming',
  { background: string; color: string; border?: string }
> = {
  closed: {
    background: 'var(--ajo-paid-subtle)',
    color: 'var(--ajo-paid)',
  },
  open: {
    background: 'var(--ajo-outstanding-subtle)',
    color: 'var(--ajo-outstanding-fg)',
    border: '1.5px solid var(--ajo-outstanding)',
  },
  upcoming: {
    background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
    color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
  },
};

/**
 * Overview tab body. Renders the 4-card stat row, the cycles timeline
 * strip, the rotation order line, and the recent-activity log. Slice 3
 * is read-only, slice 5 wires the activity icons to action handlers
 * (re-open cycle, ping member, etc.).
 */
export function GroupOverviewView({ overview }: GroupOverviewViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ul
        aria-label="Group summary"
        className="grid grid-cols-2 gap-2.5 md:grid-cols-4"
      >
        {overview.stats.map((s) => (
          <li
            key={s.kicker}
            className="flex flex-col gap-0.5 rounded-[14px] border bg-d2-cream p-4"
            style={{
              borderColor:
                'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
            }}
          >
            <span className="kicker-mono text-[10px]">{s.kicker}</span>
            <span className="font-mono text-[1.375rem] font-semibold tabular-nums">
              {s.value}
            </span>
            <span className="text-[12px] text-d2-ink/55">{s.detail}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[1.3fr_1fr]">
        <section
          aria-labelledby="overview-timeline-title"
          className="rounded-[14px] border bg-d2-cream p-4 md:p-5"
          style={{
            borderColor:
              'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3
              id="overview-timeline-title"
              className="text-[15px] font-semibold tracking-tight"
            >
              Cycles timeline
            </h3>
            <span className="kicker-mono text-[10px]">
              {overview.timeline.length} total ·{' '}
              {overview.timeline.filter((c) => c.state === 'open').length} open
            </span>
          </div>
          <ol className="flex gap-1" aria-label="Cycle states">
            {overview.timeline.map((cell) => {
              const tone = TIMELINE_TONE[cell.state];
              return (
                <li
                  key={cell.index}
                  aria-label={`Cycle ${cell.index}, ${cell.state}`}
                  className="flex flex-1 items-center justify-center rounded-md font-mono text-[10px]"
                  style={{
                    padding: '6px 0',
                    background: tone.background,
                    color: tone.color,
                    border: tone.border ?? 'none',
                  }}
                >
                  {cell.label}
                </li>
              );
            })}
          </ol>
          {overview.rotationOrder.length > 0 && (
            <p className="mt-3.5 text-[12px] text-d2-ink/60">
              Rotation order:{' '}
              {overview.rotationOrder.map((entry, i) => (
                <span key={`${entry.name}-${i}`}>
                  {i > 0 && ' → '}
                  <span
                    className={
                      entry.isCurrent ? 'font-semibold text-d2-ink' : undefined
                    }
                  >
                    {entry.name}
                  </span>
                </span>
              ))}
            </p>
          )}
        </section>

        <section
          aria-labelledby="overview-activity-title"
          className="rounded-[14px] border bg-d2-cream p-4 md:p-5"
          style={{
            borderColor:
              'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <h3
            id="overview-activity-title"
            className="mb-3 text-[15px] font-semibold tracking-tight"
          >
            Recent activity
          </h3>
          <ul className="flex flex-col">
            {overview.activity.map((row) => {
              const Icon = ACTIVITY_ICONS[row.icon];
              return (
                <li
                  key={row.id}
                  className="flex items-center gap-2.5 py-1.5 text-[13px]"
                >
                  <span
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background:
                        'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                    }}
                  >
                    <Icon size={12} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{row.title}</span>
                  <span className="font-mono text-[11px] text-d2-ink/50">
                    {row.whenLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
