'use client';

import { useTransition } from 'react';
import { Check, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  function handleToggle() {
    startTransition(async () => {
      await togglePayment(memberId, cycleId, hasPaid, contributionKobo);
    });
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={hasPaid ? 'Mark as unpaid' : 'Mark as paid'}
      variant={hasPaid ? 'outline' : 'secondary'}
      size="xs"
      className="cursor-pointer"
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
  );
}
