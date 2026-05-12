import { SkeletonBlock } from '@/components/feedback/skeleton-block';

const ROWS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/**
 * Loading skeleton for the admin receipts queue table. Matches the
 * column layout of the live `<ReceiptsQueueTable>` (group / member /
 * amount / submitted / pill) so the layout doesn't reshuffle when the
 * data arrives. Rendered by `app/(app)/admin/receipts/loading.tsx`.
 */
export function ReceiptsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading receipts queue"
      className="overflow-hidden rounded-[14px] border"
      style={{
        borderColor: 'color-mix(in oklch, var(--ink) 8%, transparent)',
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{
          borderBottom:
            '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
        }}
      >
        <SkeletonBlock w={140} h={14} />
        <SkeletonBlock w={80} h={11} />
      </div>
      {ROWS.map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1.4fr_1fr_1fr_0.6fr_0.4fr] items-center gap-4 px-4 py-3.5"
          style={{
            borderBottom:
              i === ROWS.length - 1
                ? 'none'
                : '1px solid color-mix(in oklch, var(--ink) 7%, transparent)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <SkeletonBlock w={26} h={26} r={999} />
            <SkeletonBlock w="60%" h={12} />
          </div>
          <SkeletonBlock w="55%" h={11} />
          <SkeletonBlock w="40%" h={11} />
          <SkeletonBlock w={70} h={20} r={6} />
          <SkeletonBlock w={20} h={20} r={6} />
        </div>
      ))}
    </div>
  );
}
