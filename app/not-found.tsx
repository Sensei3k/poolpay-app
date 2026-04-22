'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { PoolPayLogo } from '@/components/brand/poolpay-logo';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background font-sans text-foreground dark:bg-[#0a0a0a]">
      <header className="relative z-[2] flex items-center justify-between px-6 pt-6 md:px-[72px] md:pt-10">
        <PoolPayLogo variant="wordmark" size="md" />
        <StatusPill>
          <span className="hidden sm:inline">HTTP 404 · route not found</span>
          <span className="sm:hidden">HTTP 404</span>
        </StatusPill>
      </header>

      <main
        id="main-content"
        className="relative z-[2] flex flex-1 items-center justify-center px-6 pb-6 pt-10 md:px-[72px] md:pb-[72px] md:pt-10"
      >
        <div className="flex w-full max-w-[640px] flex-col items-center text-center">
          <div
            className="mb-6 inline-flex flex-col items-center md:mb-8"
            aria-hidden="true"
          >
            <span className="display-404">404</span>
            <span className="mt-1.5 block h-0.5 w-11 bg-ajo-paid md:h-[3px] md:w-16" />
          </div>

          <p className="mb-3.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ajo-paid md:mb-4 md:text-[11px] md:tracking-[0.08em]">
            This page isn&rsquo;t in the pool
          </p>

          <h1 className="mb-3.5 max-w-[15ch] text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] text-balance md:mb-[18px] md:max-w-[18ch] md:text-[44px] md:leading-[1.05] md:tracking-[-0.035em]">
            We looked everywhere —{' '}
            <em className="not-italic text-ajo-paid">
              this route doesn&rsquo;t exist
            </em>{' '}
            on PoolPay.
          </h1>

          <p className="mb-6 max-w-[52ch] text-sm leading-[1.55] text-muted-foreground md:mb-9 md:text-[15.5px] md:leading-[1.6]">
            The link may be stale, the group archived, or a collaborator&rsquo;s
            invite out of date. Nothing is broken on your side.
          </p>

          <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row md:justify-center">
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
          </div>
        </div>
      </main>

      <DecorativeRings />
    </div>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-[5px] font-mono text-[11px] tracking-[0.04em] text-muted-foreground dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-[oklch(0.7_0_0)]">
      <span className="h-1.5 w-1.5 rounded-full bg-ajo-paid" />
      {children}
    </span>
  );
}

function DecorativeRings() {
  return (
    <>
      {/* Mobile: smaller, further off-canvas */}
      <svg
        viewBox="0 0 720 720"
        aria-hidden="true"
        className="pointer-events-none absolute right-[-420px] top-1/2 h-[520px] w-[520px] -translate-y-1/2 opacity-[0.45] md:hidden"
      >
        <RingPaths />
      </svg>
      {/* Desktop */}
      <svg
        viewBox="0 0 720 720"
        aria-hidden="true"
        className="pointer-events-none absolute right-[-260px] top-1/2 hidden h-[900px] w-[900px] -translate-y-1/2 opacity-90 md:block"
      >
        <RingPaths />
      </svg>
    </>
  );
}

function RingPaths() {
  return (
    <>
      <circle
        cx="360"
        cy="360"
        r="340"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <circle
        cx="360"
        cy="360"
        r="280"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <circle
        cx="360"
        cy="360"
        r="220"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.22"
      />
      <circle
        cx="360"
        cy="360"
        r="160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.12"
      />
      <circle
        cx="360"
        cy="360"
        r="100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.22"
      />
      <circle cx="360" cy="360" r="46" className="fill-ajo-paid" />
    </>
  );
}
