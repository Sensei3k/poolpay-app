import { Clock, MessageSquare } from 'lucide-react';
import type { PoolDetail } from '@/lib/view-models/member';

const BANK_NAME = 'Access Bank';
const BANK_ACCOUNT = '0123 456 789';

export interface PayViewProps {
  detail: PoolDetail;
}

/**
 * Presentational pay-flow view. Three-step instructional column wrapped
 * to a max-width 560px on desktop, full-bleed on mobile (the PPShell
 * handles the mobile chrome and hides the bottom tab bar via
 * `hideMobileTabBar`).
 */
export function PayView({ detail }: PayViewProps) {
  return (
    <main
      id="main-content"
      aria-labelledby="pay-title"
      className="mx-auto flex max-w-[560px] flex-col gap-3"
    >
      <header
        className="rounded-[14px] bg-d2-cream p-5"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <div className="kicker-mono text-[10px]">Amount due</div>
        <div className="font-mono text-[2.5rem] font-semibold leading-none tracking-tighter tabular-nums text-d2-ink">
          {detail.cycle.contributionLabel}
        </div>
        <div className="mt-1 text-[13px] text-d2-ink/55">
          to {detail.pool.name} · cycle {detail.cycle.index} payout →{' '}
          {detail.cycle.recipient.name}
        </div>
        <h1 id="pay-title" className="sr-only">
          Pay contribution to {detail.pool.name}
        </h1>
      </header>

      <section
        aria-labelledby="pay-step-1"
        className="rounded-[14px] bg-d2-cream p-4"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <h2 id="pay-step-1" className="kicker-mono mb-2 text-[10px]">
          1 · Send to group account
        </h2>
        <div className="grid grid-cols-[1fr_auto] gap-1.5">
          <div
            className="rounded-[10px] p-3 font-mono text-[13px]"
            style={{
              background: 'var(--d2-warm-bg)',
              border:
                '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
            }}
          >
            <div className="text-[10px] text-d2-ink/55">Bank · {BANK_NAME}</div>
            <div className="mt-0.5 text-[14px] font-semibold tracking-wide">
              {BANK_ACCOUNT}
            </div>
            <div className="text-[11px] text-d2-ink/55">
              PoolPay / {detail.pool.name}
            </div>
          </div>
          <button
            type="button"
            disabled
            aria-label="Copy account details, coming in slice 6"
            title="Coming in slice 6"
            className="rounded-[10px] px-3.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-90"
            style={{
              background: 'var(--d2-warm-bg)',
              border:
                '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
            }}
          >
            Copy
          </button>
        </div>
      </section>

      <section
        aria-labelledby="pay-step-2"
        className="rounded-[14px] bg-d2-cream p-4"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <h2 id="pay-step-2" className="kicker-mono mb-2 text-[10px]">
          2 · Share receipt on WhatsApp
        </h2>
        <div
          className="flex items-center gap-2.5 rounded-[10px] p-3"
          style={{
            background: 'var(--d2-warm-bg)',
            border:
              '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
          }}
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
            style={{ background: 'var(--accent-whatsapp)' }}
            aria-hidden="true"
          >
            <MessageSquare size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-d2-ink">
              {detail.pool.name} · group chat
            </div>
            <div className="font-mono text-[11px] text-d2-ink/55">
              bot matches by your phone number
            </div>
          </div>
          <button
            type="button"
            disabled
            aria-label="Open WhatsApp, coming in slice 5"
            title="Coming in slice 5"
            className="rounded-[10px] px-3.5 py-2 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-90"
            style={{
              background: 'var(--d2-ink)',
              color: 'var(--d2-warm-bg)',
            }}
          >
            Open WhatsApp
          </button>
        </div>
      </section>

      <section
        aria-labelledby="pay-step-3"
        className="rounded-[14px] bg-d2-cream p-4"
        style={{
          border: '1px solid color-mix(in oklch, var(--d2-ink) 7%, transparent)',
        }}
      >
        <h2 id="pay-step-3" className="kicker-mono mb-2 text-[10px]">
          3 · Wait for admin confirmation
        </h2>
        <div className="flex items-start gap-2.5">
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{
              background: 'var(--ajo-outstanding-subtle)',
              color: 'var(--ajo-outstanding)',
            }}
            aria-hidden="true"
          >
            <Clock size={14} />
          </span>
          <div className="min-w-0 text-[13px]">
            <div className="font-medium text-d2-ink">Pending review</div>
            <div className="text-d2-ink/55">
              An admin will confirm your payment within a few hours. You{"'"}ll
              get a notification in Inbox and a reply in the WhatsApp thread.
            </div>
          </div>
        </div>
      </section>

      <p className="kicker-mono mt-2 px-2 text-[10px] tracking-[0.04em] normal-case text-d2-ink/45">
        poolpay never touches your money · transfers go bank-to-bank · receipts
        are verified by admin, not by OCR
      </p>
    </main>
  );
}
