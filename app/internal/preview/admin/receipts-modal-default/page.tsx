import { notFound } from 'next/navigation';
import { ReceiptsModalPreviewDriver } from '@/lib/preview/receipts-modal-preview-driver';
import { getAdminReceiptsFixture } from '@/lib/preview/admin-fixtures';
import { AdminPreviewChrome } from '../_chrome';

const PREVIEW_RECEIPT_ID = 'rcpt-1';

/**
 * Dev-only preview of the receipts modal in its default state — three
 * footer actions visible (reject / flag / confirm), no reason prompt
 * revealed. Mirrors the slice-3 receipts preview but with the modal
 * pre-opened on the first row so the screenshot matrix can capture
 * slice-5's wired buttons.
 */
export default function AdminReceiptsModalDefaultPreviewPage() {
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
        state="modal-default"
        receiptId={PREVIEW_RECEIPT_ID}
        rows={fixture.rows}
        aggregates={fixture.aggregates}
        groupCount={fixture.groupCount}
      />
    </AdminPreviewChrome>
  );
}
