import { MoreHorizontal, Plus } from 'lucide-react';
import type { AdminMemberRow } from '@/lib/view-models/admin';

export interface GroupMembersViewProps {
  rows: ReadonlyArray<AdminMemberRow>;
}

const PILL_STYLE: Record<
  AdminMemberRow['pillLabel'],
  { background: string; color: string; label: string }
> = {
  current: {
    background: 'var(--status-paid-subtle)',
    color: 'var(--status-paid)',
    label: 'current',
  },
  pending: {
    background: 'var(--status-pending-subtle)',
    color: 'var(--status-pending-fg)',
    label: 'pending',
  },
  out: {
    background: 'color-mix(in oklch, var(--destructive) 12%, transparent)',
    color: 'var(--destructive)',
    label: 'out',
  },
};

/**
 * Members tab body. Desktop-only view (mobile renders the read-only
 * prompt instead, wiring lives in the parent group view). Lists the
 * roster with paid/missed counts, due balance, and rotation position.
 *
 * Add-member + per-row menu actions land in slice 5.
 */
export function GroupMembersView({ rows }: GroupMembersViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            Members · {rows.length}
          </h3>
          <p className="text-[12px] text-ink/55">
            Rotation order determines payout week
          </p>
        </div>
        {/* TODO(slice-5): wire inviteMemberAction here */}
        <button
          type="button"
          disabled
          aria-label="Invite member (coming soon)"
          title="Coming soon"
          className="inline-flex items-center gap-1.5 self-start rounded-[10px] bg-ink px-3 py-1.5 text-[13px] font-medium text-surface-page disabled:cursor-not-allowed disabled:opacity-70 sm:self-auto"
        >
          <Plus size={13} aria-hidden="true" />
          Invite member
        </button>
      </div>
      <div
        className="overflow-hidden rounded-[14px] border"
        style={{
          borderColor:
            'color-mix(in oklch, var(--ink) 7%, transparent)',
        }}
      >
        <div
          role="row"
          className="kicker-mono grid grid-cols-[24px_1.6fr_1.3fr_0.6fr_1.1fr_0.8fr_auto] items-center gap-3.5 px-4 py-2.5 text-[10px]"
          style={{
            background: 'color-mix(in oklch, var(--ink) 3%, transparent)',
            borderBottom:
              '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <span>#</span>
          <span>Member</span>
          <span>Phone · joined</span>
          <span>Paid</span>
          <span>Due</span>
          <span>Status</span>
          <span aria-hidden="true" />
        </div>
        <ul>
          {rows.map((row, i) => {
            const isLast = i === rows.length - 1;
            const pill = PILL_STYLE[row.pillLabel];
            return (
              <li
                key={row.member.id}
                data-tone={row.tone === 'ok' ? undefined : row.tone}
                className="grid grid-cols-[24px_1.6fr_1.3fr_0.6fr_1.1fr_0.8fr_auto] items-center gap-3.5 px-4 py-3 text-[13px]"
                style={{
                  borderBottom: isLast
                    ? 'none'
                    : '1px solid color-mix(in oklch, var(--ink) 6%, transparent)',
                }}
              >
                <span className="font-mono text-ink/55">
                  {row.member.position}
                </span>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                    style={{ background: 'var(--accent-coral)' }}
                  >
                    {row.member.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate font-medium">
                    {row.member.name}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-mono text-[12px]">
                    {row.member.phone}
                  </div>
                  <div className="text-[11px] text-ink/55">
                    joined {row.joinedLabel}
                  </div>
                </div>
                <span className="font-mono text-[12px]">
                  {row.paidLabel}
                  {row.missedCount > 0 && (
                    <span
                      className="ml-1"
                      style={{ color: 'var(--destructive)' }}
                    >
                      · {row.missedCount} miss
                    </span>
                  )}
                </span>
                <span
                  className="font-mono text-[12px]"
                  style={{
                    fontWeight: row.tone === 'out' ? 600 : 400,
                    color:
                      row.tone === 'out'
                        ? 'var(--destructive)'
                        : 'color-mix(in oklch, var(--ink) 60%, transparent)',
                  }}
                >
                  {row.dueLabel}
                </span>
                <span
                  className="font-mono text-[10px] font-medium"
                  style={{
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: pill.background,
                    color: pill.color,
                  }}
                >
                  {pill.label}
                </span>
                <button
                  type="button"
                  disabled
                  aria-label={`Open actions for ${row.member.name} (coming soon)`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-ink/55 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <MoreHorizontal size={14} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
