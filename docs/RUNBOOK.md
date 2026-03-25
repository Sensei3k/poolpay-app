# Runbook

Operational reference for the Circle Dashboard.

## Local Development

```bash
yarn install
cp .env.example .env.local
yarn dev          # http://localhost:3000
```

## Production Build

```bash
yarn build        # compiles + type-checks
yarn start        # serves on port 3000
```

## Health Check

The app is healthy if `GET /` returns HTTP 200. No dedicated health endpoint yet — use the root route.

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_BASE_URL` | No | `http://localhost:3000` | Base URL for internal `/api/*` fetches |
| `SPREADSHEET_ID` | No | — | Google Sheets ID (future data source) |

## Data Source

The dashboard currently reads from `lib/mock-data.ts` via three API routes:

| Route | Returns |
|-------|---------|
| `GET /api/members` | `Member[]` |
| `GET /api/cycles` | `Cycle[]` |
| `GET /api/payments` | `Payment[]` |

To wire a real data source, update the route handlers in `app/api/*/route.ts`. The component layer requires no changes.

## Common Issues

**Dates appear one day off**
ISO date strings (e.g. `2026-03-01`) must be parsed as local dates, not UTC. Use the `parseLocalDate` helper pattern:
```ts
const [year, month, day] = isoDate.split('-').map(Number);
new Date(year, month - 1, day)
```

**`NEXT_PUBLIC_BASE_URL` not set in production**
Internal fetch calls default to `http://localhost:3000`, which will fail in a deployed environment. Set `NEXT_PUBLIC_BASE_URL` to the actual deployment URL.

**Accessibility audit fails**
Run `node scripts/visual-check.mjs debug` and inspect the axe output. Common causes: missing `aria-label`, colour contrast below 4.5:1, status conveyed by colour alone.

## Deployment

The app is a standard Next.js project deployable to any Node.js host or Vercel.

1. Set `NEXT_PUBLIC_BASE_URL` to the deployment URL
2. Run `yarn build`
3. Run `yarn start` (or let the platform handle it)

Vercel: push to `main` and it deploys automatically if the GitHub repo is connected.
