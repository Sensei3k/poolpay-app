import Link from 'next/link';
import { PoolGlyph } from '@/components/admin/pool-glyph';
import type { SystemGroupRow } from '@/lib/view-models/super';
import { StatusPill, type StatusPillTone } from './status-pill';

export interface SysGroupsCardsProps {
  rows: ReadonlyArray<SystemGroupRow>;
}

function waToneFor(status: SystemGroupRow['waStatus']): StatusPillTone {
  if (status === 'linked') return 'paid';
  if (status === 'pending') return 'pending';
  return 'out';
}

/**
 * Tablet card collapse of `<SysGroupsTable>`. Same `<Link>` wrapper as
 * the table so tap targets stay full-row.
 */
export function SysGroupsCards({ rows }: SysGroupsCardsProps) {
  return (
    <ul className="flex flex-col gap-2.5" aria-label="System groups list">
      {rows.map((row) => {
        const isUnassigned = row.adminName === null;
        return (
          <li
            key={row.poolId}
            data-tone={row.tone}
            className="status-row rounded-[14px] border bg-card"
            style={{
              borderColor: 'color-mix(in oklch, var(--d2-ink) 7%, transparent)',
            }}
          >
            <Link
              href={`/sys/groups/${row.poolId}`}
              className="flex flex-col gap-3 p-4 hover:bg-d2-ink/[3%]"
            >
              <div className="flex items-center gap-3">
                <PoolGlyph initial={row.poolInitial} swatch={row.poolSwatch} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{row.poolName}</div>
                  <div className="font-mono text-[11px] text-d2-ink/55">
                    {row.currency} · {row.cyclesLabel} · {row.cadence}
                  </div>
                </div>
                <StatusPill tone={waToneFor(row.waStatus)}>{row.waStatus}</StatusPill>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-[12px]">
                <div>
                  <dt className="font-mono uppercase tracking-wider text-d2-ink/55">Members</dt>
                  <dd className="font-mono">{row.memberCount}</dd>
                </div>
                <div>
                  <dt className="font-mono uppercase tracking-wider text-d2-ink/55">Admin</dt>
                  <dd
                    style={{
                      color: isUnassigned ? 'var(--destructive)' : undefined,
                      fontStyle: isUnassigned ? 'italic' : 'normal',
                    }}
                  >
                    {row.adminName ?? 'unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono uppercase tracking-wider text-d2-ink/55">Pending</dt>
                  <dd className="font-mono">
                    {row.pendingReceiptsCount > 0 ? row.pendingReceiptsCount : '-'}
                  </dd>
                </div>
              </dl>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
