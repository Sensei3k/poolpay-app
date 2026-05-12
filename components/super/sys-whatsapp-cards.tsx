import { PoolGlyph } from '@/components/admin/pool-glyph';
import type { WhatsAppLinkRow } from '@/lib/view-models/super';
import { StatusPill, type StatusPillTone } from './status-pill';

export interface SysWhatsAppCardsProps {
  rows: ReadonlyArray<WhatsAppLinkRow>;
}

function toneFor(status: WhatsAppLinkRow['status']): StatusPillTone {
  if (status === 'healthy') return 'paid';
  if (status === 'drift') return 'drift';
  if (status === 'pending') return 'pending';
  return 'out';
}

function rowTone(status: WhatsAppLinkRow['status']): string {
  if (status === 'healthy') return 'linked';
  return status;
}

export function SysWhatsAppCards({ rows }: SysWhatsAppCardsProps) {
  return (
    <ul className="flex flex-col gap-2.5" aria-label="WhatsApp links list">
      {rows.map((row) => (
        <li
          key={row.poolId}
          data-tone={rowTone(row.status)}
          className="status-row rounded-[14px] border bg-surface-card p-4"
          style={{
            borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <PoolGlyph initial={row.poolInitial} swatch={row.poolSwatch} size="sm" />
              <div className="min-w-0">
                <div className="truncate font-medium">{row.poolName}</div>
                <div className="font-mono text-[11px] text-ink/55">
                  {row.chatName ?? 'not linked'}
                </div>
              </div>
            </div>
            <StatusPill tone={toneFor(row.status)}>{row.status}</StatusPill>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
            <div>
              <dt className="font-mono uppercase tracking-wider text-ink/55">Members</dt>
              <dd className="font-mono">{row.rosterLabel}</dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-wider text-ink/55">Matched</dt>
              <dd
                className="font-mono"
                style={{ color: row.hasDrift ? 'var(--status-pending-fg)' : undefined }}
              >
                {row.matchedLabel ?? '-'}
              </dd>
            </div>
            <div>
              <dt className="font-mono uppercase tracking-wider text-ink/55">Last event</dt>
              <dd className="font-mono">{row.lastEventLabel ?? '-'}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
