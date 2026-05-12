'use client';

import { useRouter } from 'next/navigation';
import { RotateCcw, WifiOff } from 'lucide-react';
import { DarkErrorFrame } from '@/components/feedback/dark-error-frame';

/**
 * Slice-1 stub for `/offline`, PWA service-worker fallback (handoff
 * `ErrOffline` artboard). The service worker itself is not in scope of
 * the v1 ship; this route exists so the SW can be wired in a later
 * slice without backfilling the page. Visual treatment shares the
 * `<DarkErrorFrame>` primitive with the 404 and 500 surfaces.
 */
export default function OfflinePage() {
  const router = useRouter();

  return (
    <DarkErrorFrame
      status="connection lost"
      glyph={
        <WifiOff
          className="text-muted-foreground h-[120px] w-[120px] md:h-[180px] md:w-[180px]"
          strokeWidth={1.4}
        />
      }
      kicker="you're flying blind"
      headline={
        <>
          You appear to be{' '}
          <em className="not-italic text-status-paid">offline</em>, we&rsquo;ll
          catch up when you&rsquo;re back.
        </>
      }
      body="Check your connection, then retry. A future slice will queue pending payments locally and replay them automatically once you're back online."
      actions={
        <button
          type="button"
          onClick={() => router.refresh()}
          className="btn-editorial btn-editorial-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Retry now</span>
        </button>
      }
    />
  );
}
