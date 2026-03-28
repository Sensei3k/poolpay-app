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
| `BACKEND_URL` | No | `http://localhost:8080` | URL of the Rust/SurrealDB backend |

## Data Source

The dashboard reads from `lib/data.ts`, which proxies to the Rust/SurrealDB backend via `BACKEND_URL`:

- `fetchMembers()` → `GET {BACKEND_URL}/api/members` → `Member[]`
- `fetchCycles()` → `GET {BACKEND_URL}/api/cycles` → `Cycle[]`
- `fetchPayments()` → `GET {BACKEND_URL}/api/payments` → `Payment[]`

Ensure the Rust backend is running before starting the Next.js dev server. The component layer requires no changes if the backend URL is updated.

## Common Issues

**Dates appear one day off**
ISO date strings (e.g. `2026-03-01`) must be parsed as local dates, not UTC. Use the `parseLocalDate` helper pattern:
```ts
const [year, month, day] = isoDate.split('-').map(Number);
new Date(year, month - 1, day)
```

**E2E tests fail with connection refused**
Playwright tests run against `http://localhost:3001`. Start the dev server first:
```bash
yarn dev    # Terminal 1
yarn test:e2e  # Terminal 2
```

**Accessibility audit fails**
Run an axe audit via Playwright tests or manually. Common causes: missing `aria-label`, colour contrast below 4.5:1, status conveyed by colour alone. All routes (dashboard, 404, error boundaries) must be tested in light and dark mode. Error pages must use semantic heading tags (`<h1>`) for proper screen reader navigation.

## Deployment

The app is a standard Next.js project deployable to any Node.js host or Vercel.

1. Set `NEXT_PUBLIC_BASE_URL` to the deployment URL
2. Run `yarn build`
3. Run `yarn start` (or let the platform handle it)

Vercel: push to `main` and it deploys automatically if the GitHub repo is connected.
