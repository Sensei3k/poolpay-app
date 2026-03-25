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

Open [http://localhost:3000](http://localhost:3000).

---

<!-- AUTO-GENERATED -->
## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Production build with type checking |
| `yarn start` | Start production server (requires `yarn build` first) |
| `yarn lint` | Run ESLint across the project |
<!-- /AUTO-GENERATED -->

---

<!-- AUTO-GENERATED -->
## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for internal API fetches — defaults to `http://localhost:3000` in dev | `https://your-domain.com` |
| `SPREADSHEET_ID` | No | Google Sheets ID for the live data source (not yet wired — mock data used by default) | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms` |
<!-- /AUTO-GENERATED -->

---

## Project Structure

```
circle-dashboard/
├── app/
│   ├── layout.tsx              # Root layout — Geist font, dark mode, metadata
│   ├── page.tsx                # Dashboard page — server component, fetches + composes
│   ├── globals.css             # Tailwind v4 + shadcn tokens + Ajo accent colours
│   └── api/
│       ├── members/route.ts    # GET /api/members  → Member[]
│       ├── cycles/route.ts     # GET /api/cycles   → Cycle[]
│       └── payments/route.ts   # GET /api/payments → Payment[]
│
├── components/
│   ├── dashboard/
│   │   ├── header.tsx              # Group name, date, active cycle badge
│   │   ├── active-cycle-card.tsx   # Cycle info + recipient
│   │   ├── collection-progress.tsx # ₦ amounts + progress bar
│   │   ├── payment-status-grid.tsx # Member payment table
│   │   ├── member-payment-row.tsx  # Single row: position, name, Paid/Outstanding
│   │   └── outstanding-alert.tsx   # role=alert listing unpaid members
│   └── ui/                         # shadcn/ui primitives (auto-generated)
│
├── lib/
│   ├── types.ts        # Domain types: Member, Payment, Cycle, derived view types
│   ├── mock-data.ts    # 6-member demo dataset (cycle 3 active, 4/6 paid)
│   ├── utils.ts        # koboToNgn, formatNgn, getMemberPaymentStatuses, deriveCycleSummary
│   └── data.ts         # Typed fetch helpers (wraps /api/* routes)
│
└── scripts/
    └── visual-check.mjs  # Playwright screenshot + WCAG 2.1 AA audit
```

---

## Data Model

All monetary amounts are stored in **kobo** (NGN × 100) as integers to avoid floating-point errors. Use `formatNgn(kobo)` to display as `₦10,000`.

The dashboard is **read-only**. The API routes currently serve `lib/mock-data.ts`. Swap to a real data source (Google Sheets, Supabase, etc.) by updating `app/api/*/route.ts` — the component layer requires no changes.

---

## Accessibility

All components meet **WCAG 2.1 AA**. Audited with axe-core on every build:

```bash
node scripts/visual-check.mjs <name> [url]
```

Key requirements met: semantic `<table>`, `role="progressbar"` with aria attrs, `role="alert"` on outstanding banner, status badges use text (not colour alone), visible focus rings.
