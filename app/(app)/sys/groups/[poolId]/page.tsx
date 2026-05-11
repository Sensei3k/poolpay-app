import { notFound } from 'next/navigation';
import { SysGroupDetailView } from '@/components/super/sys-group-detail-view';
import { getSystemGroupDetailFixture } from '@/lib/preview/super-fixtures';

interface SysGroupDetailPageProps {
  params: Promise<{ poolId: string }>;
}

/**
 * `/sys/groups/[poolId]` — super-admin view of one group.
 *
 * FIXME(BE-9): the system-view group detail is not exposed by the API
 * today — the scoped admin's `/api/admin/groups/{id}` endpoint is
 * member-roster centric and does not return the cross-tenant audit
 * trail. Once BE-9 lands the system-view, the fixture call swaps for
 * `secureFetch`; the view model shape stays.
 */
export default async function SysGroupDetailPage({
  params,
}: SysGroupDetailPageProps) {
  const { poolId } = await params;
  const detail = getSystemGroupDetailFixture(poolId);
  if (!detail) {
    notFound();
  }
  return <SysGroupDetailView detail={detail} />;
}
