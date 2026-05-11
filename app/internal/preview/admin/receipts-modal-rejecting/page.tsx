import { notFound } from 'next/navigation';
import { ReceiptsModalPreviewDriver } from '@/lib/preview/receipts-modal-preview-driver';
import { getAdminReceiptsFixture } from '@/lib/preview/admin-fixtures';
import { AdminPreviewChrome } from '../_chrome';

const PREVIEW_RECEIPT_ID = 'rcpt-1';

/**
 * Dev-only preview of the receipts modal in its rejecting state,
 * "Reject as duplicate" footer button has been clicked, exposing the
 * inline reason textarea, character counter, and Cancel/Reject pair.
 */
export default function AdminReceiptsModalRejectingPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const fixture = getAdminReceiptsFixture();
  return (
    <AdminPreviewChrome
      current="receipts"
      title="Receipts queue"
      crumbs="Administration"
      pendingReceiptsCount={fixture.aggregates.awaiting}
    >
      <ReceiptsModalPreviewDriver
        state="modal-rejecting"
        receiptId={PREVIEW_RECEIPT_ID}
        rows={fixture.rows}
        aggregates={fixture.aggregates}
        groupCount={fixture.groupCount}
      />
    </AdminPreviewChrome>
  );
}
