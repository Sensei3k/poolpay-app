import { notFound } from 'next/navigation';
import { ReceiptsModalPreviewDriver } from '@/lib/preview/receipts-modal-preview-driver';
import { getAdminReceiptsFixture } from '@/lib/preview/admin-fixtures';
import { AdminPreviewChrome } from '../_chrome';

const PREVIEW_RECEIPT_ID = 'rcpt-1';

/**
 * Dev-only preview of the receipts modal in its flagging state —
 * "Mark as suspicious" footer button has been clicked, exposing the
 * inline reason textarea variant gated by the destructive submit.
 */
export default function AdminReceiptsModalFlaggingPreviewPage() {
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
        state="modal-flagging"
        receiptId={PREVIEW_RECEIPT_ID}
        rows={fixture.rows}
        aggregates={fixture.aggregates}
        groupCount={fixture.groupCount}
      />
    </AdminPreviewChrome>
  );
}
