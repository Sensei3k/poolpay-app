import { Info } from 'lucide-react';
import type {
  GroupChipOption,
  SystemAdminRow,
  SystemAdminsAggregates,
} from '@/lib/view-models/super';
import { AddAdminTrigger } from './add-admin-trigger';
import { EmptyAdmins } from './empty-admins';
import { ModalAddAdmin } from './modal-add-admin';
import { SuperChip } from './super-chip';
import { SysAdminsCards } from './sys-admins-cards';
import { SysAdminsTable } from './sys-admins-table';

export interface SysAdminsViewProps {
  rows: ReadonlyArray<SystemAdminRow>;
  aggregates: SystemAdminsAggregates;
  groupOptions: ReadonlyArray<GroupChipOption>;
}

/**
 * Page body for `/sys/admins`. The list ships as a fixture today
 * (slice-4 deviation #2); the modal flow is end-to-end against real
 * poolpay-api endpoints.
 */
export function SysAdminsView({
  rows,
  aggregates,
  groupOptions,
}: SysAdminsViewProps) {
  const subLine = `${aggregates.totalAdmins} admins · ${aggregates.inactive} inactive · ${aggregates.totalGrants} grants total`;

  return (
    <main
      id="main-content"
      aria-labelledby="sys-admins-title"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              id="sys-admins-title"
              className="text-[1.5rem] font-semibold tracking-tight text-d2-ink"
            >
              Admins
            </h1>
            <SuperChip />
          </div>
          <p className="text-[13px] text-d2-ink/55">{subLine}</p>
        </div>
        <AddAdminTrigger />
      </header>

      <div
        role="note"
        className="flex items-center gap-3 rounded-[10px] border px-3.5 py-2.5"
        style={{
          background: 'var(--accent-violet-subtle)',
          borderColor: 'color-mix(in oklch, var(--accent-violet) 25%, transparent)',
        }}
      >
        <Info
          size={15}
          aria-hidden="true"
          style={{ color: 'var(--accent-violet)' }}
        />
        <p className="text-[13px]" style={{ color: 'var(--accent-violet)' }}>
          Admins are created in-app (no SMTP yet), you will get a <b>temp password</b>{' '}
          shown once. Share it out-of-band; they rotate on first sign-in.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyAdmins />
      ) : (
        <>
          <div className="hidden lg:block">
            <SysAdminsTable rows={rows} />
          </div>
          <div className="lg:hidden">
            <SysAdminsCards rows={rows} />
          </div>
        </>
      )}

      <p className="font-mono text-[11px] text-d2-ink/45">
        admins are scoped to the groups you grant them · revoking all grants does NOT delete
        the account
      </p>

      <ModalAddAdmin groupOptions={groupOptions} />
    </main>
  );
}
