"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, WifiOff } from "lucide-react";
import { PoolPayLogo } from "@/components/brand/poolpay-logo";

/**
 * Slice-1 stub for `/offline` — PWA service-worker fallback (handoff
 * `ErrOffline`). The service worker itself is not in slice-1 scope; this
 * route exists so the SW can be wired in a later slice without
 * needing to backfill the page. Visual treatment mirrors the FE-5 404
 * editorial frame (`app/not-found.tsx`) so the dark error-family stays
 * consistent across statuses.
 */
export default function OfflinePage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background font-sans text-foreground dark:bg-[#0a0a0a]">
      <header className="relative z-[2] flex items-center justify-between px-6 pt-6 md:px-[72px] md:pt-10">
        <PoolPayLogo variant="wordmark" size="md" />
        <span className="border-border bg-card text-muted-foreground inline-flex items-center gap-2 rounded-full border px-2.5 py-[5px] font-mono text-[11px] tracking-[0.04em] dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-[oklch(0.7_0_0)]">
          <span className="bg-ajo-paid h-1.5 w-1.5 rounded-full" />
          connection lost
        </span>
      </header>

      <main
        id="main-content"
        className="relative z-[2] flex flex-1 items-center justify-center px-6 pb-6 pt-10 md:px-[72px] md:pb-[72px] md:pt-10"
      >
        <div className="flex w-full max-w-[640px] flex-col items-center text-center">
          <div className="mb-6 inline-flex flex-col items-center md:mb-8" aria-hidden="true">
            <WifiOff className="text-muted-foreground h-[120px] w-[120px] md:h-[180px] md:w-[180px]" strokeWidth={1.4} />
            <span className="bg-ajo-paid mt-1.5 block h-0.5 w-11 md:h-[3px] md:w-16" />
          </div>

          <p className="text-ajo-paid mb-3.5 font-mono text-[10.5px] uppercase tracking-[0.1em] md:mb-4 md:text-[11px] md:tracking-[0.08em]">
            You&rsquo;re flying blind
          </p>

          <h1 className="mb-3.5 max-w-[15ch] text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] text-balance md:mb-[18px] md:max-w-[18ch] md:text-[44px] md:leading-[1.05] md:tracking-[-0.035em]">
            You appear to be{" "}
            <em className="text-ajo-paid not-italic">offline</em> — we&rsquo;ll
            catch up when you&rsquo;re back.
          </h1>

          <p className="text-muted-foreground mb-6 max-w-[52ch] text-sm leading-[1.55] md:mb-9 md:text-[15.5px] md:leading-[1.6]">
            Check your connection, then retry. A future slice will queue
            pending payments locally and replay them automatically once
            you&rsquo;re back online.
          </p>

          <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row md:justify-center">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="btn-editorial btn-editorial-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Retry now</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
