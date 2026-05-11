import { notFound } from 'next/navigation';
import { ReceiptsView } from '@/components/admin/receipts-view';
import { getAdminReceiptsFixture } from '@/lib/preview/admin-fixtures';
import { AdminPreviewChrome } from '../_chrome';

/**
 * Dev-only preview of `/admin/receipts`. Mounts the receipts queue with
 * the static admin fixture so the screenshot matrix can capture every
 * row tone without running the real backend.
 */
export default function AdminReceiptsPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const fixture = getAdminReceiptsFixture();
  return (
    <AdminPreviewChrome
      current="receipts"
      title="Receipts queue"
      crumbs="Administration"
      pendingReceiptsCount={fixture.aggregates.awaiting}
    >
      <ReceiptsView
        rows={fixture.rows}
        aggregates={fixture.aggregates}
        groupCount={fixture.groupCount}
      />
    </AdminPreviewChrome>
  );
}
