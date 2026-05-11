/**
 * Shared constants and result types for the receipts server actions.
 *
 * This module is intentionally split out from `./receipts.ts` because that
 * file carries the `'use server'` directive, and Next 16 rejects any
 * non-async-function export from a server-action module at build time
 * (the dev/build pipeline enforces it; vitest does not, which is how the
 * split got missed in slice 5 FE).
 *
 * Keep this file directive-free so constants/types stay importable from
 * both server and client components.
 */

/**
 * Backend contract (poolpay-api PR #46):
 *   PATCH /api/receipts/:id
 *     body: { action: 'confirm' | 'reject' | 'flag', reason?: string }
 *     200 -> success
 *     400 -> missing/invalid action (validation)
 *     403 -> scoped-admin acting on a receipt outside their groups
 *     409 -> double-confirm (race against another admin or polling client)
 *
 * Reason is capped at 280 chars on the backend; we mirror that here as a
 * client-side guard so users see the failure before the round-trip.
 */
export const RECEIPT_REASON_MAX_LENGTH = 280;

export type ReceiptActionErrorCode =
  | 'validation' // 400
  | 'forbidden' // 403
  | 'conflict' // 409, already actioned
  | 'service' // 5xx
  | 'backend_unavailable'; // transport failure (status undefined)

export type ReceiptActionResult =
  | { ok: true }
  | { ok: false; code: ReceiptActionErrorCode; message?: string };
