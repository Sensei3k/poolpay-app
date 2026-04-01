'use server';

import { revalidatePath } from 'next/cache';
import { apiAction } from '@/lib/http';
import type { ActionResult } from '@/lib/types';

export async function togglePayment(
  memberId: number,
  cycleId: number,
  hasPaid: boolean,
  contributionKobo: number,
): Promise<ActionResult> {
  let result: ActionResult;

  if (hasPaid) {
    result = await apiAction(`/api/payments/${memberId}/${cycleId}`, { method: 'DELETE' });
    // 404 means the payment was already removed — treat as success (idempotent intent)
    if (!result.success && result.error.startsWith('404')) {
      result = { success: true };
    }
  } else {
    result = await apiAction('/api/payments', {
      method: 'POST',
      body: {
        memberId,
        cycleId,
        amount: contributionKobo,
        currency: 'NGN',
        paymentDate: new Date().toISOString().slice(0, 10),
      },
    });
  }

  if (result.success) revalidatePath('/');
  return result;
}
