'use server';

import { revalidatePath } from 'next/cache';
import { addPayment, removePayment } from './store';

export async function togglePayment(
  memberId: number,
  cycleId: number,
  hasPaid: boolean,
  contributionKobo: number,
): Promise<void> {
  if (hasPaid) {
    removePayment(memberId, cycleId);
  } else {
    addPayment({
      id: Date.now(),
      memberId,
      cycleId,
      amount: contributionKobo,
      currency: 'NGN',
      paymentDate: new Date().toISOString().slice(0, 10),
    });
  }

  revalidatePath('/');
}
