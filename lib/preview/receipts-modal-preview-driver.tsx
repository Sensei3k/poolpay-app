'use client';

import { useEffect } from 'react';
import { ReceiptsView, type ReceiptsViewProps } from '@/components/admin/receipts-view';
import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';

export type ReceiptsModalPreviewState =
  | 'modal-default'
  | 'modal-rejecting'
  | 'modal-flagging'
  | 'modal-confirming';

export interface ReceiptsModalPreviewDriverProps extends ReceiptsViewProps {
  /**
   * Which post-mount modal state to seed for the screenshot matrix.
   * The driver writes directly to the receipts-queue store and (for the
   * reason-prompt variants) clicks the matching footer button so the
   * modal's local `reasonPrompt` state advances.
   */
  state: ReceiptsModalPreviewState;
  /**
   * Receipt id to focus. Must match a row in `rows` for the modal to
   * mount (the view component looks up the row via `Array.find`).
   */
  receiptId: string;
}

/**
 * Dev-only preview driver. Mounts the production `ReceiptsView` so the
 * screenshot matrix captures the real surface, then seeds the receipts
 * queue store + (for reject/flag) clicks the modal's footer button so
 * its local reason-prompt state flips before the screenshot fires.
 *
 * This component is the seam that lets the matrix capture modal states
 * without modifying any production component code.
 */
export function ReceiptsModalPreviewDriver({
  state,
  receiptId,
  rows,
  aggregates,
  groupCount,
}: ReceiptsModalPreviewDriverProps) {
  // Reset + seed once on mount so navigating between preview routes
  // doesn't inherit leaked store state. The cleanup also resets so the
  // store stays clean between captures.
  useEffect(() => {
    const store = useReceiptsQueueStore.getState();
    store.reset();

    if (state === 'modal-confirming') {
      // Optimistic confirm path leaves the modal closed and the row
      // dimmed in the queue table behind it.
      store.markOptimisticallyConfirmed(receiptId);
      return () => {
        useReceiptsQueueStore.getState().reset();
      };
    }

    store.selectReceipt(receiptId);

    if (state === 'modal-rejecting' || state === 'modal-flagging') {
      // The reason form is driven by component-local state in
      // `<ModalReceiptDetail>`, so we click the matching footer button
      // after a microtask to let the modal render its default footer
      // first. The button labels are stable from the production code.
      const buttonText =
        state === 'modal-rejecting'
          ? 'Reject as duplicate'
          : 'Mark as suspicious';
      // Two RAFs: the first lets React commit the modal; the second
      // lets the modal's effects (Escape listener etc.) settle before
      // we synthesise the click.
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          const buttons = Array.from(
            document.querySelectorAll<HTMLButtonElement>('button[type="button"]'),
          );
          const target = buttons.find((b) => b.textContent?.trim() === buttonText);
          if (target) target.click();
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => {
        cancelAnimationFrame(raf1);
        useReceiptsQueueStore.getState().reset();
      };
    }

    return () => {
      useReceiptsQueueStore.getState().reset();
    };
  }, [state, receiptId]);

  return (
    <ReceiptsView rows={rows} aggregates={aggregates} groupCount={groupCount} />
  );
}
