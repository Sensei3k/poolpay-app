import { Plus, Search } from 'lucide-react';
import type {
  SystemGroupRow,
  SystemGroupsAggregates,
} from '@/lib/view-models/super';
import { SuperChip } from './super-chip';
import { SysGroupsCards } from './sys-groups-cards';
import { SysGroupsTable } from './sys-groups-table';

export interface SysGroupsViewProps {
  rows: ReadonlyArray<SystemGroupRow>;
  aggregates: SystemGroupsAggregates;
}

/**
 * Page body for `/sys/groups`. Renders the system-wide group list with
 * the violet system chip in the toolbar. Search + "New group" buttons
 * are visual-only, group creation lands when BE-9 ships the
 * super-admin write surface (slice-4 deviation #2).
 */
export function SysGroupsView({ rows, aggregates }: SysGroupsViewProps) {
  const subLine = `${aggregates.groupCount} groups · ${aggregates.adminCount} admins · ${aggregates.unlinkedFromWhatsApp} unlinked from WhatsApp`;

  return (
    <section
      aria-labelledby="sys-groups-title"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              id="sys-groups-title"
              className="text-[1.5rem] font-semibold tracking-tight text-ink"
            >
              Groups
            </h1>
            <SuperChip />
          </div>
          <p className="text-[13px] text-ink/55">{subLine}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* TODO(BE-9): wire the super-view list search endpoint. */}
          <div className="relative">
            <Search
              size={13}
              aria-hidden="true"
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'color-mix(in oklch, var(--ink) 50%, transparent)' }}
            />
            <input
              disabled
              placeholder="Search groups…"
              aria-label="Search groups (coming soon)"
              title="Search groups (coming soon)"
              className="w-[180px] rounded-[10px] border-none py-1.5 pl-7 pr-3 text-[13px] disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background: 'color-mix(in oklch, var(--ink) 5%, transparent)',
              }}
            />
          </div>
          {/* TODO(BE-9): wire the super-admin group creation surface. */}
          <button
            type="button"
            disabled
            title="New group (coming soon)"
            aria-label="New group (coming soon)"
            className="inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: 'var(--ink)', color: 'var(--surface-page)' }}
          >
            <Plus size={13} aria-hidden="true" />
            New group
          </button>
        </div>
      </header>

      <div className="hidden lg:block">
        <SysGroupsTable rows={rows} />
      </div>
      <div className="lg:hidden">
        <SysGroupsCards rows={rows} />
      </div>

      <p className="font-mono text-[11px] text-ink/45">
        &ldquo;unassigned&rdquo; + &ldquo;unlinked&rdquo; are orphan states, super-admin should resolve or archive.
      </p>
    </section>
  );
}
