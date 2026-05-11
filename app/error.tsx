'use client';

import { useEffect } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { DarkErrorFrame } from '@/components/feedback/dark-error-frame';

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const FALLBACK_TRACE = '0000·0000';

/**
 * Root-level error boundary (handoff `Err500` artboard).
 *
 * Triggered by any uncaught error in a child route segment that doesn't
 * already define its own `error.tsx`. The existing `app/(app)/error.tsx`
 * stays in place for in-shell errors so the sidebar/topbar still renders;
 * this boundary catches everything outside that scope (auth routes,
 * offline page, etc.) and renders the dark editorial 500.
 *
 * Surfacing the digest (or a deterministic fallback when Next does not
 * generate one) lets users copy a trace into support tickets without
 * us logging anything sensitive client-side.
 */
export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    // Production console reporting only — Vercel collects this; the
    // user-facing copy keeps the digest visible for support.
    console.error('[PoolPay]', error);
  }, [error]);

  const trace = error.digest ?? FALLBACK_TRACE;
  const traceLabel = `Copy trace · ${trace}`;

  const handleCopyTrace = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(trace);
    } catch {
      // No-op: clipboard write can fail behind iframes or permission
      // prompts. The trace is still visible in the button label so the
      // user can read it back manually.
    }
  };

  return (
    <DarkErrorFrame
      status="HTTP 500 · server error"
      glyph={<span className="display-404">500</span>}
      kicker="our pumps aren't catching"
      headline={
        <>
          Something on{' '}
          <em className="not-italic text-ajo-paid">our side</em> went wrong,
          your money is safe.
        </>
      }
      body="No transaction was processed. Our team has been notified and is looking into it. Try again in a moment."
      actions={
        <>
          <button
            type="button"
            onClick={reset}
            className="btn-editorial btn-editorial-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Try again</span>
          </button>
          <button
            type="button"
            onClick={handleCopyTrace}
            className="btn-editorial btn-editorial-outline"
            aria-label={traceLabel}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{traceLabel}</span>
          </button>
        </>
      }
    />
  );
}
