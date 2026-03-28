'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="scale-150 mb-10">
            <Ghost aria-hidden="true" />
          </EmptyMedia>

          <h1
            data-slot="empty-title"
            className="font-bold tracking-tight text-8xl md:text-[10rem] leading-none mt-4 bg-gradient-to-br from-foreground via-ajo-paid to-ajo-paid/50 bg-clip-text text-transparent"
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
            <Link href="/" className={buttonVariants({ variant: 'outline', className: 'gap-2' })}>
              <Home className="h-4 w-4" aria-hidden="true" />
              Go Home
            </Link>

            <Button
              variant="default"
              className="gap-2 cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go Back
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
