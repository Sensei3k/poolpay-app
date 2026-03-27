'use server';

import { revalidatePath } from 'next/cache';

const BASE = process.env.BACKEND_URL ?? 'http://localhost:8080';

export async function togglePayment(
  memberId: number,
  cycleId: number,
  hasPaid: boolean,
  contributionKobo: number,
): Promise<void> {
  if (hasPaid) {
    const res = await fetch(`${BASE}/api/payments/${memberId}/${cycleId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to remove payment: ${res.status} ${res.statusText}`);
    }
  } else {
    const res = await fetch(`${BASE}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId,
        cycleId,
        amount: contributionKobo,
        currency: 'NGN',
        paymentDate: new Date().toISOString().slice(0, 10),
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to record payment: ${res.status} ${res.statusText}`);
    }
  }

  revalidatePath('/');
}
