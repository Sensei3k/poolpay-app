import { notFound } from 'next/navigation';
import { ReceiptsSkeleton } from '@/components/admin/receipts-skeleton';
import { AdminPreviewChrome } from '../../admin/_chrome';

/**
 * Dev-only preview of the `/admin/receipts` loading skeleton. Real
 * consumer is `app/(app)/admin/receipts/loading.tsx`, which only renders
 * for a flash during route transitions, so the screenshot pass uses this
 * dedicated route to capture the artboard. Production builds 404 this
 * route via the standard preview gate.
 */
export default function ReceiptsSkeletonPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <AdminPreviewChrome
      current="receipts"
      title="Receipts queue"
      sub="Loading state"
    >
      <main
        id="main-content"
        aria-busy="true"
        aria-label="Loading receipts queue"
        className="flex flex-col gap-4"
      >
        <header className="flex flex-col gap-1">
          <h1 className="text-[1.5rem] font-semibold tracking-tight text-d2-ink">
            Receipts queue
          </h1>
          <p className="text-[13px] text-d2-ink/55">
            Loading pending receipts...
          </p>
        </header>
        <ReceiptsSkeleton />
      </main>
    </AdminPreviewChrome>
  );
}
