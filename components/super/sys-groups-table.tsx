import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PoolGlyph } from '@/components/admin/pool-glyph';
import type { SystemGroupRow } from '@/lib/view-models/super';
import { StatusPill, type StatusPillTone } from './status-pill';

export interface SysGroupsTableProps {
  rows: ReadonlyArray<SystemGroupRow>;
}

const GRID =
  'grid grid-cols-[1.6fr_0.7fr_0.8fr_0.8fr_1fr_0.9fr_0.8fr_0.7fr_auto] gap-3.5 px-4 items-center';

function waToneFor(status: SystemGroupRow['waStatus']): StatusPillTone {
  if (status === 'linked') return 'paid';
  if (status === 'pending') return 'pending';
  return 'out';
}

function healthBarColor(health: number): string {
  if (health > 85) return 'var(--ajo-paid)';
  if (health > 60) return 'var(--ajo-outstanding)';
  return 'var(--destructive)';
}

/**
 * Desktop system groups table. Health bar reads off the row tone — `out`
 * + `orphan` rows get a destructive bar fill; `pending` rows amber;
 * everything else green. Pending-count column is bold + amber when >2,
 * matching the design source.
 *
 * Slice-4 ships rows as read-only links to the detail page. No bulk
 * mutations (archive / delete) — the detail page houses those.
 */
export function SysGroupsTable({ rows }: SysGroupsTableProps) {
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
        <span>Group</span>
        <span>Members</span>
        <span>Cycles</span>
        <span>Cadence</span>
        <span>Admin</span>
        <span>WhatsApp</span>
        <span>Pending</span>
        <span>Health</span>
        <span aria-hidden="true" />
      </div>
      <ul role="rowgroup" className="flex flex-col">
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const isUnassigned = row.adminName === null;
          return (
            <li
              key={row.poolId}
              role="row"
              data-tone={row.tone}
              className={`${GRID} status-row py-3 text-[13px]`}
              style={{
                borderBottom: isLast
                  ? 'none'
                  : '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              }}
            >
              <Link
                href={`/sys/groups/${row.poolId}`}
                className="flex min-w-0 items-center gap-2.5 hover:underline"
                aria-label={`Open ${row.poolName} detail`}
              >
                <PoolGlyph initial={row.poolInitial} swatch={row.poolSwatch} size="sm" />
                <div className="min-w-0">
                  <div className="truncate font-medium">{row.poolName}</div>
                  <div className="font-mono text-[11px] text-d2-ink/55">{row.currency}</div>
                </div>
              </Link>
              <span className="font-mono text-[12px]">{row.memberCount}</span>
              <span className="font-mono text-[12px]">{row.cyclesLabel}</span>
              <span className="text-[12px] text-d2-ink/70">{row.cadence}</span>
              <span
                className="truncate text-[12px]"
                style={{
                  color: isUnassigned ? 'var(--destructive)' : 'var(--d2-ink)',
                  fontStyle: isUnassigned ? 'italic' : 'normal',
                }}
              >
                {row.adminName ?? 'unassigned'}
              </span>
              <StatusPill tone={waToneFor(row.waStatus)}>{row.waStatus}</StatusPill>
              <span
                className="font-mono text-[12px]"
                style={{
                  fontWeight: row.pendingReceiptsCount > 2 ? 600 : 400,
                  color: row.pendingReceiptsCount > 2
                    ? 'var(--ajo-outstanding-fg)'
                    : row.pendingReceiptsCount > 0
                      ? 'var(--d2-ink)'
                      : 'color-mix(in oklch, var(--d2-ink) 40%, transparent)',
                }}
              >
                {row.pendingReceiptsCount > 0 ? row.pendingReceiptsCount : '—'}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className="relative h-[5px] w-[42px] overflow-hidden rounded-[3px]"
                  style={{
                    background: 'color-mix(in oklch, var(--d2-ink) 8%, transparent)',
                  }}
                  aria-hidden="true"
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-[3px]"
                    style={{ width: `${row.health}%`, background: healthBarColor(row.health) }}
                  />
                </span>
                <span
                  className="font-mono text-[11px]"
                  style={{ color: 'color-mix(in oklch, var(--d2-ink) 60%, transparent)' }}
                >
                  {row.health}
                </span>
              </div>
              <Link
                href={`/sys/groups/${row.poolId}`}
                aria-label={`Open ${row.poolName} detail`}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-d2-ink/10"
              >
                <ChevronRight
                  size={14}
                  aria-hidden="true"
                  style={{ color: 'color-mix(in oklch, var(--d2-ink) 40%, transparent)' }}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
