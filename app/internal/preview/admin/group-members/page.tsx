import { notFound } from 'next/navigation';
import { GroupView } from '@/components/admin/group-view';
import {
  DEFAULT_PREVIEW_POOL_ID,
  getAdminGroupFixture,
} from '@/lib/preview/admin-fixtures';
import { AdminPreviewChrome } from '../_chrome';

/**
 * Preview of `/admin/groups/[poolId]?tab=members` on desktop. Mobile
 * captures use the `group-mobile-prompt` preview route.
 */
export default function AdminGroupMembersPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const fixture = getAdminGroupFixture(DEFAULT_PREVIEW_POOL_ID);
  return (
    <AdminPreviewChrome
      current="receipts"
      title={fixture.header.name}
      crumbs={`Administration / ${fixture.header.name}`}
      pendingReceiptsCount={fixture.crossGroupReceiptCount}
    >
      <GroupView
        poolId={DEFAULT_PREVIEW_POOL_ID}
        activeTab="members"
        crossGroupReceiptCount={fixture.crossGroupReceiptCount}
        data={fixture.data}
      />
    </AdminPreviewChrome>
  );
}
