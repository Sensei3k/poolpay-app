# Client state stores

This directory holds the project's [Zustand](https://github.com/pmndrs/zustand) stores. Each file is one store, scoped to a single product domain.

## When does state belong here?

> Use Zustand only when state is genuinely shared, persisted, or survives navigation. Otherwise it stays in `useState`.

The full rule (and the `useState` audit checklist for new code) lives in [`docs/state-management.md`](../../docs/state-management.md). Read it before adding a new store.

## File-per-domain pattern

One store per product feature, named after the feature:

```
lib/stores/
├── README.md                     ← this file
├── add-admin-modal.ts            ← super-admin "Add admin" modal state
├── inbox-filter.ts               ← inbox segmented-control filter state
└── receipts-queue.ts             ← admin receipts queue
```

Avoid catch-all stores like `app-store.ts`. If two domains end up sharing structure, extract a shared `lib/stores/_helpers.ts` rather than merging stores.

## Pattern

Use the vanilla `create` + selector pattern. No provider trees — Zustand is a global singleton by design.

```ts
// lib/stores/example.ts
import { create } from 'zustand';

interface ExampleState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
```

Consume with a **narrow selector** so components only re-render when the slice they care about changes:

```tsx
// Good — only re-renders when count changes
const count = useExampleStore((s) => s.count);

// Bad — re-renders on every store mutation
const { count, increment } = useExampleStore();
```

For multi-value selections, return a stable shape with `useShallow`:

```tsx
import { useShallow } from 'zustand/react/shallow';

const { count, increment } = useExampleStore(
  useShallow((s) => ({ count: s.count, increment: s.increment })),
);
```

## What stores must NOT do

- **Never mirror server data.** Server data lives server-side. Render via React Server Components and the existing `secureFetch` / `secureAction` pattern. A Zustand store should hold only user-driven client state (filters, optimistic deltas, modal state, in-flight selection).
- **Never persist to `localStorage` without explicit review.** Persisted client state survives auth boundaries. If you need persistence, justify it in the PR description and audit for PII/session leakage first.
- **Never put a store inside a React component.** `create()` runs once at module load.

## Testing

Unit-test stores in isolation by importing them directly. Tests live in `tests/unit/` (one file per store, e.g. `tests/unit/stores-receipts-queue.test.ts`), not co-located:

```ts
// tests/unit/stores-example.test.ts
import { useExampleStore } from '@/lib/stores/example';

beforeEach(() => {
  useExampleStore.setState({ count: 0 });
});

it('increments', () => {
  useExampleStore.getState().increment();
  expect(useExampleStore.getState().count).toBe(1);
});
```

Reset state in `beforeEach` because stores persist across tests by default.
