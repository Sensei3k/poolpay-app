'use client';

import { useRouter } from 'next/navigation';
import { WifiOff, CircleDollarSign, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/empty-state';

export function ServerErrorState() {
  const router = useRouter();

  return (
    <EmptyState
      ariaLabel="Unable to reach the server"
      tone="muted"
      headingLevel="h3"
      icon={
        <WifiOff
          className="text-destructive"
          aria-hidden="true"
        />
      }
      title="Unable to reach the server"
      description="This is usually temporary. Check that the backend is running and try again."
      primaryAction={
        <Button
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer"
          onClick={() => router.refresh()}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </Button>
      }
    />
  );
}

export function NoDataState() {
  return (
    <EmptyState
      ariaLabel="No cycles yet"
      tone="muted"
      headingLevel="h3"
      icon={<CircleDollarSign aria-hidden="true" />}
      title="No cycles yet"
      description="Once a savings cycle is created, your dashboard will come to life here."
    />
  );
}

export function WaitingPaymentState() {
  return (
    <EmptyState
      ariaLabel="No payments yet"
      tone="muted"
      headingLevel="h3"
      icon={
        <Clock
          className="text-muted-foreground"
          aria-hidden="true"
        />
      }
      title="No payments yet"
      description="Payments will appear here as members contribute to this cycle."
    />
  );
}
