import { beforeEach, describe, expect, it } from 'vitest';
import { useReceiptsQueueStore } from '@/lib/stores/receipts-queue';

describe('useReceiptsQueueStore', () => {
  beforeEach(() => {
    useReceiptsQueueStore.getState().reset();
  });

  it('starts with the default filter and no selection', () => {
    const state = useReceiptsQueueStore.getState();
    expect(state.filter).toBe('all');
    expect(state.selectedReceiptId).toBeNull();
    expect(state.optimisticallyConfirmed.size).toBe(0);
  });

  it('updates the active filter', () => {
    useReceiptsQueueStore.getState().setFilter('unmatched');
    expect(useReceiptsQueueStore.getState().filter).toBe('unmatched');
  });

  it('selects and clears the receipt currently in the modal', () => {
    useReceiptsQueueStore.getState().selectReceipt('R-7782');
    expect(useReceiptsQueueStore.getState().selectedReceiptId).toBe('R-7782');
    useReceiptsQueueStore.getState().selectReceipt(null);
    expect(useReceiptsQueueStore.getState().selectedReceiptId).toBeNull();
  });

  it('tracks optimistic confirmations and clears them by id', () => {
    const { markOptimisticallyConfirmed, clearOptimisticallyConfirmed } =
      useReceiptsQueueStore.getState();

    markOptimisticallyConfirmed('R-1');
    markOptimisticallyConfirmed('R-2');
    expect(useReceiptsQueueStore.getState().optimisticallyConfirmed.has('R-1')).toBe(true);
    expect(useReceiptsQueueStore.getState().optimisticallyConfirmed.has('R-2')).toBe(true);

    clearOptimisticallyConfirmed('R-1');
    expect(useReceiptsQueueStore.getState().optimisticallyConfirmed.has('R-1')).toBe(false);
    expect(useReceiptsQueueStore.getState().optimisticallyConfirmed.has('R-2')).toBe(true);
  });

  it('returns the same set reference when clearing an id that was never marked', () => {
    const before = useReceiptsQueueStore.getState().optimisticallyConfirmed;
    useReceiptsQueueStore.getState().clearOptimisticallyConfirmed('does-not-exist');
    const after = useReceiptsQueueStore.getState().optimisticallyConfirmed;
    expect(after).toBe(before);
  });

  it('reset() restores all fields', () => {
    const store = useReceiptsQueueStore.getState();
    store.setFilter('flagged');
    store.selectReceipt('R-9');
    store.markOptimisticallyConfirmed('R-9');

    store.reset();

    const after = useReceiptsQueueStore.getState();
    expect(after.filter).toBe('all');
    expect(after.selectedReceiptId).toBeNull();
    expect(after.optimisticallyConfirmed.size).toBe(0);
  });
});
