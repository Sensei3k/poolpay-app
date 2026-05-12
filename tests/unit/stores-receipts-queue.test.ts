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
    expect(state.optimisticallyRejected.size).toBe(0);
    expect(state.optimisticallyFlagged.size).toBe(0);
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

  it('tracks optimistic rejections symmetrically with confirmations', () => {
    const {
      markOptimisticallyRejected,
      clearOptimisticallyRejected,
    } = useReceiptsQueueStore.getState();

    markOptimisticallyRejected('R-1');
    markOptimisticallyRejected('R-2');
    expect(useReceiptsQueueStore.getState().optimisticallyRejected.has('R-1')).toBe(true);
    expect(useReceiptsQueueStore.getState().optimisticallyRejected.has('R-2')).toBe(true);

    clearOptimisticallyRejected('R-1');
    expect(useReceiptsQueueStore.getState().optimisticallyRejected.has('R-1')).toBe(false);
    expect(useReceiptsQueueStore.getState().optimisticallyRejected.has('R-2')).toBe(true);
  });

  it('tracks optimistic flags symmetrically with confirmations', () => {
    const {
      markOptimisticallyFlagged,
      clearOptimisticallyFlagged,
    } = useReceiptsQueueStore.getState();

    markOptimisticallyFlagged('R-3');
    markOptimisticallyFlagged('R-4');
    expect(useReceiptsQueueStore.getState().optimisticallyFlagged.has('R-3')).toBe(true);
    expect(useReceiptsQueueStore.getState().optimisticallyFlagged.has('R-4')).toBe(true);

    clearOptimisticallyFlagged('R-3');
    expect(useReceiptsQueueStore.getState().optimisticallyFlagged.has('R-3')).toBe(false);
    expect(useReceiptsQueueStore.getState().optimisticallyFlagged.has('R-4')).toBe(true);
  });

  it('keeps the three optimistic sets independent', () => {
    const store = useReceiptsQueueStore.getState();
    store.markOptimisticallyConfirmed('R-1');
    store.markOptimisticallyRejected('R-2');
    store.markOptimisticallyFlagged('R-3');

    const after = useReceiptsQueueStore.getState();
    expect(after.optimisticallyConfirmed.has('R-1')).toBe(true);
    expect(after.optimisticallyConfirmed.has('R-2')).toBe(false);
    expect(after.optimisticallyRejected.has('R-2')).toBe(true);
    expect(after.optimisticallyRejected.has('R-1')).toBe(false);
    expect(after.optimisticallyFlagged.has('R-3')).toBe(true);
    expect(after.optimisticallyFlagged.has('R-1')).toBe(false);
  });

  it('returns the same set reference when clearing an id that was never marked (confirm)', () => {
    const before = useReceiptsQueueStore.getState().optimisticallyConfirmed;
    useReceiptsQueueStore.getState().clearOptimisticallyConfirmed('does-not-exist');
    const after = useReceiptsQueueStore.getState().optimisticallyConfirmed;
    expect(after).toBe(before);
  });

  it('returns the same set reference when clearing an id that was never marked (reject)', () => {
    const before = useReceiptsQueueStore.getState().optimisticallyRejected;
    useReceiptsQueueStore.getState().clearOptimisticallyRejected('nope');
    const after = useReceiptsQueueStore.getState().optimisticallyRejected;
    expect(after).toBe(before);
  });

  it('returns the same set reference when clearing an id that was never marked (flag)', () => {
    const before = useReceiptsQueueStore.getState().optimisticallyFlagged;
    useReceiptsQueueStore.getState().clearOptimisticallyFlagged('nope');
    const after = useReceiptsQueueStore.getState().optimisticallyFlagged;
    expect(after).toBe(before);
  });

  it('returns the same set reference when marking an id already in the set', () => {
    useReceiptsQueueStore.getState().markOptimisticallyConfirmed('R-9');
    const before = useReceiptsQueueStore.getState().optimisticallyConfirmed;
    useReceiptsQueueStore.getState().markOptimisticallyConfirmed('R-9');
    const after = useReceiptsQueueStore.getState().optimisticallyConfirmed;
    expect(after).toBe(before);
  });

  it('reset() restores all fields including the new optimistic sets', () => {
    const store = useReceiptsQueueStore.getState();
    store.setFilter('flagged');
    store.selectReceipt('R-9');
    store.markOptimisticallyConfirmed('R-9');
    store.markOptimisticallyRejected('R-10');
    store.markOptimisticallyFlagged('R-11');

    store.reset();

    const after = useReceiptsQueueStore.getState();
    expect(after.filter).toBe('all');
    expect(after.selectedReceiptId).toBeNull();
    expect(after.optimisticallyConfirmed.size).toBe(0);
    expect(after.optimisticallyRejected.size).toBe(0);
    expect(after.optimisticallyFlagged.size).toBe(0);
  });
});
