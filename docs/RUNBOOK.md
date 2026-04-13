# Runbook

Operational reference for PoolPay.

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
| `ADMIN_TOKEN` | Yes (for admin) | (empty) | Token for admin CRUD mutations — must match backend `ADMIN_TOKEN` |
| `FETCH_TIMEOUT_MS` | No | `5000` | Timeout in ms for GET backend fetches |
| `MUTATION_TIMEOUT_MS` | No | `10000` | Timeout in ms for POST/PATCH/DELETE backend calls |

## Data Source

The dashboard reads from `lib/data.ts`, which proxies to the Rust/SurrealDB backend via `BACKEND_URL`:

- `fetchGroups()` → `GET {BACKEND_URL}/api/groups` → `Group[]`
- `fetchMembers(groupId?)` → `GET {BACKEND_URL}/api/members?groupId=…` → `Member[]`
- `fetchCycles(groupId?)` → `GET {BACKEND_URL}/api/cycles?groupId=…` → `Cycle[]`
- `fetchPayments()` → `GET {BACKEND_URL}/api/payments` → `Payment[]`

Ensure the Rust backend is running before starting the Next.js dev server. The component layer requires no changes if the backend URL is updated.

## Admin Panel

The admin panel is available at `/admin`. It requires `ADMIN_TOKEN` to be set for mutations to succeed.

Features:
- **Groups** — create, edit, delete savings groups
- **Members** — add/remove members within a group
- **Cycles** — create and manage contribution cycles

If `ADMIN_TOKEN` is not set, the admin page displays a warning banner and mutations will be rejected by the backend.

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
Run an axe audit via Playwright tests or manually. Common causes: missing `aria-label`, colour contrast below 4.5:1, status conveyed by colour alone. All routes (dashboard, admin, 404, error boundaries) must be tested in light and dark mode. Error pages must use semantic heading tags (`<h1>`) for proper screen reader navigation.

**Admin mutations rejected**
Check that `ADMIN_TOKEN` is set in `.env.local` and matches the backend's `ADMIN_TOKEN` env var.

## Deployment

The app is a standard Next.js project deployable to any Node.js host or Vercel.

1. Set `NEXT_PUBLIC_BASE_URL` to the deployment URL
2. Set `BACKEND_URL` to the production backend
3. Set `ADMIN_TOKEN` to a secure token matching the backend
4. Run `yarn build`
5. Run `yarn start` (or let the platform handle it)

Vercel: push to `main` and it deploys automatically if the GitHub repo is connected.
