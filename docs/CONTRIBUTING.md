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
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Production build with type checking |
| `yarn start` | Start production server (requires `yarn build` first) |
| `yarn lint` | Run ESLint across the project |
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

Run the visual + accessibility check after any component change:

```bash
# dev server must be running first
node scripts/visual-check.mjs <screenshot-name>
```

Screenshots are saved to `scripts/screenshots/`. The script runs an axe-core WCAG 2.1 AA audit and exits with code 1 on any violation.

## PR Checklist

- [ ] Branch created from `main` (never commits directly to `main`)
- [ ] `yarn build` passes with no errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `yarn lint` passes
- [ ] Visual check screenshot looks correct
- [ ] WCAG 2.1 AA audit passes (zero axe violations)
- [ ] Monetary amounts displayed via `formatNgn()`, never raw kobo
