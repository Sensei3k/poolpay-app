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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ghost aria-hidden="true" />
          </EmptyMedia>

          <h1
            data-slot="empty-title"
            className="font-bold tracking-tight text-xl leading-none"
          >
            <span className="text-muted-foreground">40</span>
            <span className="text-ajo-paid">4</span>
          </h1>

          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist.
            <br />
            It may have been moved or deleted.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex items-center gap-3">
            <Link href="/" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5' })}>
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              Go Home
            </Link>

            <Button
              variant="default"
              size="sm"
              className="gap-1.5 cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Go Back
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
