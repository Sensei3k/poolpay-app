import { SysAdminsView } from '@/components/super/sys-admins-view';
import { getSystemAdminsFixture } from '@/lib/preview/super-fixtures';

export const metadata = {
  title: 'System admins · PoolPay',
  description: 'Roster of admin-tier users and their group grants.',
};

/**
 * `/sys/admins`, super-admin roster + add-admin flow.
 *
 * Add-admin modal flows end-to-end against the real poolpay-api
 * endpoints (`POST /api/admin/users` + per-group grant + best-effort
 * compensation DELETE). The roster list itself is fixture-backed
 * today.
 *
 * FIXME(BE-9): poolpay-api does not expose a cross-tenant admin
 * roster endpoint yet (`GET /api/admin/users` lists the calling
 * admin's own grants, not all admins). Once BE-9 ships the
 * super-admin roster, swap the fixture call; the view model shape
 * stays.
 */
export default function SysAdminsPage() {
  const fixture = getSystemAdminsFixture();
  return (
    <SysAdminsView
      rows={fixture.rows}
      aggregates={fixture.aggregates}
      groupOptions={fixture.groupOptions}
    />
  );
}
