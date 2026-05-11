import { notFound } from 'next/navigation';
import { ReceiptsModalPreviewDriver } from '@/lib/preview/receipts-modal-preview-driver';
import { getAdminReceiptsFixture } from '@/lib/preview/admin-fixtures';
import { AdminPreviewChrome } from '../_chrome';

const PREVIEW_RECEIPT_ID = 'rcpt-1';

/**
 * Dev-only preview of the receipts queue with one row in its optimistic
 * confirming state — the modal is closed, the targeted row is dimmed
 * with the "Confirming…" label, mirroring what the operator sees after
 * clicking Confirm before the server round-trip lands.
 */
export default function AdminReceiptsModalConfirmingPreviewPage() {
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
        state="modal-confirming"
        receiptId={PREVIEW_RECEIPT_ID}
        rows={fixture.rows}
        aggregates={fixture.aggregates}
        groupCount={fixture.groupCount}
      />
    </AdminPreviewChrome>
  );
}
