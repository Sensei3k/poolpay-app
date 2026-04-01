'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Circle Dashboard]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Empty className="border-0" aria-live="assertive">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle className="text-destructive" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Failed to load dashboard</EmptyTitle>
          <EmptyDescription>
            Something went wrong fetching the circle data. Try again or check
            back later.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onClick={reset}
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
