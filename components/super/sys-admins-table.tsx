import type { SystemAdminRow } from '@/lib/view-models/super';
import { StatusPill } from './status-pill';

export interface SysAdminsTableProps {
  rows: ReadonlyArray<SystemAdminRow>;
}

const GRID =
  'grid grid-cols-[1.6fr_1.4fr_2fr_0.8fr_0.8fr_auto] gap-3.5 px-4 items-center';

/**
 * Desktop super-admin list. "Manage" buttons are visual-only, BE-9
 * will land the per-admin role/status mutation surface (already
 * exposed by `PATCH /api/admin/users/:id` but not wired in this
 * slice; the page lives until then as a read-only roster).
 */
export function SysAdminsTable({ rows }: SysAdminsTableProps) {
  return (
    <div
      className="overflow-hidden rounded-[14px] border bg-card"
      style={{
        borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
      }}
    >
      <div
        role="row"
        className={`${GRID} kicker-mono py-2.5 text-[10px]`}
        style={{
          background: 'color-mix(in oklch, var(--d2-ink) 3%, transparent)',
          borderBottom: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)',
        }}
      >
        <span>Admin</span>
        <span>Phone</span>
        <span>Groups granted</span>
        <span>Last seen</span>
        <span>Status</span>
        <span aria-hidden="true" />
      </div>
      <ul role="rowgroup" className="flex flex-col">
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          return (
            <li
              key={row.userId}
              role="row"
              data-tone={row.active ? 'paid' : 'inactive'}
              className={`${GRID} status-row py-3 text-[13px]`}
              style={{
                borderBottom: isLast
                  ? 'none'
                  : '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12px] font-semibold text-white"
                  style={{
                    background: row.active
                      ? 'var(--d2-coral)'
                      : 'color-mix(in oklch, var(--d2-ink) 18%, transparent)',
                  }}
                >
                  {row.initial}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium">{row.name}</div>
                  <div className="font-mono text-[11px] text-d2-ink/55">{row.email}</div>
                </div>
              </div>
              <span className="truncate font-mono text-[12px] text-d2-ink/70">
                {row.phoneE164}
              </span>
              <div className="flex flex-wrap gap-1">
                {row.grantedGroupNames.length === 0 ? (
                  <span className="text-[12px] italic text-d2-ink/50">no grants</span>
                ) : (
                  row.grantedGroupNames.map((g) => (
                    <StatusPill key={g} tone="muted" mono={false}>
                      {g}
                    </StatusPill>
                  ))
                )}
              </div>
              <span
                className="font-mono text-[12px]"
                style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
              >
                {row.lastSeenLabel}
              </span>
              <StatusPill tone={row.active ? 'paid' : 'muted'}>
                {row.active ? 'active' : 'inactive'}
              </StatusPill>
              {/* TODO(BE-9): wire per-admin manage when the super-admin write surface lands. */}
              <button
                type="button"
                disabled
                title={`Manage ${row.name} (coming soon)`}
                aria-label={`Manage ${row.name} (coming soon)`}
                className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                }}
              >
                Manage
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
