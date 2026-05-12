import { ReceiptsSkeleton } from '@/components/admin/receipts-skeleton';

export default function SysReceiptsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading system receipts queue"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-[1.5rem] font-semibold tracking-tight text-ink">
          Receipts (system-wide)
        </h1>
        <p className="text-[13px] text-ink/55">Loading queue…</p>
      </header>
      <ReceiptsSkeleton />
    </div>
  );
}
