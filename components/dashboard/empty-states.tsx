'use client';

import { useRouter } from 'next/navigation';
import { WifiOff, CircleDollarSign, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export function ServerErrorState() {
  const router = useRouter();

  return (
    <Empty aria-live="polite">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WifiOff className="text-destructive" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Unable to reach the server</EmptyTitle>
        <EmptyDescription>
          This is usually temporary. Check that the backend is running and try
          again.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer"
          onClick={() => router.refresh()}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function NoDataState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleDollarSign aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No cycles yet</EmptyTitle>
        <EmptyDescription>
          Once a savings cycle is created, your dashboard will come to life here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function WaitingPaymentState() {
  return (
    <Empty role="status" className="border-0 py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Clock className="text-muted-foreground" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No payments yet</EmptyTitle>
        <EmptyDescription>
          Payments will appear here as members contribute to this cycle.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
