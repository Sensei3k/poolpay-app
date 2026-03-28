# Contributing

## Prerequisites

- Node.js 20+
- Yarn 1.22+
- Git

## Setup

```bash
git clone https://github.com/Sensei3k/circle-dashboard.git
cd circle-dashboard
yarn install
cp .env.example .env.local
```

<!-- AUTO-GENERATED -->
## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with hot reload on http://localhost:3000 |
| `yarn build` | Production build with type checking |
| `yarn start` | Start production server (requires `yarn build` first) |
| `yarn lint` | Run ESLint across the project |
| `yarn test:e2e` | Run Playwright E2E tests (requires dev server on localhost:3001) |
| `yarn test:e2e:ui` | Run Playwright E2E tests with interactive UI |
| `yarn test:e2e:report` | Open the last E2E test report |
<!-- /AUTO-GENERATED -->

## Branch Naming

```
feat/   — new feature
fix/    — bug fix
chore/  — tooling, config, deps
hotfix/ — urgent production fix
```

Never commit directly to `main`.

## Commit Format

```
[PREFIX] - Description (present tense, imperative)
```

| Prefix | Use |
|--------|-----|
| `[FEAT]` | New feature |
| `[FIX]` | Bug fix |
| `[ADD]` | Files, assets, libraries |
| `[REMOVE]` | Deleting code or files |
| `[REFACTOR]` | No behaviour change |
| `[UI]` | UI-only changes |
| `[DOCS]` | Documentation only |

## Code Style

- TypeScript strict mode — no `any`, no type assertions without justification
- Tailwind utility classes only — no inline styles
- Monetary values always in **kobo** — use `formatNgn()` to display
- No magic numbers — name constants
- Early returns over nested conditionals

## Testing

### E2E Tests

Run Playwright E2E tests after component or flow changes:

```bash
# Terminal 1: start dev server
yarn dev                    # runs on http://localhost:3000

# Terminal 2: run E2E tests
yarn test:e2e              # run tests headless
yarn test:e2e:ui           # run tests with interactive browser UI
yarn test:e2e:report       # view last test report
```

Tests are located in `tests/` and target `http://localhost:3001`. The Playwright config includes HTML reporting with screenshots on failure.

## PR Checklist

- [ ] Branch created from `main` (never commits directly to `main`)
- [ ] `yarn build` passes with no errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `yarn lint` passes
- [ ] `yarn test:e2e` passes (if component or flow changes made)
- [ ] WCAG 2.2 AA audit passes (zero axe violations) — includes all pages (dashboard, 404, error boundaries)
- [ ] Monetary amounts displayed via `formatNgn()`, never raw kobo
- [ ] Error pages use semantic heading tags (`<h1>` for screen reader navigation)
