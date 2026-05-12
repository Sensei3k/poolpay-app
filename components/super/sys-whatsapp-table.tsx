import { PoolGlyph } from '@/components/admin/pool-glyph';
import type { WhatsAppLinkRow } from '@/lib/view-models/super';
import { StatusPill, type StatusPillTone } from './status-pill';

export interface SysWhatsAppTableProps {
  rows: ReadonlyArray<WhatsAppLinkRow>;
}

const GRID =
  'grid grid-cols-[1.5fr_1.5fr_1.2fr_0.8fr_0.9fr_0.9fr_0.9fr_auto] gap-3.5 px-4 items-center';

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

function actionLabel(status: WhatsAppLinkRow['status']): string {
  if (status === 'unlinked') return 'Link';
  if (status === 'pending') return 'Resend code';
  return 'Manage';
}

export function SysWhatsAppTable({ rows }: SysWhatsAppTableProps) {
  return (
    <div
      className="overflow-hidden rounded-[14px] border bg-d2-cream"
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
        <span>PoolPay group</span>
        <span>WhatsApp chat</span>
        <span>wa_group_id</span>
        <span>Members</span>
        <span>Phone matched</span>
        <span>Last event</span>
        <span>Status</span>
        <span aria-hidden="true" />
      </div>
      <ul role="rowgroup" className="flex flex-col">
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const isUnlinked = row.chatName === null;
          const needsLink = row.status === 'unlinked' || row.status === 'pending';
          return (
            <li
              key={row.poolId}
              role="row"
              data-tone={rowTone(row.status)}
              className={`${GRID} status-row py-3 text-[13px]`}
              style={{
                borderBottom: isLast
                  ? 'none'
                  : '1px solid color-mix(in oklch, var(--d2-ink) 6%, transparent)',
              }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <PoolGlyph initial={row.poolInitial} swatch={row.poolSwatch} />
                <span className="truncate font-medium">{row.poolName}</span>
              </div>
              <span
                className="truncate text-[13px]"
                style={{
                  color: isUnlinked
                    ? 'color-mix(in oklch, var(--d2-ink) 40%, transparent)'
                    : 'var(--d2-ink)',
                  fontStyle: isUnlinked ? 'italic' : 'normal',
                }}
              >
                {row.chatName ?? 'not linked'}
              </span>
              <span
                className="truncate font-mono text-[12px]"
                style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
              >
                {row.waGroupIdLabel ?? '-'}
              </span>
              <span className="font-mono text-[12px]">{row.rosterLabel}</span>
              <span
                className="font-mono text-[12px]"
                style={{
                  color: row.hasDrift
                    ? 'var(--ajo-outstanding-fg)'
                    : 'color-mix(in oklch, var(--d2-ink) 70%, transparent)',
                }}
              >
                {row.matchedLabel ?? '-'}
              </span>
              <span
                className="font-mono text-[12px]"
                style={{ color: 'color-mix(in oklch, var(--d2-ink) 55%, transparent)' }}
              >
                {row.lastEventLabel ?? '-'}
              </span>
              <StatusPill tone={toneFor(row.status)}>{row.status}</StatusPill>
              {/* TODO(slice 5): wire the WhatsApp link manager (ingestion). */}
              <button
                type="button"
                disabled
                title={`${actionLabel(row.status)} ${row.poolName} (coming soon)`}
                aria-label={`${actionLabel(row.status)} ${row.poolName} (coming soon)`}
                className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: needsLink
                    ? 'var(--d2-ink)'
                    : 'color-mix(in oklch, var(--d2-ink) 6%, transparent)',
                  color: needsLink ? 'var(--d2-warm-bg)' : 'var(--d2-ink)',
                }}
              >
                {actionLabel(row.status)}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
