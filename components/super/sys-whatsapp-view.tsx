import { MessageSquare, RefreshCw } from 'lucide-react';
import type {
  WhatsAppBotStats,
  WhatsAppLinkRow,
  WhatsAppLinksAggregates,
} from '@/lib/view-models/super';
import { StatusPill } from './status-pill';
import { SuperChip } from './super-chip';
import { SysWhatsAppCards } from './sys-whatsapp-cards';
import { SysWhatsAppTable } from './sys-whatsapp-table';

export interface SysWhatsAppViewProps {
  rows: ReadonlyArray<WhatsAppLinkRow>;
  aggregates: WhatsAppLinksAggregates;
  bot: WhatsAppBotStats;
}

/**
 * Page body for `/sys/whatsapp`. Pairs the bot status card with the
 * per-pool link table. Everything renders read-only this slice, the
 * link/unlink mutations land in slice 5 (WhatsApp ingestion).
 */
export function SysWhatsAppView({ rows, aggregates, bot }: SysWhatsAppViewProps) {
  const subLine = `${aggregates.total} groups · ${aggregates.linked} linked · ${aggregates.pending} pending · ${aggregates.unlinked} unlinked · bot ${bot.online ? 'online' : 'offline'}`;

  return (
    <main
      id="main-content"
      aria-labelledby="sys-whatsapp-title"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              id="sys-whatsapp-title"
              className="text-[1.5rem] font-semibold tracking-tight text-ink"
            >
              WhatsApp links
            </h1>
            <SuperChip>plumbing</SuperChip>
          </div>
          <p className="text-[13px] text-ink/55">{subLine}</p>
        </div>
        {/* TODO(slice 5): wire WhatsApp member re-scan. */}
        <button
          type="button"
          disabled
          title="Re-scan members (coming soon)"
          aria-label="Re-scan WhatsApp members (coming soon)"
          className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: 'color-mix(in oklch, var(--ink) 6%, transparent)',
          }}
        >
          <RefreshCw size={13} aria-hidden="true" />
          Re-scan members
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.6fr_1fr]">
        <section
          aria-labelledby="sys-bot-status"
          className="rounded-[14px] border bg-surface-card p-4"
          style={{
            borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <div className="mb-2.5 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg text-white"
              style={{ background: 'var(--accent-whatsapp)' }}
            >
              <MessageSquare size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="sys-bot-status" className="text-[15px] font-semibold">
                PoolPay bot
              </h2>
              <p className="text-[12px] text-ink/55">
                {bot.botPhone} · {aggregates.linked} group chats · last event{' '}
                {rows[0]?.lastEventLabel ?? '-'}
              </p>
            </div>
            <StatusPill tone={bot.online ? 'paid' : 'out'}>
              {bot.online ? 'online' : 'offline'}
            </StatusPill>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { k: 'Ingested · 7d', v: String(bot.ingested7d) },
              { k: 'Matched by phone', v: bot.matchedRateLabel },
              { k: 'Needs admin', v: String(bot.needsAdmin) },
              { k: 'Avg ack time', v: bot.avgAckLabel },
            ].map((s) => (
              <div key={s.k} className="rounded-lg bg-surface-card px-2.5 py-2">
                <div
                  className="font-mono text-[10px] uppercase tracking-[0.06em]"
                  style={{ color: 'color-mix(in oklch, var(--ink) 55%, transparent)' }}
                >
                  {s.k}
                </div>
                <div className="font-mono text-base font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="sys-bot-how"
          className="rounded-[14px] border bg-surface-card p-4"
          style={{
            borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <h2 id="sys-bot-how" className="kicker-mono mb-2 text-[10px]">
            How the link is made
          </h2>
          <ol
            className="ml-4 list-decimal space-y-1 text-[13px]"
            style={{ color: 'color-mix(in oklch, var(--ink) 75%, transparent)' }}
          >
            <li>
              Super-admin invites <span className="font-mono text-[12px]">{bot.botPhone}</span>{' '}
              to the group chat
            </li>
            <li>
              Bot posts a one-time code · admin replies{' '}
              <span className="font-mono text-[12px]">/link &lt;code&gt;</span>
            </li>
            <li>Members whose phone matches a PoolPay member auto-link</li>
            <li>Bot marks receipts · a human admin confirms</li>
          </ol>
        </section>
      </div>

      <div className="hidden lg:block">
        <SysWhatsAppTable rows={rows} />
      </div>
      <div className="lg:hidden">
        <SysWhatsAppCards rows={rows} />
      </div>

      <p className="font-mono text-[11px] text-ink/45">
        phone-match drift (e.g. 8/10) means members changed numbers or never joined the chat
        · nudge them
      </p>
    </main>
  );
}
