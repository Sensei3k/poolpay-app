import { SkeletonBlock } from '@/components/feedback/skeleton-block';

const STAT_TILES = [0, 1, 2] as const;
const POOL_TILES = [0, 1, 2, 3] as const;

/**
 * Loading skeleton for `/home`. Mirrors the artboard's three-stat KPI
 * row + 2-up pool card grid. Rendered by `app/(app)/home/loading.tsx`
 * so the page-level Suspense boundary doesn't fall back to the legacy
 * dashboard skeleton.
 */
export function HomeSkeleton() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Loading home"
      className="flex flex-col gap-6"
    >
      <header className="flex flex-col gap-3">
        <SkeletonBlock w={120} h={11} />
        <SkeletonBlock w="60%" h={32} />
        <SkeletonBlock w="42%" h={20} />
      </header>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
        {STAT_TILES.map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-[14px] border p-4"
            style={{
              borderColor:
                'color-mix(in oklch, var(--ink) 8%, transparent)',
            }}
          >
            <SkeletonBlock w="50%" h={10} />
            <SkeletonBlock w="70%" h={22} />
            <SkeletonBlock w="40%" h={11} />
          </div>
        ))}
      </div>

      <SkeletonBlock w={120} h={14} />
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3">
        {POOL_TILES.map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 rounded-[14px] border p-3.5"
            style={{
              borderColor:
                'color-mix(in oklch, var(--ink) 8%, transparent)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <SkeletonBlock w={34} h={34} r={10} />
              <div className="flex flex-1 flex-col gap-1">
                <SkeletonBlock w="55%" h={13} />
                <SkeletonBlock w="38%" h={10} />
              </div>
            </div>
            <SkeletonBlock h={4} r={999} />
            <div className="flex items-center justify-between">
              <SkeletonBlock w={60} h={10} />
              <SkeletonBlock w={70} h={11} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
