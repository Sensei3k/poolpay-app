import { SysGroupsView } from '@/components/super/sys-groups-view';
import { getSystemGroupsFixture } from '@/lib/preview/super-fixtures';

export const metadata = {
  title: 'System groups · PoolPay',
  description: 'Cross-tenant groups list for super-admin operators.',
};

/**
 * `/sys/groups` — system-wide groups list.
 *
 * FIXME(BE-9): poolpay-api has no super-view list endpoint exposing
 * per-pool admin attribution, health metrics, pending counts, and WA
 * link status in one feed. Once the new endpoint lands, swap the
 * fixture call for the `secureFetch`-backed list; the view-model
 * shape (`SystemGroupRow`) stays the same.
 */
export default function SysGroupsPage() {
  const fixture = getSystemGroupsFixture();
  return <SysGroupsView rows={fixture.rows} aggregates={fixture.aggregates} />;
}
