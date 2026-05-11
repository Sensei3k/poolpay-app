'use client';

import { notFound } from 'next/navigation';
import { Copy, RotateCcw } from 'lucide-react';
import { DarkErrorFrame } from '@/components/feedback/dark-error-frame';

const PREVIEW_TRACE = '0000·0000';

/**
 * Dev-only preview of the `/500` root error boundary. The real boundary
 * lives at `app/error.tsx` and only mounts when a child segment throws,
 * which is awkward to drive from the screenshot pass. This route mirrors
 * the same `<DarkErrorFrame>` composition with a static trace so the
 * matrix can capture the artboard at the polish viewports. Production
 * builds 404 this route via the standard preview gate.
 */
export default function Err500PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  const traceLabel = `Copy trace · ${PREVIEW_TRACE}`;

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
            className="btn-editorial btn-editorial-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Try again</span>
          </button>
          <button
            type="button"
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
