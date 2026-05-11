import { SysReceiptsView } from '@/components/super/sys-receipts-view';
import { getSystemReceiptsFixture } from '@/lib/preview/super-fixtures';

export const metadata = {
  title: 'System receipts queue · PoolPay',
  description: 'Cross-tenant receipts queue for super-admin operators.',
};

/**
 * `/sys/receipts` — system-wide receipts queue.
 *
 * FIXME(BE-9): poolpay-api has no system-wide receipts list endpoint
 * yet. The existing `GET /api/admin/receipts/*` are scoped to a single
 * pool. Until BE-9 lands a cross-pool feed, this page renders against
 * `lib/preview/super-fixtures.ts` so operators (and screenshots) can
 * preview the surface. Swap the fixture call for a `secureFetch` to
 * the new endpoint once it ships; the view component shape stays the
 * same.
 */
export default function SysReceiptsPage() {
  const fixture = getSystemReceiptsFixture();
  return <SysReceiptsView rows={fixture.rows} aggregates={fixture.aggregates} />;
}
