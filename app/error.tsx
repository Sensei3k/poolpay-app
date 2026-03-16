'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-ajo-outstanding-subtle p-3">
            <AlertTriangle className="h-6 w-6 text-ajo-outstanding" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">Failed to load dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Something went wrong fetching the circle data. Try again or check back later.
          </p>
        </div>

        <Button onClick={reset} variant="outline" size="sm" className="gap-2 cursor-pointer">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </div>
  );
}
