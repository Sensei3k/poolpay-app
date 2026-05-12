import { ReceiptsSkeleton } from '@/components/admin/receipts-skeleton';

export default function AdminReceiptsLoading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Loading receipts queue"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-[1.5rem] font-semibold tracking-tight text-ink">
          Receipts queue
        </h1>
        <p className="text-[13px] text-ink/55">Loading pending receipts…</p>
      </header>
      <ReceiptsSkeleton />
    </main>
  );
}
