'use client';

import { useTransition, useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { togglePayment } from '@/lib/actions';

interface PaymentToggleButtonProps {
  memberId: number;
  cycleId: number;
  hasPaid: boolean;
  contributionKobo: number;
}

export function PaymentToggleButton({
  memberId,
  cycleId,
  hasPaid,
  contributionKobo,
}: PaymentToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [announcement, setAnnouncement] = useState('');
  const wasPendingRef = useRef(false);

  // Announce the result to screen readers when the transition completes
  useEffect(() => {
    if (wasPendingRef.current && !isPending) {
      setAnnouncement(hasPaid ? 'Payment marked as paid' : 'Payment marked as outstanding');
    }
    wasPendingRef.current = isPending;
  }, [isPending, hasPaid]);

  function handleToggle() {
    startTransition(async () => {
      await togglePayment(memberId, cycleId, hasPaid, contributionKobo);
    });
  }

  return (
    <>
      {/* Screen reader live announcement — visually hidden */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>

      <Button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={hasPaid ? 'Mark as unpaid' : 'Mark as paid'}
        variant="outline"
        size="xs"
        className={cn(
          'cursor-pointer transition-colors',
          hasPaid
            ? 'border-ajo-outstanding text-ajo-outstanding hover:bg-ajo-outstanding/10 hover:text-ajo-outstanding'
            : 'border-ajo-paid text-ajo-paid hover:bg-ajo-paid/10 hover:text-ajo-paid',
        )}
      >
        {isPending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : hasPaid ? (
          <RotateCcw aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
        {hasPaid ? 'Undo' : 'Mark paid'}
      </Button>
    </>
  );
}
