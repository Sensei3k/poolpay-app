# PoolPay

Admin dashboard for an Ajo (rotating savings group) management system. Surfaces active cycle progress, member payment status, outstanding balances, and provides full CRUD for groups, members, and cycles.

Built with Next.js 16 App Router · TypeScript strict · Tailwind v4 · shadcn/ui · Yarn.

---

## Quick Start

```bash
yarn install
cp .env.example .env.local   # edit values as needed
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) (or whichever port Next.js assigns).

---

## Authentication (FE-1)

Sign-in is scaffolded with NextAuth v5 against the `poolpay-api` Credentials endpoint. Set these before running `yarn dev`:

| Var | Purpose |
|---|---|
| `BACKEND_URL` | Base URL of `poolpay-api`. |
| `NEXTAUTH_BACKEND_SECRET` | HMAC secret shared with the backend. Must match byte-for-byte and be ≥ 32 bytes. Generate with `openssl rand -hex 32`. |
| `NEXTAUTH_SECRET` | NextAuth's own cookie secret. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Required for callback URL resolution on non-local deploys. |

Visit `/signin` to log in. Contract lives in the Digital Brain vault: `wiki/poolpay/architecture/auth-api-contract.md`.

> Note: the auto-generated "Environment Variables" table below is not yet updated for auth-related vars. Treat this Authentication section as the authoritative source for auth configuration until the generator is updated (and `ADMIN_TOKEN` is fully removed in FE-2).

---

<!-- AUTO-GENERATED -->
## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Production build with type checking |
| `yarn start` | Start production server (requires `yarn build` first) |
| `yarn lint` | Run ESLint across the project |
| `yarn test` | Run all unit tests (Vitest) |
| `yarn test:unit` | Run unit tests (alias for `yarn test`) |
| `yarn test:unit:watch` | Run unit tests in watch mode |
| `yarn test:e2e` | Run Playwright E2E tests (requires dev server running) |
| `yarn test:e2e:ui` | Run E2E tests in interactive UI mode |
| `yarn test:e2e:report` | Open last Playwright HTML report |
<!-- /AUTO-GENERATED -->

---

<!-- AUTO-GENERATED -->
## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for internal `/api/*` fetches. Required in production/preview deployments. | `https://your-app.vercel.app` |
| `BACKEND_URL` | No | URL of the Rust/SurrealDB backend. Defaults to `http://localhost:8080`. | `http://localhost:8080` |
| `ADMIN_TOKEN` | Yes (for admin) | Token for admin CRUD operations. Must match the backend `ADMIN_TOKEN`. | (secret) |
| `FETCH_TIMEOUT_MS` | No | Timeout in ms for GET backend fetches. Defaults to `5000`. | `5000` |
| `MUTATION_TIMEOUT_MS` | No | Timeout in ms for POST/PATCH/DELETE backend calls. Defaults to `10000`. | `10000` |
<!-- /AUTO-GENERATED -->

---

## Project Structure

```
poolpay-app/
├── app/
│   ├── layout.tsx              # Root layout — Geist font, dark mode, metadata
│   ├── page.tsx                # Dashboard page — server component, fetches + composes
│   ├── loading.tsx             # Loading skeleton with card layout
│   ├── error.tsx               # Error boundary for dashboard
│   ├── not-found.tsx           # 404 page — branded error with <h1> heading for a11y
│   ├── globals.css             # Tailwind v4 + shadcn tokens + Ajo accent colours
│   ├── api/
│   │   ├── members/route.ts    # GET /api/members  → Member[]
│   │   ├── cycles/route.ts     # GET /api/cycles   → Cycle[]
│   │   └── payments/route.ts   # GET /api/payments → Payment[]
│   └── admin/
│       ├── layout.tsx          # Admin layout
│       ├── page.tsx            # Admin page — group/member/cycle CRUD
│       └── _components/        # Admin-specific components
│           ├── admin-nav.tsx
│           ├── group-tabs.tsx
│           ├── groups-section.tsx
│           ├── group-form.tsx
│           ├── members-section.tsx
│           ├── member-form.tsx
│           ├── cycles-section.tsx
│           ├── cycle-form.tsx
│           └── delete-confirm.tsx
│
├── components/
│   ├── dashboard/
│   │   ├── header.tsx                    # Group name, date, active cycle badge
│   │   ├── group-selector.tsx            # Multi-group dropdown selector
│   │   ├── active-cycle-card.tsx         # Cycle info + recipient
│   │   ├── collection-progress.tsx       # ₦ amounts + progress bar
│   │   ├── payment-status-grid.tsx       # Table/chart toggle card
│   │   ├── cycle-performance-chart.tsx   # Per-cycle + cumulative chart toggle
│   │   ├── sortable-payment-table.tsx    # Sortable table with member search
│   │   ├── member-payment-row.tsx        # Card-based layout with phone formatting + date display
│   │   ├── kpi-stats.tsx                 # KPI stat tiles
│   │   ├── payment-toggle-button.tsx     # Server action toggle for payment status
│   │   ├── outstanding-alert.tsx         # role=alert listing unpaid members
│   │   ├── payment-status-badge.tsx      # Status badge (paid/outstanding)
│   │   ├── empty-states.tsx              # Empty/error state components
│   │   └── theme-toggle.tsx              # Light/dark mode toggle
│   ├── theme-provider.tsx                # next-themes wrapper
│   └── ui/                               # shadcn/ui primitives (auto-generated)
│
├── lib/
│   ├── types.ts        # Domain types: Group, Member, Payment, Cycle, derived view types
│   ├── utils.ts        # Formatting + data derivation (formatNgn, getMemberPaymentStatuses, deriveCycleSummary)
│   ├── config.ts       # Configuration (BACKEND_URL, ADMIN_TOKEN)
│   ├── data.ts         # Data fetching layer (proxies to Rust/SurrealDB backend)
│   ├── http.ts         # Shared HTTP fetch wrapper with timeout and error handling
│   ├── actions.ts      # Server actions (payment toggle)
│   └── admin-actions.ts # Server actions (group/member/cycle CRUD)
│
└── tests/
    ├── pages/
    │   ├── dashboard.page.ts  # POM for dashboard
    │   └── admin.page.ts      # POM for admin
    ├── dashboard.spec.ts      # E2E — dashboard flows
    ├── admin.spec.ts          # E2E — admin CRUD flows
    ├── regression.spec.ts     # E2E — business logic regression
    ├── visual.spec.ts         # Visual regression (screenshots)
    ├── not-found.spec.ts      # E2E — 404 page
    └── unit/                  # Vitest unit tests
```

---

## Data Model

All monetary amounts are stored in **kobo** (NGN × 100) as integers to avoid floating-point errors. Use `formatNgn(kobo)` to display as `₦10,000`.

**Core entities:** Group → Members → Cycles → Payments. The dashboard supports multiple groups via a `?group=` query parameter. Admin CRUD is available at `/admin`.

---

## Accessibility

All components meet **WCAG 2.2 AA**. Tested with Playwright E2E tests:

```bash
yarn test:e2e
```

Key requirements met:
- Semantic `<table>` for tabular data
- `role="progressbar"` with aria attrs for collection progress
- `role="alert"` on outstanding members banner
- `<h1>` heading on 404 page for screen reader navigation
- Status badges use text (not colour alone)
- Visible focus rings and full keyboard navigation
- Proper dark mode contrast in all states
