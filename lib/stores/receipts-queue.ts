/**
 * Receipts queue client state, admin / super-admin queue UI.
 *
 * This store covers the *client-driven* parts of the receipts queue:
 * the active filter, the receipt currently selected for the detail modal,
 * and the optimistic-pending sets for confirm / reject / flag actions
 * (so the row can render in a dimmed "in-flight" state until the server
 * round-trip lands or fails).
 *
 * Server data, the receipts themselves, is fetched via RSC + the
 * existing `secureFetch` wrapper and is never mirrored here. Slice 5
 * wires the action handlers that mark/clear the optimistic sets around
 * the `secureAction` round-trip; the modal and queue rows read the sets
 * to render the dimmed state.
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
  /** In-flight reject mutations, same semantics as the confirm set. */
  optimisticallyRejected: ReadonlySet<string>;
  /** In-flight flag mutations, same semantics as the confirm set. */
  optimisticallyFlagged: ReadonlySet<string>;
  setFilter: (filter: ReceiptFilter) => void;
  selectReceipt: (id: string | null) => void;
  markOptimisticallyConfirmed: (id: string) => void;
  clearOptimisticallyConfirmed: (id: string) => void;
  markOptimisticallyRejected: (id: string) => void;
  clearOptimisticallyRejected: (id: string) => void;
  markOptimisticallyFlagged: (id: string) => void;
  clearOptimisticallyFlagged: (id: string) => void;
  reset: () => void;
}

/**
 * Build a fresh initial state. Returns new `Set`s each call so `reset()`
 * (and the initial store creation) never share a mutable reference,
 * which would otherwise let an accidental mutation leak across resets/tests.
 */
const initialState = (): Pick<
  ReceiptsQueueState,
  | 'filter'
  | 'selectedReceiptId'
  | 'optimisticallyConfirmed'
  | 'optimisticallyRejected'
  | 'optimisticallyFlagged'
> => ({
  filter: 'all',
  selectedReceiptId: null,
  optimisticallyConfirmed: new Set<string>(),
  optimisticallyRejected: new Set<string>(),
  optimisticallyFlagged: new Set<string>(),
});

/**
 * Generic "add id, return new set" helper. Centralising the copy-on-write
 * shape avoids drift between the three optimistic action pairs.
 */
function addToSet(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (set.has(id)) return set;
  const next = new Set(set);
  next.add(id);
  return next;
}

/**
 * Generic "remove id, return new set" helper. Returns the same reference
 * when the id was not in the set, callers rely on identity stability so
 * unrelated subscribers don't re-render.
 */
function removeFromSet(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (!set.has(id)) return set;
  const next = new Set(set);
  next.delete(id);
  return next;
}

export const useReceiptsQueueStore = create<ReceiptsQueueState>((set) => ({
  ...initialState(),
  setFilter: (filter) => set({ filter }),
  selectReceipt: (selectedReceiptId) => set({ selectedReceiptId }),
  markOptimisticallyConfirmed: (id) =>
    set((state) => {
      const next = addToSet(state.optimisticallyConfirmed, id);
      if (next === state.optimisticallyConfirmed) return state;
      return { optimisticallyConfirmed: next };
    }),
  clearOptimisticallyConfirmed: (id) =>
    set((state) => {
      const next = removeFromSet(state.optimisticallyConfirmed, id);
      if (next === state.optimisticallyConfirmed) return state;
      return { optimisticallyConfirmed: next };
    }),
  markOptimisticallyRejected: (id) =>
    set((state) => {
      const next = addToSet(state.optimisticallyRejected, id);
      if (next === state.optimisticallyRejected) return state;
      return { optimisticallyRejected: next };
    }),
  clearOptimisticallyRejected: (id) =>
    set((state) => {
      const next = removeFromSet(state.optimisticallyRejected, id);
      if (next === state.optimisticallyRejected) return state;
      return { optimisticallyRejected: next };
    }),
  markOptimisticallyFlagged: (id) =>
    set((state) => {
      const next = addToSet(state.optimisticallyFlagged, id);
      if (next === state.optimisticallyFlagged) return state;
      return { optimisticallyFlagged: next };
    }),
  clearOptimisticallyFlagged: (id) =>
    set((state) => {
      const next = removeFromSet(state.optimisticallyFlagged, id);
      if (next === state.optimisticallyFlagged) return state;
      return { optimisticallyFlagged: next };
    }),
  reset: () => set(initialState()),
}));
