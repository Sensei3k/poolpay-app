'use server';

import { revalidatePath } from 'next/cache';
import {
  BackendUnauthorizedError,
  secureAction,
} from '@/lib/auth/backend-fetch';

/**
 * Backend contract (poolpay-api PR #46):
 *   PATCH /api/receipts/:id
 *     body: { action: 'confirm' | 'reject' | 'flag', reason?: string }
 *     200 → success
 *     400 → missing/invalid action (validation)
 *     403 → scoped-admin acting on a receipt outside their groups
 *     409 → double-confirm (race against another admin or polling client)
 *
 * Legacy POST /api/admin/receipts/:id/{confirm,reject} routes still exist
 * but are deprecated; slice 6 removes them after the FE migration lands.
 *
 * Reason is capped at 280 chars on the backend; we mirror that here as a
 * client-side guard so users see the failure before the round-trip.
 */
export const RECEIPT_REASON_MAX_LENGTH = 280;

export type ReceiptActionErrorCode =
  | 'validation' // 400
  | 'forbidden' // 403
  | 'conflict' // 409 — already actioned
  | 'service' // 5xx
  | 'backend_unavailable'; // transport failure (status undefined)

export type ReceiptActionResult =
  | { ok: true }
  | { ok: false; code: ReceiptActionErrorCode; message?: string };

type ReceiptActionKind = 'confirm' | 'reject' | 'flag';

interface PatchReceiptBody {
  action: ReceiptActionKind;
  reason?: string;
}

/**
 * Normalise the caller-supplied reason: trim whitespace, clamp to the
 * 280-char backend cap, and drop empty strings so the BE sees `undefined`
 * rather than `""` (which would fail its `non_empty` validator on
 * reject/flag).
 */
function normaliseReason(reason: string | undefined): string | undefined {
  if (reason === undefined) return undefined;
  const trimmed = reason.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.slice(0, RECEIPT_REASON_MAX_LENGTH);
}

/**
 * Single round-trip helper used by all three callers below. Centralising
 * the status→code mapping prevents drift between actions when the BE
 * adds new error codes.
 */
async function patchReceipt(
  id: string,
  body: PatchReceiptBody,
): Promise<ReceiptActionResult> {
  try {
    const result = await secureAction<undefined>(`/api/receipts/${id}`, {
      method: 'PATCH',
      body,
    });

    if (result.success) {
      // Revalidate both the cross-group queue and the per-group receipts
      // tab. The polling hook keeps the page fresh on its own, but the
      // explicit revalidate makes the post-action redraw immediate when
      // the operator stays on the same route.
      revalidatePath('/admin/receipts');
      revalidatePath('/admin/groups/[poolId]', 'page');
      revalidatePath('/sys/receipts');
      return { ok: true };
    }

    // Transport collapsed into the failure tuple (no status). Match the
    // change-password action's mapping so callers render the same
    // "couldn't reach the server" copy.
    if (result.status === undefined) {
      return { ok: false, code: 'backend_unavailable', message: result.error };
    }
    if (result.status === 403) {
      return { ok: false, code: 'forbidden', message: result.error };
    }
    if (result.status === 409) {
      return { ok: false, code: 'conflict', message: result.error };
    }
    if (result.status >= 400 && result.status < 500) {
      return { ok: false, code: 'validation', message: result.error };
    }
    return { ok: false, code: 'service', message: result.error };
  } catch (err) {
    if (err instanceof BackendUnauthorizedError) {
      throw err;
    }
    return { ok: false, code: 'backend_unavailable' };
  }
}

/**
 * Confirm a receipt — moves status to `confirmed`, paints the matched
 * Contribution as `paid`, and creates a `receipt_confirmed` inbox item
 * for the member. Reason is optional for confirm (BE accepts no reason).
 */
export async function confirmReceiptAction(
  id: string,
  reason?: string,
): Promise<ReceiptActionResult> {
  return patchReceipt(id, {
    action: 'confirm',
    ...(normaliseReason(reason) ? { reason: normaliseReason(reason) } : {}),
  });
}

/**
 * Reject a receipt as a duplicate. Reason is required — the BE rejects
 * empty/missing reason on this action. The caller (the modal) enforces
 * the same constraint before submit so we never round-trip a known-bad
 * request, but we re-check here as a defence in depth.
 */
export async function rejectReceiptAction(
  id: string,
  reason: string,
): Promise<ReceiptActionResult> {
  const cleaned = normaliseReason(reason);
  if (!cleaned) {
    return {
      ok: false,
      code: 'validation',
      message: 'A reason is required to reject a receipt.',
    };
  }
  return patchReceipt(id, { action: 'reject', reason: cleaned });
}

/**
 * Flag a receipt as suspicious. Same required-reason semantics as
 * `rejectReceiptAction` — the BE enforces a non-empty reason so
 * audit log entries have provenance.
 */
export async function flagReceiptAction(
  id: string,
  reason: string,
): Promise<ReceiptActionResult> {
  const cleaned = normaliseReason(reason);
  if (!cleaned) {
    return {
      ok: false,
      code: 'validation',
      message: 'A reason is required to flag a receipt.',
    };
  }
  return patchReceipt(id, { action: 'flag', reason: cleaned });
}
