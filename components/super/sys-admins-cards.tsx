import type { SystemAdminRow } from '@/lib/view-models/super';
import { StatusPill } from './status-pill';

export interface SysAdminsCardsProps {
  rows: ReadonlyArray<SystemAdminRow>;
}

/**
 * Tablet card collapse of `<SysAdminsTable>` for the 768..1023px band.
 */
export function SysAdminsCards({ rows }: SysAdminsCardsProps) {
  return (
    <ul className="flex flex-col gap-2.5" aria-label="System admins list">
      {rows.map((row) => (
        <li
          key={row.userId}
          data-tone={row.active ? 'paid' : 'inactive'}
          className="status-row rounded-[14px] border bg-surface-card p-4"
          style={{
            borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px] font-semibold text-white"
              style={{
                background: row.active
                  ? 'var(--accent-coral)'
                  : 'color-mix(in oklch, var(--ink) 18%, transparent)',
              }}
            >
              {row.initial}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold">{row.name}</span>
                <StatusPill tone={row.active ? 'paid' : 'muted'}>
                  {row.active ? 'active' : 'inactive'}
                </StatusPill>
              </div>
              <div className="font-mono text-[11px] text-ink/55">{row.email}</div>
              <div className="mt-1 font-mono text-[12px]">{row.phoneE164}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {row.grantedGroupNames.length === 0 ? (
                  <span className="text-[12px] italic text-ink/50">no grants</span>
                ) : (
                  row.grantedGroupNames.map((g) => (
                    <StatusPill key={g} tone="muted" mono={false}>
                      {g}
                    </StatusPill>
                  ))
                )}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
