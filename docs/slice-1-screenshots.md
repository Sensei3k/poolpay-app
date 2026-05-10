# Slice 1 — Screenshot capture matrix

This file is the slice-1 visual-evidence contract. The reviewer captures the
matrix below and pastes the resulting images into the draft PR body. Once
the screenshots are attached the reviewer signs off the PR can move out of
draft.

The matrix is **3 roles × 2 themes × 3 viewports = 18 screenshots**. Each
image lands in `docs/pr-screenshots/slice-1/` and is referenced from the PR
body via a raw GitHub URL (per the user's "embed in PR" preference; Obsidian
notes use a separate copy-into-vault workflow).

## Setup

```bash
# 1. From this repo (poolpay-app-redesign-1-shell):
yarn dev

# 2. From a sibling checkout, run the Rust backend (poolpay-api) on
#    http://localhost:8080. Slice 1 only needs the auth + groups
#    endpoints to be healthy — no receipts queue API yet.
```

For each role, sign in with the role's seed account (see RUNBOOK.md or
`tests/pages` fixtures for credentials), then capture each cell.

## Roles

- **member** — primary nav only (Home, Pools, Activity, People, Inbox, Settings)
- **admin** — primary + Administration section (Receipts queue link)
- **super_admin** — primary + Administration + System (Groups, Admins, WhatsApp)

## Themes

Toggle via the system color-scheme preference, or — once the in-app theme
toggle returns in slice 2 — via that. For now: macOS Settings → Appearance.

## Viewports

| Tag       | Width  | Height | Use                                    |
| --------- | ------ | ------ | -------------------------------------- |
| `mobile`  | 390    | 844    | iPhone 14 Pro (Safari) — member focus  |
| `tablet`  | 820    | 1180   | iPad mini portrait — sidebar collapse  |
| `desktop` | 1440   | 900    | 13" laptop — full chrome (canonical)   |

Use Chromium DevTools device emulation, or `npx playwright test --headed`
with the visual.spec helpers if you want them automated.

## Capture matrix

Each cell is a full-viewport screenshot of the **`/` (dashboard)** route while
signed in as the relevant role. The dashboard is the only authed surface
slice 1 ships chrome for; richer surfaces (`/home`, `/admin/receipts`, etc.)
arrive in slices 2–6.

| #  | Role         | Theme | Viewport  | File path                                                              |
| -- | ------------ | ----- | --------- | ---------------------------------------------------------------------- |
|  1 | member       | light | mobile    | `docs/pr-screenshots/slice-1/member-light-mobile.png`                  |
|  2 | member       | light | tablet    | `docs/pr-screenshots/slice-1/member-light-tablet.png`                  |
|  3 | member       | light | desktop   | `docs/pr-screenshots/slice-1/member-light-desktop.png`                 |
|  4 | member       | dark  | mobile    | `docs/pr-screenshots/slice-1/member-dark-mobile.png`                   |
|  5 | member       | dark  | tablet    | `docs/pr-screenshots/slice-1/member-dark-tablet.png`                   |
|  6 | member       | dark  | desktop   | `docs/pr-screenshots/slice-1/member-dark-desktop.png`                  |
|  7 | admin        | light | mobile    | `docs/pr-screenshots/slice-1/admin-light-mobile.png`                   |
|  8 | admin        | light | tablet    | `docs/pr-screenshots/slice-1/admin-light-tablet.png`                   |
|  9 | admin        | light | desktop   | `docs/pr-screenshots/slice-1/admin-light-desktop.png`                  |
| 10 | admin        | dark  | mobile    | `docs/pr-screenshots/slice-1/admin-dark-mobile.png`                    |
| 11 | admin        | dark  | tablet    | `docs/pr-screenshots/slice-1/admin-dark-tablet.png`                    |
| 12 | admin        | dark  | desktop   | `docs/pr-screenshots/slice-1/admin-dark-desktop.png`                   |
| 13 | super_admin  | light | mobile    | `docs/pr-screenshots/slice-1/super_admin-light-mobile.png`             |
| 14 | super_admin  | light | tablet    | `docs/pr-screenshots/slice-1/super_admin-light-tablet.png`             |
| 15 | super_admin  | light | desktop   | `docs/pr-screenshots/slice-1/super_admin-light-desktop.png`            |
| 16 | super_admin  | dark  | mobile    | `docs/pr-screenshots/slice-1/super_admin-dark-mobile.png`              |
| 17 | super_admin  | dark  | tablet    | `docs/pr-screenshots/slice-1/super_admin-dark-tablet.png`              |
| 18 | super_admin  | dark  | desktop   | `docs/pr-screenshots/slice-1/super_admin-dark-desktop.png`             |

## Bonus stubs (auth + offline)

The four new stub routes are unauthenticated; capture once each (light + dark,
desktop only — these are full-bleed editorial frames):

- `/signin` — already covered in FE-5; recapture on this branch to show the
  parity tweaks (kicker tracking, headline scale, N-glyph).
- `/signup/<some-token>` — pass any non-empty token, e.g.
  `/signup/test-invite-001`.
- `/recover`
- `/recover/verify`
- `/offline`

These confirm the editorial layouts render and the dark `#0a0a0a` panel +
ajo-paid kicker land correctly.

## What to look for

A pass requires:

- Sidebar nav reflects the role (member: 6 items; admin: +Receipts queue;
  super_admin: +System section with 3 items).
- Active route is highlighted (dark ink fill, warm-bg text).
- Topbar shows the route-derived title (e.g. "Home", "Administration").
- Active-pool card on member sidebar shows the d2-cream surface + balance.
- Dark mode: warm-bg flips to deep blue-ink, cream flips to a darker
  blue-ink — verify there's no Tailwind-default blue or hex bleed.
- `/admin/receipts` link surfaces the pending-count badge in
  `--ajo-outstanding` (gold) only when count > 0 (slice 5 wires the actual
  count; today the badge is hidden because we pass `undefined`).

## Known gaps for the reviewer's eye

- `/home` doesn't exist yet — clicking the Home nav item routes to `/`,
  which still renders the FE-5 dashboard inside the new shell. Expected
  for slice 1; slice 2 builds the new home.
- Search button in the topbar is a disabled placeholder. Slice 6.
- Bell button does not open a dropdown yet. Slice 6.
- Quick pay button does not open the pay flow yet. Slice 3.
