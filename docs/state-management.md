# State management

This project has three places where state can live: **server data** (RSC), **forms** (`react-hook-form`), and **client UI state**. The rule for each is below.

> If you need to add new state and you can't immediately tell which bucket it belongs in, ask in the PR — picking wrong here is the most common source of bugs we ship.

---

## 1. Server data — Server Components only

All data the user is reading or editing lives on the server. Render it from React Server Components via `lib/data.ts` (mocks) or `lib/http.ts` + `secureFetch` (real backend). Mutate it via Server Actions in `app/**/actions.ts` using `secureAction`.

**Do not mirror server data into a client store.** If a list of payments lives in the database, the source of truth is the database — re-fetch it via the action's `revalidatePath` or `router.refresh()` rather than maintaining a parallel client copy.

---

## 2. Forms — `react-hook-form` + `zod`

Form fields, validation state, submit state, and success/error surfacing live inside `react-hook-form`'s scope (or the matching `useFormStatus` for Server Actions). The pattern is established in `app/(app)/account/change-password/` — copy it.

**Do not lift form state into Zustand.** Forms are local to a screen by definition.

---

## 3. Client UI state — `useState` vs Zustand

Two-tier rule.

### Tier A — `useState` (the default)

Use `useState` when **all three** of these are true:

1. The state is purely UI / ephemeral (open/closed, hover, focus, transient input pre-commit).
2. Only the component that owns it reads it (or its direct children via props).
3. Resetting it on unmount is correct behaviour — losing it doesn't lose user work.

Examples that qualify: a dropdown's open flag; a sort direction in a single table; a search-filter string scoped to one list view; a toggle between two view modes inside one chart component.

### Tier B — Zustand store

Promote state to a [Zustand](https://github.com/pmndrs/zustand) store under `lib/stores/` when **any** of these is true:

1. **Two or more sibling components read or write it** without a clean parent owner. (If a single parent can hold it as `useState` and prop-drill one level, do that — don't reach for a store yet.)
2. **It must survive a route change.** Closing the receipts-queue modal and re-opening it on a different page should still remember the selected receipt.
3. **You're tracking optimistic mutations** — slice-5 receipts confirm/reject is the canonical case: a `Set<ReceiptId>` of in-flight confirmations the row UI reads to render an optimistic state.
4. **The state is read from a callback that doesn't have access to React props** — e.g. a global keyboard shortcut, a service-worker message handler, a websocket reducer.

The store pattern itself is documented in [`lib/stores/README.md`](../lib/stores/README.md). One store per product domain; vanilla `create` + selector pattern; no provider trees.

### Stuff that lives nowhere

- **Theme** — owned by `next-themes` (`useTheme()`), not Zustand. It's a special case that ships with its own store and persistence.
- **Auth session** — read with `useSession()` from `next-auth/react` on the client, or `await auth()` on the server. Never duplicate into a store.

---

## Audit checklist for new code

When opening a PR that adds client state, the reviewer (or you, before requesting review) walks this list:

- [ ] Is this state actually client UI? (If it's data the server owns, refactor to RSC.)
- [ ] If it's a `useState`, does it satisfy all three Tier-A conditions above?
- [ ] If it's a Zustand store, is it scoped to one product domain? (One store per domain — don't create `app-store.ts`.)
- [ ] Are selectors narrow? (`useStore((s) => s.thing)`, not `useStore()` destructured.)
- [ ] No server data mirrored into the store?
- [ ] No form state in the store?

If any answer is "no" or "not sure," surface it in the PR description.

---

## Why two tiers?

Because most state is genuinely local. Reaching for a store for everything bloats the global surface area, makes testing harder (you need to reset state between tests), and obscures *which component actually depends on a value*. The two-tier rule keeps the global surface small enough that "what's in the store?" has a meaningful answer.
