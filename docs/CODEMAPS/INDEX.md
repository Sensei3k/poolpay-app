# Codemaps Index

Architectural maps of the poolpay-app codebase. Each map describes entry points, module structure, data flow, and component patterns for a specific area.

**Last Updated:** 2026-04-01

---

## Available Codemaps

### Frontend (`frontend.md`)

Covers the Next.js App Router frontend, dashboard components, admin panel, UI primitives, and client-side interactions.

**Key Files:**
- `app/page.tsx` — Dashboard orchestration (multi-group aware)
- `app/admin/page.tsx` — Admin CRUD panel
- `components/dashboard/*` — Dashboard components
- `components/ui/*` — shadcn/ui + custom primitives
- `lib/utils.ts` — Utility functions and data derivation

**Topics:**
- Page load data flow (SSR)
- Multi-group routing (`?group=` param)
- Component composition patterns
- Server vs. client component boundaries
- Admin CRUD (groups, members, cycles)
- Theme toggle and loading states
- Card-based payment table redesign
- Payment status badge (row and tile variants)
- Utility functions for formatting and data derivation

---

## Project Overview

```
poolpay-app/
├── Frontend (Next.js 16 App Router)
│   ├── Dashboard — See: frontend.md
│   └── Admin Panel — See: frontend.md (Admin section)
│
├── Backend API
│   └── Proxied via lib/data.ts + lib/http.ts to BACKEND_URL (Rust/SurrealDB)
│
├── Design System
│   └── See: docs/design-system.md (tokens, components, conventions)
│
└── Tests
    ├── Unit tests with Vitest (tests/unit/)
    └── E2E with Playwright (tests/*.spec.ts)
```

---

## Quick Links

- **README.md** — Quick start, scripts, environment variables, project structure
- **design-system.md** — Tokens, color space (OKLCH), component conventions
- **CONTRIBUTING.md** — Development workflow, testing, branching
- **RUNBOOK.md** — Deployment and operations checklist

---

## Data Model

All monetary amounts are stored in **kobo** (NGN × 100) as integers.

**Core Types:**
- `Group` — Savings group (name, status, description)
- `Member` — Group member (name, phone, status, position, groupId)
- `Cycle` — Savings cycle (recipientMemberId, status, contributionPerMember, groupId)
- `Payment` — Payment record (memberId, cycleId, amount, paymentDate)

**Derived Types:**
- `MemberPaymentStatus` — { member, hasPaid, payment }
- `CycleSummary` — { cycle, recipient, paidCount, totalMembers, collectedKobo }

---

## Testing

### Unit Tests (Vitest)

```bash
yarn test              # Run all unit tests
yarn test:unit:watch   # Watch mode
```

### E2E Tests (Playwright)

```bash
yarn test:e2e          # Run all tests
yarn test:e2e:ui       # Interactive UI mode
yarn test:e2e:report   # View HTML report
```

Test files: `tests/*.spec.ts` and `tests/pages/*.page.ts` (Page Object Model)

---

## Common Navigation

**Looking for...**

- How to add a new dashboard component? → `frontend.md` → Common Tasks
- Design tokens or styling conventions? → `design-system.md`
- Environment configuration? → `lib/config.ts` + `README.md` → Environment Variables
- Data fetching? → `frontend.md` → Data Flow + `lib/data.ts`
- Server actions (payment toggle)? → `lib/actions.ts` + `frontend.md` → Payment Toggle flow
- Admin CRUD? → `app/admin/` + `lib/admin-actions.ts`
- Component testing? → `tests/dashboard.spec.ts` + `frontend.md` → Testing
