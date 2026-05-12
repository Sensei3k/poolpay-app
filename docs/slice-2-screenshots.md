# Slice 2 — Screenshot capture matrix

This is the slice-2 visual-evidence contract. The matrix is **5 routes ×
3 viewports × 2 themes = 30 screenshots**, captured against the dev-only
preview routes at `/internal/preview/member/*`. Each PNG lives in
`docs/screenshots/slice-2/` named `route-viewport-theme.png` and is
referenced from the PR body via raw GitHub URLs.

## Setup

```bash
# Boot the dev server on the slice-2 port:
PORT=3020 yarn dev

# In another terminal, run the capture script:
node scripts/capture-slice-2-screenshots.mjs
```

The script suppresses Next.js's dev-mode badge / overlay before each
capture (otherwise it bleeds into the bottom-left corner of mobile dark
captures); production builds don't render that portal at all.

## Routes

Captured against the dev-only preview routes, which mount each
presentational view (`HomeView` / `PoolDetailView` / `PayView` /
`InboxView` / `ProfileView`) inside `<PPShell role="member">` against
fixtures in `lib/preview/member-fixtures.ts`.

| Tag      | Preview route                          | Live route                       |
| -------- | -------------------------------------- | -------------------------------- |
| `home`   | `/internal/preview/member/home`        | `/home`                          |
| `pool`   | `/internal/preview/member/pool`        | `/pools/:poolId`                 |
| `pay`    | `/internal/preview/member/pay`         | `/pools/:poolId/pay`             |
| `inbox`  | `/internal/preview/member/inbox`       | `/inbox`                         |
| `profile`| `/internal/preview/member/profile`     | `/profile` (`/settings` aliases) |

## Viewports

| Tag       | Width  | Height | Use                                     |
| --------- | ------ | ------ | --------------------------------------- |
| `mobile`  | 390    | 844    | iPhone 14 Pro — mobile chrome (top bar + tab bar) |
| `tablet`  | 820    | 1180   | iPad mini portrait — full sidebar       |
| `desktop` | 1440   | 900    | 13" laptop — canonical desktop layout   |

## Themes

Forced via Playwright's `colorScheme` browser-context option, which
drives `prefers-color-scheme` and triggers `next-themes` to apply the
matching `class="dark"` to `<html>`.

## Capture matrix (30 cells)

| #  | Route   | Viewport  | Theme | File                                                             |
| -- | ------- | --------- | ----- | ---------------------------------------------------------------- |
|  1 | home    | mobile    | light | `docs/screenshots/slice-2/home-mobile-light.png`                 |
|  2 | home    | mobile    | dark  | `docs/screenshots/slice-2/home-mobile-dark.png`                  |
|  3 | home    | tablet    | light | `docs/screenshots/slice-2/home-tablet-light.png`                 |
|  4 | home    | tablet    | dark  | `docs/screenshots/slice-2/home-tablet-dark.png`                  |
|  5 | home    | desktop   | light | `docs/screenshots/slice-2/home-desktop-light.png`                |
|  6 | home    | desktop   | dark  | `docs/screenshots/slice-2/home-desktop-dark.png`                 |
|  7 | pool    | mobile    | light | `docs/screenshots/slice-2/pool-mobile-light.png`                 |
|  8 | pool    | mobile    | dark  | `docs/screenshots/slice-2/pool-mobile-dark.png`                  |
|  9 | pool    | tablet    | light | `docs/screenshots/slice-2/pool-tablet-light.png`                 |
| 10 | pool    | tablet    | dark  | `docs/screenshots/slice-2/pool-tablet-dark.png`                  |
| 11 | pool    | desktop   | light | `docs/screenshots/slice-2/pool-desktop-light.png`                |
| 12 | pool    | desktop   | dark  | `docs/screenshots/slice-2/pool-desktop-dark.png`                 |
| 13 | pay     | mobile    | light | `docs/screenshots/slice-2/pay-mobile-light.png`                  |
| 14 | pay     | mobile    | dark  | `docs/screenshots/slice-2/pay-mobile-dark.png`                   |
| 15 | pay     | tablet    | light | `docs/screenshots/slice-2/pay-tablet-light.png`                  |
| 16 | pay     | tablet    | dark  | `docs/screenshots/slice-2/pay-tablet-dark.png`                   |
| 17 | pay     | desktop   | light | `docs/screenshots/slice-2/pay-desktop-light.png`                 |
| 18 | pay     | desktop   | dark  | `docs/screenshots/slice-2/pay-desktop-dark.png`                  |
| 19 | inbox   | mobile    | light | `docs/screenshots/slice-2/inbox-mobile-light.png`                |
| 20 | inbox   | mobile    | dark  | `docs/screenshots/slice-2/inbox-mobile-dark.png`                 |
| 21 | inbox   | tablet    | light | `docs/screenshots/slice-2/inbox-tablet-light.png`                |
| 22 | inbox   | tablet    | dark  | `docs/screenshots/slice-2/inbox-tablet-dark.png`                 |
| 23 | inbox   | desktop   | light | `docs/screenshots/slice-2/inbox-desktop-light.png`               |
| 24 | inbox   | desktop   | dark  | `docs/screenshots/slice-2/inbox-desktop-dark.png`                |
| 25 | profile | mobile    | light | `docs/screenshots/slice-2/profile-mobile-light.png`              |
| 26 | profile | mobile    | dark  | `docs/screenshots/slice-2/profile-mobile-dark.png`               |
| 27 | profile | tablet    | light | `docs/screenshots/slice-2/profile-tablet-light.png`              |
| 28 | profile | tablet    | dark  | `docs/screenshots/slice-2/profile-tablet-dark.png`               |
| 29 | profile | desktop   | light | `docs/screenshots/slice-2/profile-desktop-light.png`             |
| 30 | profile | desktop   | dark  | `docs/screenshots/slice-2/profile-desktop-dark.png`              |

## What to look for

A pass requires:

- **Mobile (390px):** sidebar fully hidden, top app bar visible with the
  brand glyph (or back chevron on `/pools/:id` and `/pools/:id/pay`),
  bottom tab bar visible (Home / Pools / Inbox / Me) and hidden on the
  pay flow.
- **Tablet (820px):** desktop sidebar + topbar present, content column
  reflows but layout is the desktop variant (we cross the 768px md
  breakpoint at 820).
- **Desktop (1440px):** full chrome with active-pool card in sidebar,
  Quick-pay CTA on `/home` and `/pools/:id` topbars, breadcrumb above
  the title for nested routes.
- **Dark theme:** `--surface-page` flips to deep blue-ink, `--surface-card`
  flips to a darker blue-ink, status pills retain semantic tone.
- **Pay flow:** desktop renders a max-width 560px column inside the
  cream panel; mobile is full-bleed with the bottom tab bar suppressed.

## Known gaps for the reviewer's eye

- Quick pay button in the topbar is still a disabled placeholder — slice 3
  wires it to open the pay flow.
- "Switch active pool" in the sidebar active-pool card stays disabled in
  slice 2; selection wiring lands in slice 3.
- Search + bell in the topbar are disabled placeholders — slice 6 wires
  the global search and notification dropdown.
- `Home` and `Request` buttons in the mobile hero card on `/home` are
  disabled placeholders; the Pay flow still launches via the per-pool
  CTA in `/pools/:poolId`.
