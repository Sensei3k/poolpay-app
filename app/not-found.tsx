'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { DarkErrorFrame } from '@/components/feedback/dark-error-frame';

export default function NotFound() {
  const router = useRouter();

  return (
    <DarkErrorFrame
      status={
        <>
          <span className="hidden sm:inline">HTTP 404 · route not found</span>
          <span className="sm:hidden">HTTP 404</span>
        </>
      }
      glyph={<span className="display-404">404</span>}
      kicker="this page isn't in the pool"
      headline={
        <>
          We looked everywhere,{' '}
          <em className="not-italic text-status-paid">
            this route doesn&rsquo;t exist
          </em>{' '}
          on PoolPay.
        </>
      }
      body="The link may be stale, the group archived, or a collaborator's invite out of date. Nothing is broken on your side."
      actions={
        <>
          <Link href="/" className="btn-editorial btn-editorial-primary">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to dashboard</span>
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-editorial btn-editorial-outline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Go back</span>
          </button>
        </>
      }
    />
  );
}
