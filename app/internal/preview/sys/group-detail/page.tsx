import { notFound } from 'next/navigation';
import { SysGroupDetailView } from '@/components/super/sys-group-detail-view';
import {
  DEFAULT_PREVIEW_SUPER_POOL_ID,
  getSystemGroupDetailFixture,
} from '@/lib/preview/super-fixtures';
import { SuperPreviewChrome } from '../_chrome';

export default function SysGroupDetailPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const detail = getSystemGroupDetailFixture(DEFAULT_PREVIEW_SUPER_POOL_ID);
  if (!detail) notFound();
  return (
    <SuperPreviewChrome
      current="sys-groups"
      title={detail.poolName}
      crumbs="System · super_admin / Groups"
    >
      <SysGroupDetailView detail={detail} />
    </SuperPreviewChrome>
  );
}
