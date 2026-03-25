import { Skeleton } from '@/components/ui/skeleton';

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CycleCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>

      <div className="space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>

      <Skeleton className="h-px w-full" />

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}

function PaymentGridSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5 pb-3 space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="px-4 pb-2 space-y-px">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center justify-between py-3 gap-3">
            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading dashboard">
        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full mt-1" />
        </div>

        <Skeleton className="mt-6 h-px w-full" />

        <div className="mt-8 space-y-6">
          <KpiSkeleton />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
            <CycleCardSkeleton />
            <PaymentGridSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
