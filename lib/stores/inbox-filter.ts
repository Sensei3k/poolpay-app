/**
 * Inbox filter, member /inbox surface.
 *
 * The inbox header in the design exposes filter chips ("All", "Unread",
 * "Mentions") that survive client-side navigation: a member can drop into
 * a pool detail and back without losing their filter. That cross-route
 * persistence is the qualifier from `docs/state-management.md` §3 Tier B
 * point 2, Zustand owns it instead of `useState`.
 *
 * The store is intentionally narrow: one filter slug, two actions. Any
 * further inbox client state (selected row, optimistic mark-read) earns a
 * second store under its own domain rather than being bundled here.
 */

import { create } from 'zustand';

/**
 * Visible chip on the inbox header. `'all'` is the default landing view;
 * `'unread'` shows only items where `readAt === undefined`; `'mentions'`
 * filters to admin/system messages explicitly addressed to the user
 * (matching the `admin_message` kind).
 */
export type InboxFilter = 'all' | 'unread' | 'mentions';

interface InboxFilterState {
  filter: InboxFilter;
  setFilter: (filter: InboxFilter) => void;
  reset: () => void;
}

const DEFAULT_FILTER: InboxFilter = 'all';

export const useInboxFilterStore = create<InboxFilterState>((set) => ({
  filter: DEFAULT_FILTER,
  setFilter: (filter) => set({ filter }),
  reset: () => set({ filter: DEFAULT_FILTER }),
}));
