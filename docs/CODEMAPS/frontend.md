# Frontend Codemap

**Last Updated:** 2026-04-01

**Entry Points:**
- `app/page.tsx` — Dashboard page (server component, multi-group data orchestration)
- `app/admin/page.tsx` — Admin CRUD page (server component)
- `app/layout.tsx` — Root layout (theme provider, metadata)
- `app/error.tsx` — Error boundary

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        app/page.tsx                              │
│                   (Server Component)                             │
│    Fetches groups, members, cycles, payments in parallel        │
│    Routes via ?group= param for multi-group support             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    DashboardHeader  KpiStats   ActiveCycleCard
    (GroupSelector)  │
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

### Admin Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     app/admin/page.tsx                           │
│                   (Server Component)                             │
│        Fetches groups, members, cycles per selected group       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
      AdminNav    GroupTabs    CRUD Sections
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              GroupsSection   MembersSection   CyclesSection
                    │               │               │
                    ▼               ▼               ▼
               GroupForm      MemberForm      CycleForm
                    │
                    ▼
             DeleteConfirm
```

---

## Key Modules

### Pages

| Module | Purpose | Exports | Dependencies |
|--------|---------|---------|--------------|
| `app/page.tsx` | Dashboard orchestration (multi-group) | default (async component) | `lib/data`, `lib/utils`, all dashboard components |
| `app/admin/page.tsx` | Admin CRUD panel | default (async component) | `lib/data`, `lib/config`, admin components |
| `app/error.tsx` | Error boundary | default (client component) | Button, router |
| `app/layout.tsx` | Root layout | default | ThemeProvider, Geist font |
| `app/loading.tsx` | Loading skeleton (card-based) | default | Skeleton component |

### Dashboard Components

| Module | Purpose | Key Props | Usage |
|--------|---------|-----------|-------|
| `header.tsx` | Group header + date + cycle badge + group selector | `activeCycle, groups, selectedGroupId` | Rendered once per page |
| `group-selector.tsx` | Multi-group dropdown | `groups, selectedGroupId` | Inside header |
| `kpi-stats.tsx` | KPI tile row (3-column grid) | `totalKobo, collectedKobo, paidCount, totalMembers` | Above main content grid |
| `active-cycle-card.tsx` | Cycle info + recipient info | `summary: CycleSummary` | Left column, top |
| `collection-progress.tsx` | Progress bar + ₦ display | `collectedKobo, totalKobo` | Embedded in active-cycle-card |
| `outstanding-alert.tsx` | Alert banner for unpaid members | `statuses: MemberPaymentStatus[], contributionPerMemberKobo` | Left column, below cycle card |
| `payment-status-grid.tsx` | Table/chart toggle card | `statuses, cycleId, cycleNumber, contributionKobo, cycles, payments` | Right column |
| `sortable-payment-table.tsx` | Sortable member table with search | `statuses, cycleId, contributionKobo` | Inside payment-status-grid |
| `member-payment-row.tsx` | Single row in payment table (card-based) | `status, cycleId, contributionKobo, rowNumber` | Repeating rows in table |
| `cycle-performance-chart.tsx` | Per-cycle + cumulative chart | `cycles, payments, members` | Inside payment-status-grid (toggle target) |
| `payment-toggle-button.tsx` | Mark paid/unpaid action | `memberId, cycleId, hasPaid, contributionKobo` | Right edge of member-payment-row |
| `payment-status-badge.tsx` | Status badge (paid/outstanding) | `hasPaid, variant: 'row' \| 'tile'` | Inside member payment rows |
| `empty-states.tsx` | Server error, no data, waiting states | (various) | Conditional renders in page.tsx |
| `theme-toggle.tsx` | Light/dark mode toggle | (none) | Header area |

### Admin Components (`app/admin/_components/`)

| Module | Purpose |
|--------|---------|
| `admin-nav.tsx` | Navigation bar for admin section |
| `group-tabs.tsx` | Tab selector for switching between groups |
| `groups-section.tsx` | List and manage groups |
| `group-form.tsx` | Create/edit group form |
| `members-section.tsx` | List and manage members within a group |
| `member-form.tsx` | Create/edit member form |
| `cycles-section.tsx` | List and manage cycles within a group |
| `cycle-form.tsx` | Create/edit cycle form |
| `delete-confirm.tsx` | Confirmation dialog for destructive actions |

### Utilities

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `lib/utils.ts` | Formatting + data derivation | `cn()`, `formatNgn()`, `formatPhone()`, `formatPaymentDate()`, `padZero()`, `getMemberPaymentStatuses()`, `deriveCycleSummary()` |
| `lib/types.ts` | Domain types | `Group`, `Member`, `Payment`, `Cycle`, `MemberPaymentStatus`, `CycleSummary`, `ActionResult` |
| `lib/config.ts` | Environment configuration | `BACKEND_URL`, `ADMIN_TOKEN` |
| `lib/data.ts` | Data fetching layer | `fetchGroups()`, `fetchMembers()`, `fetchCycles()`, `fetchPayments()` |
| `lib/http.ts` | Shared HTTP wrapper | `apiFetch()`, `FetchResult<T>` |
| `lib/actions.ts` | Server actions (payment toggle) | `togglePayment()` |
| `lib/admin-actions.ts` | Server actions (admin CRUD) | Group/Member/Cycle create, update, delete |

---

## Data Flow

### Page Load (SSR) — Multi-Group

```
1. app/page.tsx mounts (server component)
2. Read ?group= search param
3. fetchGroups() → get all groups
4. Resolve selectedGroupId (param match → fallback to first active group)
5. Parallel fetches with groupId filter:
   - fetchMembers(groupId) → lib/data.ts → BACKEND_URL/api/members?groupId=…
   - fetchCycles(groupId) → lib/data.ts → BACKEND_URL/api/cycles?groupId=…
   - fetchPayments() → lib/data.ts → BACKEND_URL/api/payments
6. Derive computed state:
   - activeCycle = find cycle with status='active'
   - activeCycleSummary = deriveCycleSummary(cycle, members, payments)
   - paymentStatuses = getMemberPaymentStatuses(members, payments, cycleId, recipientId)
7. Render tree with props passed down
```

### Payment Toggle (Client-Side Action)

```
1. User clicks toggle button in MemberPaymentRow
2. PaymentToggleButton calls server action (lib/actions.ts)
3. Server action hits BACKEND_URL/api/payments endpoint
4. Page revalidates via revalidatePath('/')
5. Component tree re-renders with new payment data
```

### Admin CRUD Flow

```
1. Admin navigates to /admin
2. Server component fetches groups, members, cycles
3. GroupTabs allows switching between groups (?group= param)
4. CRUD forms call server actions in lib/admin-actions.ts
5. Server actions hit BACKEND_URL with ADMIN_TOKEN auth header
6. Page revalidates to reflect changes
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

- `app/page.tsx` and `app/admin/page.tsx` are server components → fetch directly in render
- Child components are client components only when they need:
  - Interactivity (`onClick`, form submits)
  - Hooks (`useState`, `useRouter`)
  - Theme awareness (`next-themes`)

### Loading States

Skeletons in `app/loading.tsx` use the **same layout** as actual content:
- KPI grid (3 columns)
- Cycle card skeleton
- Payment table skeleton

---

## External Dependencies

### UI Framework
- **next.js** (16) — React framework, SSR, App Router
- **react** (19) — UI primitives
- **tailwindcss** (v4) — Utility CSS
- **@base-ui/react** — Headless components
- **shadcn/ui** — Copy-paste component library
- **class-variance-authority** — Component variants

### Data Visualization
- **recharts** — Chart library (per-cycle + cumulative)
- **@visx** — Low-level visualization primitives

### Theme & Styling
- **next-themes** — Theme provider (light/dark mode)
- **clsx** — Conditional classnames
- **tailwind-merge** — Merge Tailwind classes

### Icons
- **lucide-react** — Icon library

### Testing
- **@playwright/test** — E2E test runner
- **vitest** — Unit test runner

---

## Related Areas

- **Backend**: Rust/SurrealDB (`poolpay-api`) — separate repo
- **Design System**: `/docs/design-system.md` — Token reference, component conventions
- **Testing**: Tests in `/tests/` directory — See test specs for E2E and unit coverage
- **Configuration**: `lib/config.ts` — Environment variable handling

---

## Common Tasks

### Add a New KPI Stat
1. Update `Member`, `Payment`, or `Cycle` in `lib/types.ts`
2. Add computation to `lib/utils.ts` (or derive in `app/page.tsx`)
3. Add new stat to `KpiStats` in `components/dashboard/kpi-stats.tsx`

### Add a New Chart or Toggle
1. Create component in `components/dashboard/`
2. Add toggle state to `PaymentStatusGrid` (or new top-level component)
3. Pass required data through props
4. Wire into `app/page.tsx` render tree
5. Add E2E test to `tests/dashboard.spec.ts`

### Add Admin CRUD for a New Entity
1. Add type to `lib/types.ts`
2. Add fetch function to `lib/data.ts`
3. Add server actions to `lib/admin-actions.ts`
4. Create form and section components in `app/admin/_components/`
5. Wire into `app/admin/page.tsx`

### Style a Component
1. Use design tokens in `app/globals.css` (`--background`, `--foreground`, etc.)
2. Build classes with `cn()` from `lib/utils.ts` + `clsx`
3. Use Tailwind utilities (`bg-card`, `text-foreground`, `border-border`)
4. No hardcoded colors — all derive from CSS custom properties
5. Test in both light and dark modes
