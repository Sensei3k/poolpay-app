'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import { PoolPayLogo } from '@/components/brand/poolpay-logo';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/components/ui/empty';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
      <Link
        href="/"
        aria-label="PoolPay home"
        className="absolute left-4 top-4 text-foreground transition-colors hover:text-foreground/80 sm:left-6 sm:top-6 lg:left-8"
      >
        <PoolPayLogo variant="wordmark" size="sm" />
      </Link>
      <main id="main-content">
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="scale-150 mb-5">
              <Ghost aria-hidden="true" />
            </EmptyMedia>

            <h1
              data-slot="empty-title"
              className="font-bold tracking-tight text-8xl md:text-[10rem] leading-none mt-4 bg-gradient-to-r from-primary via-primary/80 to-blue-500 bg-clip-text text-transparent"
            >
              404
            </h1>

            <EmptyDescription className="mt-4 text-base md:text-lg">
              The page you&apos;re looking for doesn&apos;t exist.
              <br />
              It may have been moved or deleted.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <div className="flex items-center gap-3">
              <Link href="/" className={buttonVariants({ variant: 'outline', className: 'gap-2 border-input bg-background shadow-sm shadow-black/5 hover:bg-accent' })}>
                <Home className="h-4 w-4" aria-hidden="true" />
                Go Home
              </Link>

              <Button
                variant="default"
                className="gap-2 cursor-pointer bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Go Back
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </main>
    </div>
  );
}
