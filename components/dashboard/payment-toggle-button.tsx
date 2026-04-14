'use client';

import { useTransition, useState } from 'react';
import { Check, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { togglePayment } from '@/lib/actions';

interface PaymentToggleButtonProps {
  memberId: string;
  cycleId: string;
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

  function handleToggle() {
    // Capture intent before the transition starts — hasPaid reflects pre-toggle state here
    const markedAsPaid = !hasPaid;
    startTransition(async () => {
      const result = await togglePayment(memberId, cycleId, hasPaid, contributionKobo);
      // Announce inside the transition callback after the action completes,
      // avoiding a setState-in-effect cascade.
      if (result.success) {
        setAnnouncement(markedAsPaid ? 'Payment marked as paid' : 'Payment marked as outstanding');
      } else {
        setAnnouncement(result.error ?? 'Unable to update payment status. Please try again.');
      }
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
