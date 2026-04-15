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

function OutstandingAlertSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded shrink-0" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="space-y-2 pl-6">
        {[0, 1].map(i => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentGridSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Card header — title + subtitle + toggle */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>

      {/* Search bar */}
      <div className="px-4 pt-1 pb-2">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>

      {/* Column headers */}
      <div className="grid gap-x-4 px-8 py-2 [grid-template-columns:2rem_1fr_8rem] sm:[grid-template-columns:2rem_2fr_2fr_1.5fr_1.5fr]">
        <Skeleton className="h-2.5 w-5" />
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="hidden sm:block h-2.5 w-10" />
        <Skeleton className="hidden sm:block h-2.5 w-8" />
        <Skeleton className="h-2.5 w-10 ml-auto" />
      </div>

      {/* Card rows */}
      <div className="px-4 pb-4 space-y-2">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-muted/50 grid items-center gap-x-4 px-4 py-3.5
              [grid-template-columns:2rem_1fr_8rem]
              sm:[grid-template-columns:2rem_2fr_2fr_1.5fr_1.5fr]"
          >
            {/* Row number */}
            <Skeleton className="h-6 w-6" />

            {/* Name + stacked phone (mobile) */}
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20 sm:hidden" />
            </div>

            {/* Phone — sm+ only */}
            <Skeleton className="hidden sm:block h-3 w-24" />

            {/* Date — sm+ only */}
            <Skeleton className="hidden sm:block h-3 w-12" />

            {/* Status badge */}
            <Skeleton className="h-7 w-20 rounded-lg ml-auto" />
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
        {/* Header */}
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

          {/* CycleCard + OutstandingAlert — mirrors the sm:grid-cols-2 layout in page.tsx */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CycleCardSkeleton />
            <OutstandingAlertSkeleton />
          </div>

          {/* Full-width payment table */}
          <PaymentGridSkeleton />
        </div>
      </main>
    </div>
  );
}
