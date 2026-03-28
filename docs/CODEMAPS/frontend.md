# Frontend Codemap

**Last Updated:** 2026-03-28

**Entry Points:**
- `app/page.tsx` — Dashboard page (server component, data orchestration)
- `app/layout.tsx` — Root layout (theme provider, metadata)
- `app/error.tsx` — Error boundary

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        app/page.tsx                              │
│                   (Server Component)                             │
│          Fetches members, cycles, payments in parallel          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    DashboardHeader  KpiStats   ActiveCycleCard
                     │
                     ├──────────────┬───────────────────┐
                     ▼              ▼                   ▼
            PaymentStatusGrid  OutstandingAlert  (Theme Toggle)
                     │
        ┌────────────┤
        ▼            ▼
  Sortable Table  Chart Toggle
        │
        ▼
  MemberPaymentRow (repeating)
        │
   ├─ Payment Badge (icon variant)
   ├─ Phone formatter
   ├─ Payment Date display
   └─ PaymentToggleButton
```

---

## Key Modules

### Pages

| Module | Purpose | Exports | Dependencies |
|--------|---------|---------|--------------|
| `app/page.tsx` | Dashboard orchestration | default (async component) | `lib/data`, `lib/utils`, all dashboard components |
| `app/error.tsx` | Error boundary | default (client component) | Button, router |
| `app/layout.tsx` | Root layout | default | ThemeProvider, Geist font |
| `app/loading.tsx` | Loading skeleton (card-based) | default | Skeleton component |

### Dashboard Components

| Module | Purpose | Key Props | Usage |
|--------|---------|-----------|-------|
| `header.tsx` | Group header + date + cycle badge | `activeCycle: CycleSummary \| null` | Rendered once per page |
| `kpi-stats.tsx` | KPI tile row (3-column grid) | `totalKobo, collectedKobo, paidCount, totalMembers` | Above main content grid |
| `active-cycle-card.tsx` | Cycle info + recipient info | `summary: CycleSummary` | Left column, top |
| `collection-progress.tsx` | Progress bar + ₦ display | `collectedKobo, totalKobo` | Embedded in active-cycle-card |
| `outstanding-alert.tsx` | Alert banner for unpaid members | `statuses: MemberPaymentStatus[], contributionPerMemberKobo` | Left column, below cycle card |
| `payment-status-grid.tsx` | Table/chart toggle card | `statuses, cycleId, cycleNumber, contributionKobo, cycles, payments` | Right column |
| `sortable-payment-table.tsx` | Sortable member table with search | `statuses, cycleId, contributionKobo` | Inside payment-status-grid |
| `member-payment-row.tsx` | Single row in payment table (card-based) | `status, cycleId, contributionKobo, rowNumber` | Repeating rows in table |
| `cycle-performance-chart.tsx` | Per-cycle + cumulative chart | `cycles, payments, members` | Inside payment-status-grid (toggle target) |
| `payment-toggle-button.tsx` | Mark paid/unpaid action | `memberId, cycleId, hasPaid, contributionKobo` | Right edge of member-payment-row |
| `theme-toggle.tsx` | Light/dark mode toggle | (none) | Header area |

### UI Primitives

| Module | Purpose | Variants | Base |
|--------|---------|----------|------|
| `ui/button.tsx` | Action button | `variant`, `size` | shadcn/ui (Base UI) |
| `ui/badge.tsx` | Status indicator | Inline flex with color variants | shadcn/ui |
| `ui/card.tsx` | Container surface | Semantic wrapper | shadcn/ui |
| `ui/table.tsx` | Semantic table markup | Thead, Tbody, Tr, Td | shadcn/ui |
| `ui/progress.tsx` | Visual progress indicator | `value`, `max` | shadcn/ui + CVA |
| `ui/chart.tsx` | Victory chart wrapper | Victory re-exports | shadcn/ui + Victory |
| `ui/dropdown-menu.tsx` | Dropdown menu shell | Popover-based | Base UI |
| `ui/tooltip.tsx` | Hover tooltip | Popover-based | Base UI |
| `ui/separator.tsx` | Visual divider | `orientation` | shadcn/ui |
| `ui/skeleton.tsx` | Loading placeholder | Pulse animation | shadcn/ui |

### Dashboard Specific Components

| Module | Purpose | Props | Usage |
|--------|---------|-------|-------|
| `dashboard/payment-status-badge.tsx` | Status badge (paid/outstanding) | `hasPaid`, `variant: 'row' \| 'tile'` | Inside member payment rows and detail overlays |

### Utilities

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `lib/utils.ts` | Formatting + data derivation | `cn()`, `formatNgn()`, `formatPhone()`, `formatPaymentDate()`, `padZero()`, `getMemberPaymentStatuses()`, `deriveCycleSummary()` |
| `lib/types.ts` | Domain types | `Member`, `Payment`, `Cycle`, `MemberPaymentStatus`, `CycleSummary` |
| `lib/config.ts` | Environment configuration | `BACKEND_URL`, `NEXT_PUBLIC_BASE_URL` |

---

## Data Flow

### Page Load (SSR)

```
1. app/page.tsx mounts (server component)
2. Parallel fetches:
   - fetchMembers() → lib/data.ts → BACKEND_URL/api/members
   - fetchCycles() → lib/data.ts → BACKEND_URL/api/cycles
   - fetchPayments() → lib/data.ts → BACKEND_URL/api/payments
3. Derive computed state:
   - activeCycle = find cycle with status='active'
   - activeCycleSummary = deriveCycleSummary(cycle, members, payments)
   - paymentStatuses = getMemberPaymentStatuses(members, payments, cycleId, recipientId)
4. Render tree with props passed down
```

### Payment Toggle (Client-Side Action)

```
1. User clicks toggle button in MemberPaymentRow
2. PaymentToggleButton calls server action (lib/actions.ts)
3. Server action hits BACKEND_URL/api/payments endpoint
4. Page revalidates via revalidatePath('/')
5. Component tree re-renders with new payment data
```

### Theme Toggle

```
1. User clicks theme-toggle.tsx
2. next-themes updates localStorage('theme')
3. HTML element class updated (.dark added/removed)
4. Tailwind @media(prefers-color-scheme) + .dark CSS apply
5. All components re-render with new color tokens
```

---

## Component Composition Patterns

### Composition Over Props Drilling

Dashboard uses **slot-based composition** for empty states:

```tsx
// Bad: too many props
<Empty
  title="404"
  description="..."
  icon={GhostIcon}
  buttons={[...]}
/>

// Good: semantic slots
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><Ghost /></EmptyMedia>
    <EmptyTitle>404</EmptyTitle>
    <EmptyDescription>...</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    {/* Action buttons */}
  </EmptyContent>
</Empty>
```

The `Empty` primitive uses **data-slot attributes** for styling instead of prop cascading.

### Server Components for Data Fetching

- `app/page.tsx` is a server component → fetches directly in render
- Child components are client components only when they need:
  - Interactivity (`onClick`, form submits)
  - Hooks (`useState`, `useRouter`)
  - Theme awareness (`next-themes`)

This reduces JavaScript sent to the client.

### Loading States

Skeletons in `app/loading.tsx` use the **same layout** as actual content:
- KPI grid (3 columns)
- Cycle card skeleton
- Payment table skeleton

When loading completes, actual content swaps in without layout shift.

---

## External Dependencies

### UI Framework
- **next.js** (16) — React framework, SSR, App Router
- **react** (19) — UI primitives
- **tailwindcss** (v4) — Utility CSS
- **@headlessui/react** / **@base-ui-components/react** — Headless components
- **shadcn/ui** — Copy-paste component library
- **class-variance-authority** — Component variants

### Data Visualization
- **victory** — Chart library (per-cycle + cumulative)
- **@recharts/recharts** — Alternative charting (unused, from scaffolding)

### Theme & Styling
- **next-themes** — Theme provider (light/dark mode)
- **clsx** — Conditional classnames
- **tailwind-merge** — Merge Tailwind classes

### Icons
- **lucide-react** — Icon library

### Testing
- **@playwright/test** — E2E test runner
- **zod** — Type validation (testing only)

### Utilities
- **date-fns** — Date formatting (if used; otherwise native toLocaleDateString)

---

## Related Areas

- **Backend**: `/backend` (Rust/SurrealDB) — See `/docs/backend.md`
- **Design System**: `/docs/design-system.md` — Token reference, component conventions
- **Testing**: Tests in `/tests/` directory — See test specs for E2E coverage
- **Configuration**: `lib/config.ts` — Environment variable handling

---

## Common Tasks

### Add a New KPI Stat
1. Update `Member`, `Payment`, or `Cycle` in `lib/types.ts`
2. Add computation to `lib/utils.ts` (or derive in `app/page.tsx`)
3. Add new stat to `KpiStats` in `components/dashboard/kpi-stats.tsx`
4. Update `lib/mock-data.ts` for local testing

### Add a New Chart or Toggle
1. Create component in `components/dashboard/`
2. Add toggle state to `PaymentStatusGrid` (or new top-level component)
3. Pass required data through props
4. Wire into `app/page.tsx` render tree
5. Add E2E test to `tests/dashboard.spec.ts`

### Style a Component
1. Use design tokens in `app/globals.css` (`--background`, `--foreground`, etc.)
2. Build classes with `cn()` from `lib/utils.ts` + `clsx`
3. Use Tailwind utilities (`bg-card`, `text-foreground`, `border-border`)
4. No hardcoded colors — all derive from CSS custom properties
5. Test in both light and dark modes

### Debugging

```bash
# Build for production
yarn build

# Check for type errors
tsc --noEmit

# Run E2E tests with UI
yarn test:e2e:ui

# Run specific test
yarn test:e2e -- tests/dashboard.spec.ts

# Check generated CSS
# Look at .next/static/css/ after yarn build
```

---

## Notes

- **PaymentStatusBadge** supports two variants: `row` (compact, used in table) and `tile` (full-height, used in detail overlay)
- **Formatters** (`formatPhone`, `formatPaymentDate`, `padZero`) are exported from `lib/utils.ts` for reuse across components
- **Payment toggle** is a server action, not a client-side mutation — ensures data consistency with backend
- **Chart rendering** is lazy-loaded inside `PaymentStatusGrid` toggle to avoid rendering both table and chart simultaneously
- **Loading skeleton** (`app/loading.tsx`) mimics the card-based layout to prevent layout shift during hydration
