import { PoolGlyph } from '@/components/admin/pool-glyph';
import type { SystemGroupDetail } from '@/lib/view-models/super';
import { SuperChip } from './super-chip';
import { StatusPill } from './status-pill';

export interface SysGroupDetailViewProps {
  detail: SystemGroupDetail;
}

/**
 * Page body for `/sys/groups/[poolId]`. The system view exposes a
 * group's metadata, current admin + WhatsApp assignments, and a
 * read-only audit trail. Destructive actions (Archive / Delete) are
 * rendered as visual placeholders, the BE has no super-admin
 * destructive surface yet (slice-4 deviation #2).
 */
export function SysGroupDetailView({ detail }: SysGroupDetailViewProps) {
  return (
    <main
      id="main-content"
      aria-labelledby="sys-group-detail-title"
      className="flex flex-col gap-3.5"
    >
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <PoolGlyph initial={detail.poolInitial} swatch={detail.poolSwatch} size="md" />
          <div>
            <h1
              id="sys-group-detail-title"
              className="text-[1.5rem] font-semibold tracking-tight text-ink"
            >
              {detail.poolName}
            </h1>
            <p className="font-mono text-[12px] text-ink/55">{detail.subLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SuperChip>system view</SuperChip>
          {/* TODO(BE-9): wire scoped open-as-admin impersonation. */}
          <button
            type="button"
            disabled
            title="Open as admin (coming soon)"
            aria-label="Open as admin (coming soon)"
            className="rounded-[10px] px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              background: 'color-mix(in oklch, var(--ink) 6%, transparent)',
            }}
          >
            Open as admin
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        {/* Group record */}
        <section
          aria-labelledby="sys-group-record"
          className="flex flex-col gap-2.5 rounded-[14px] border bg-surface-card p-5"
          style={{
            borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <h2
            id="sys-group-record"
            className="kicker-mono mb-1 text-[10px]"
          >
            Group record
          </h2>
          <dl className="flex flex-col">
            {detail.record.map((row, i) => (
              <div
                key={row.kicker}
                className="grid grid-cols-[140px_1fr] items-center gap-3 py-2 text-[13px]"
                style={
                  i > 0
                    ? {
                        borderTop:
                          '1px solid color-mix(in oklch, var(--ink) 5%, transparent)',
                      }
                    : undefined
                }
              >
                <dt
                  className="font-mono text-[12px]"
                  style={{ color: 'color-mix(in oklch, var(--ink) 55%, transparent)' }}
                >
                  {row.kicker}
                </dt>
                <dd
                  className={row.mono ? 'font-mono text-[12px]' : 'text-[13px]'}
                >
                  {row.kicker === 'Status' ? (
                    <StatusPill tone="paid">{row.value}</StatusPill>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Assignments + Danger */}
        <section
          aria-label="Group assignments"
          className="flex flex-col gap-2.5 rounded-[14px] border bg-surface-card p-5"
          style={{
            borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <h2 className="kicker-mono mb-1 text-[10px]">Assignments</h2>
          {/* Admin on duty */}
          <div
            className="rounded-[10px] border bg-surface-page p-3"
            style={{
              borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
            }}
          >
            <div className="kicker-mono mb-1 text-[11px]">Admin on duty</div>
            {detail.admin ? (
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full text-[13px] font-semibold text-white"
                  style={{ background: 'var(--accent-coral)' }}
                >
                  {detail.admin.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{detail.admin.name}</div>
                  <div className="font-mono text-[11px] text-ink/55">
                    {detail.admin.email} · {detail.admin.groupCount}{' '}
                    {detail.admin.groupCount === 1 ? 'group' : 'groups'}
                  </div>
                </div>
                {/* TODO(BE-9): wire super-admin admin reassign. */}
                <button
                  type="button"
                  disabled
                  title="Reassign (coming soon)"
                  aria-label="Reassign admin (coming soon)"
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: 'color-mix(in oklch, var(--ink) 6%, transparent)',
                  }}
                >
                  Reassign
                </button>
              </div>
            ) : (
              <p className="text-[13px] text-destructive">
                No admin assigned. This pool is in an orphan state.
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div
            className="rounded-[10px] border bg-surface-page p-3"
            style={{
              borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
            }}
          >
            <div className="kicker-mono mb-1 text-[11px]">WhatsApp</div>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background: detail.whatsapp.linked
                    ? 'var(--status-paid)'
                    : 'var(--destructive)',
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {detail.whatsapp.linked
                    ? `Linked · ${detail.whatsapp.chatName ?? detail.poolName}`
                    : 'Unlinked · WhatsApp bot not paired'}
                </div>
                <div className="font-mono text-[11px] text-ink/55">
                  {detail.whatsapp.linked
                    ? `wa_group_id · ${detail.whatsapp.waGroupId} · bot ${detail.whatsapp.botActive ? 'active' : 'idle'}`
                    : 'add the bot to a WhatsApp chat to pair'}
                </div>
              </div>
              {/* TODO(slice 5): wire WhatsApp link/unlink. */}
              <button
                type="button"
                disabled
                title={detail.whatsapp.linked ? 'Unlink WhatsApp (coming soon)' : 'Link WhatsApp (coming soon)'}
                aria-label={detail.whatsapp.linked ? 'Unlink WhatsApp (coming soon)' : 'Link WhatsApp (coming soon)'}
                className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'color-mix(in oklch, var(--ink) 6%, transparent)',
                }}
              >
                {detail.whatsapp.linked ? 'Unlink' : 'Link'}
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div
            className="mt-2 rounded-[10px] border p-3"
            style={{
              background: 'color-mix(in oklch, var(--destructive) 8%, transparent)',
              borderColor: 'color-mix(in oklch, var(--destructive) 25%, transparent)',
            }}
          >
            <div
              className="kicker-mono mb-1 text-[11px]"
              style={{ color: 'var(--destructive)' }}
            >
              Danger
            </div>
            {/* TODO(BE-9): wire the super-admin destructive surface (archive + delete). */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled
                title="Archive group (coming soon)"
                aria-label="Archive group (coming soon)"
                className="rounded-lg border bg-transparent px-2.5 py-1.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  color: 'var(--destructive)',
                  borderColor:
                    'color-mix(in oklch, var(--destructive) 30%, transparent)',
                }}
              >
                Archive group
              </button>
              <button
                type="button"
                disabled
                title="Delete group (coming soon)"
                aria-label="Delete group (coming soon)"
                className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: 'var(--destructive)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Audit trail */}
      <section
        aria-labelledby="sys-group-audit"
        className="rounded-[14px] border bg-surface-card p-4"
        style={{
          borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
        }}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2
            id="sys-group-audit"
            className="text-[15px] font-semibold"
          >
            Audit trail · group events
          </h2>
          <span className="kicker-mono text-[10px]">
            last {detail.audit.length} · all events in Activity
          </span>
        </div>
        <ul className="flex flex-col">
          {detail.audit.map((row, i) => (
            <li
              key={row.id}
              className="grid grid-cols-[60px_100px_1fr] gap-3 py-2 text-[13px]"
              style={
                i > 0
                  ? {
                      borderTop:
                        '1px solid color-mix(in oklch, var(--ink) 5%, transparent)',
                    }
                  : undefined
              }
            >
              <span
                className="font-mono text-[11px]"
                style={{ color: 'color-mix(in oklch, var(--ink) 50%, transparent)' }}
              >
                {row.whenLabel}
              </span>
              <span
                className="font-mono text-[12px]"
                style={{
                  color: row.isMachine ? 'var(--accent-violet)' : 'var(--ink)',
                }}
              >
                {row.who}
              </span>
              <span style={{ color: 'color-mix(in oklch, var(--ink) 75%, transparent)' }}>
                {row.action}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
