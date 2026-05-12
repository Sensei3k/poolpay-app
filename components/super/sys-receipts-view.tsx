import type {
  SystemReceiptRow,
  SystemReceiptsAggregates,
} from '@/lib/view-models/super';
import { SuperChip } from './super-chip';
import { SysReceiptsCards } from './sys-receipts-cards';
import { SysReceiptsSignals } from './sys-receipts-signals';
import { SysReceiptsTable } from './sys-receipts-table';

export interface SysReceiptsViewProps {
  rows: ReadonlyArray<SystemReceiptRow>;
  aggregates: SystemReceiptsAggregates;
}

/**
 * Page body for `/sys/receipts`. Renders the system-wide queue with
 * the violet system-wide chip, the five-tile signal row, and the
 * receipts table (collapsing to cards on the 768..1023px tablet band).
 *
 * Slice-4 ships the visual surface; row actions ("Reassign", "View")
 * are disabled with explanatory titles. Slice-5 (WhatsApp ingestion)
 * wires the real mutation actions once the BE list endpoint lands
 * (deviation #2).
 */
export function SysReceiptsView({ rows, aggregates }: SysReceiptsViewProps) {
  const hasRows = rows.length > 0;
  const subLine = `${aggregates.pending} awaiting across ${aggregates.groups} groups · ${aggregates.confirmedAdmins} admins`;

  return (
    <section
      aria-labelledby="sys-receipts-title"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1
            id="sys-receipts-title"
            className="text-[1.5rem] font-semibold tracking-tight text-ink"
          >
            Receipts queue
          </h1>
          <SuperChip>system · all groups</SuperChip>
        </div>
        <p className="text-[13px] text-ink/55">{subLine}</p>
      </header>

      <SysReceiptsSignals aggregates={aggregates} />

      {hasRows ? (
        <>
          <div className="hidden lg:block">
            <SysReceiptsTable rows={rows} />
          </div>
          <div className="lg:hidden">
            <SysReceiptsCards rows={rows} />
          </div>
        </>
      ) : (
        <div
          role="status"
          className="rounded-[14px] border bg-surface-card p-8 text-center text-[13px] text-ink/65"
          style={{
            borderColor: 'color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          The system-wide queue is empty. Pool admins handle their own queues today.
        </div>
      )}

      <p className="font-mono text-[11px] text-ink/45">
        super_admin view · does NOT confirm receipts directly, routes stragglers to admins.
        &ldquo;No admin assigned&rdquo; is the only actionable alarm here.
      </p>
    </section>
  );
}
