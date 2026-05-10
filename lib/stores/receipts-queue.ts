/**
 * Receipts queue client state — admin / super-admin queue UI.
 *
 * This store covers the *client-driven* parts of the receipts queue:
 * the active filter, the receipt currently selected for the detail modal,
 * and the set of receipt IDs the user has just confirmed (so the row can
 * render in an optimistic "pending confirmation" state until the server
 * round-trip lands or fails).
 *
 * Server data — the receipts themselves — is fetched via RSC + the
 * existing `secureFetch` wrapper and is never mirrored here. Slice 5
 * (WhatsApp ingestion) will wire the server queries against this store.
 *
 * Slice 1 ships the API surface only. Components in slices 3 and 5 will
 * consume it; do not import from `app/` yet.
 */

import { create } from 'zustand';

/**
 * Visible filter applied to the receipts list. Mirrors the filter chips
 * in the admin queue artboard. `'all'` matches the default landing view;
 * the rest map 1:1 to `Receipt.status` from docs/design-handoff/HANDOFF.md §4.
 */
export type ReceiptFilter =
  | 'all'
  | 'unmatched'
  | 'matched'
  | 'confirmed'
  | 'rejected_duplicate'
  | 'flagged';

interface ReceiptsQueueState {
  filter: ReceiptFilter;
  selectedReceiptId: string | null;
  /**
   * Receipt IDs that the user has confirmed locally and are waiting on a
   * server round-trip. Populate before the action call, clear (success
   * or failure) after the mutation resolves so the row leaves the
   * optimistic state.
   */
  optimisticallyConfirmed: ReadonlySet<string>;
  setFilter: (filter: ReceiptFilter) => void;
  selectReceipt: (id: string | null) => void;
  markOptimisticallyConfirmed: (id: string) => void;
  clearOptimisticallyConfirmed: (id: string) => void;
  reset: () => void;
}

/**
 * Build a fresh initial state. Returns a new `Set` each call so `reset()`
 * (and the initial store creation) never share a mutable reference,
 * which would otherwise let an accidental mutation leak across resets/tests.
 */
const initialState = (): Pick<
  ReceiptsQueueState,
  'filter' | 'selectedReceiptId' | 'optimisticallyConfirmed'
> => ({
  filter: 'all',
  selectedReceiptId: null,
  optimisticallyConfirmed: new Set<string>(),
});

export const useReceiptsQueueStore = create<ReceiptsQueueState>((set) => ({
  ...initialState(),
  setFilter: (filter) => set({ filter }),
  selectReceipt: (selectedReceiptId) => set({ selectedReceiptId }),
  markOptimisticallyConfirmed: (id) =>
    set((state) => {
      const next = new Set(state.optimisticallyConfirmed);
      next.add(id);
      return { optimisticallyConfirmed: next };
    }),
  clearOptimisticallyConfirmed: (id) =>
    set((state) => {
      if (!state.optimisticallyConfirmed.has(id)) return state;
      const next = new Set(state.optimisticallyConfirmed);
      next.delete(id);
      return { optimisticallyConfirmed: next };
    }),
  reset: () => set(initialState()),
}));
