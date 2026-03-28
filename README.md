# Circle Dashboard

Read-only admin dashboard for an Ajo (rotating savings group) management system. Surfaces active cycle progress, member payment status, and outstanding balances to the group organiser.

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

<!-- AUTO-GENERATED -->
## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Production build with type checking |
| `yarn start` | Start production server (requires `yarn build` first) |
| `yarn lint` | Run ESLint across the project |
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
| `BACKEND_URL` | No | URL of the Rust/SurrealDB backend. Defaults to `http://localhost:8080` in development. | `http://localhost:8080` |
<!-- /AUTO-GENERATED -->

---

## Project Structure

```
circle-dashboard/
├── app/
│   ├── layout.tsx              # Root layout — Geist font, dark mode, metadata
│   ├── page.tsx                # Dashboard page — server component, fetches + composes
│   ├── loading.tsx             # Loading skeleton with card layout
│   ├── error.tsx               # Error boundary for dashboard
│   ├── globals.css             # Tailwind v4 + shadcn tokens + Ajo accent colours
│   └── api/
│       ├── members/route.ts    # GET /api/members  → Member[]
│       ├── cycles/route.ts     # GET /api/cycles   → Cycle[]
│       └── payments/route.ts   # GET /api/payments → Payment[]
│
├── components/
│   ├── dashboard/
│   │   ├── header.tsx                    # Group name, date, active cycle badge
│   │   ├── active-cycle-card.tsx         # Cycle info + recipient
│   │   ├── collection-progress.tsx       # ₦ amounts + progress bar
│   │   ├── payment-status-grid.tsx       # Table/chart toggle card
│   │   ├── cycle-performance-chart.tsx   # Per-cycle + cumulative chart toggle
│   │   ├── sortable-payment-table.tsx    # Sortable table with member search
│   │   ├── member-payment-row.tsx        # Card-based layout with phone formatting + date display
│   │   ├── kpi-stats.tsx                 # KPI stat tiles
│   │   ├── payment-toggle-button.tsx     # Server action toggle for payment status
│   │   ├── outstanding-alert.tsx         # role=alert listing unpaid members
│   │   └── theme-toggle.tsx              # Light/dark mode toggle
│   ├── theme-provider.tsx                # next-themes wrapper
│   └── ui/                               # shadcn/ui primitives (auto-generated)
│
├── lib/
│   ├── types.ts        # Domain types: Member, Payment, Cycle, derived view types
│   ├── mock-data.ts    # 6-member demo dataset (cycle 3 active, 4/6 paid)
│   ├── utils.ts        # Formatting (formatNgn, formatPhone, formatPaymentDate, padZero) + data derivation
│   ├── config.ts       # Configuration (BACKEND_URL, NEXT_PUBLIC_BASE_URL)
│   ├── data.ts         # Data fetching layer (proxies to Rust/SurrealDB backend)
│   ├── store.ts        # In-memory store (mock/test mode)
│   └── actions.ts      # Server actions (payment toggle)
│
└── tests/
    ├── dashboard.spec.ts       # E2E tests — toggle flows, chart rendering, tooltips
    ├── pages/dashboard.page.ts # Page Object Model for dashboard
    └── screenshots/            # Visual regression baselines (gitignored)
```

---

## Data Model

All monetary amounts are stored in **kobo** (NGN × 100) as integers to avoid floating-point errors. Use `formatNgn(kobo)` to display as `₦10,000`.

The dashboard is **read-only**. The API routes proxy to the Rust/SurrealDB backend via `BACKEND_URL`. The component layer is decoupled from the data source — swap backends by updating `lib/data.ts` only.

---

## Accessibility

All components meet **WCAG 2.2 AA**. Tested with Playwright E2E tests:

```bash
yarn test:e2e
```

Key requirements met: semantic `<table>`, `role="progressbar"` with aria attrs, `role="alert"` on outstanding banner, status badges use text (not colour alone), visible focus rings, full keyboard navigation, proper dark mode contrast in all states.
