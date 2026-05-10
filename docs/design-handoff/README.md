# PoolPay · Design Handoff for Claude Code

## Overview

PoolPay is a web app that digitizes **rotating savings groups** (Nigerian _ajo / esusu_, Kenyan _chama_) for diaspora and home-country members. Members contribute on a fixed schedule; one member collects the pot each cycle. PoolPay does **not custody funds** — money still moves over WhatsApp/bank transfer. The app adds a clean ledger, automatic phone-number-based matching of WhatsApp receipts, and an admin queue for human verification.

This bundle covers the entire end-to-end product across three roles (member, scoped admin, super-admin) and two viewports (desktop + mobile-web).

---

## About the design files

Everything in `poolpay-app.html` and `poolpay/*.jsx` is a **design reference** — interactive HTML prototypes that demonstrate the intended look and behavior. They are **not production code**. Your job is to **recreate these designs in the target codebase's existing environment** (React/Next.js, Remix, etc.) using its established patterns, routing, data layer, and component library.

If no codebase exists yet, pick a stack (Next.js app router + Postgres + Auth.js + Drizzle is the recommended baseline — see `HANDOFF.md` §9.3) and implement there.

The two files you should treat as authoritative:

| File              | Why it matters                                                                 |
| ----------------- | ------------------------------------------------------------------------------ |
| `poolpay-app.html`| The visual spec. Open it; every screen / state / modal is rendered.            |
| `HANDOFF.md`      | The engineering spec — routes, roles, data model, tokens, integration plan, open questions. **Read it first.** |

`poolpay/shell-styles.css` contains all the design tokens as CSS custom properties. Lift it wholesale into your target app — it's framework-agnostic and the source of truth for color/type/radius/spacing.

---

## Fidelity

**High-fidelity.** Pixel-perfect mockups with final colors (in `oklch`), typography (Geist + Geist Mono), spacing, and interaction patterns. Recreate the UI pixel-perfectly using your codebase's existing libraries and patterns. If your codebase already has a button or input component that meets the design, use it; if not, build per the design.

---

## What's in this bundle

```
design_handoff_poolpay_app/
├── README.md                  ← you are here
├── HANDOFF.md                 ← THE engineering spec (read this)
├── poolpay-app.html           ← all 35+ screens on one design canvas
└── poolpay/
    ├── shell-styles.css       ← design tokens · LIFT WHOLESALE
    ├── shell.jsx              ← PPShell / PPSidebar / PPTopbar reference
    ├── lucide.jsx             ← icon wrapper
    ├── member-desktop.jsx     ← Home, Pool, Pay, Inbox, Profile (desktop)
    ├── member-mobile.jsx      ← same, mobile viewport
    ├── admin-desktop.jsx      ← Receipts queue, Group tabs (overview/members/cycles/payments/receipts/settings)
    ├── admin-mobile.jsx       ← admin triage on phone
    ├── super-desktop.jsx      ← Groups, Group detail, Admins, WhatsApp links
    ├── whatsapp-story.jsx     ← receipt-ingestion storyboard (illustrative)
    ├── missing-screens.jsx    ← Auth, errors, empty states, modals, loading, toasts, form states
    ├── design-canvas.jsx      ← design-time only · do NOT ship
    └── ios-frame.jsx          ← design-time only · do NOT ship
```

**Do not ship:** `design-canvas.jsx`, `ios-frame.jsx`, the `<TweaksPanel>` block at the bottom of `poolpay-app.html`, and the dark-mode toggle as a free-floating control (replace it with a per-user setting persisted in the DB).

---

## Screens covered

The design canvas is grouped into 9 sections. Counts are artboards, not flows.

| Section                               | Count | What it covers                                             |
| ------------------------------------- | :---: | ---------------------------------------------------------- |
| Member · desktop                      |   5   | Home, Pool detail, Pay flow, Inbox, Profile                |
| Member · mobile-web                   |   5   | Same, responsive variant at 390×844                        |
| Admin (scoped) · desktop              |   8   | Receipts queue, empty-queue → member home, Group tabs      |
| Admin (scoped) · mobile               |   2   | Triage queue + read-only group view                        |
| Super-admin · desktop only            |   6   | Receipts (system-wide), Groups, Group detail, Admins, Add admin modal, WhatsApp links |
| WhatsApp ingestion · storyboard       |   1   | 3-panel illustration of the matching flow                  |
| Auth                                  |   4   | Sign-in (D + M), Sign-up via invite, OTP recovery          |
| Errors & offline                      |   3   | 404, 500, offline                                          |
| Empty states                          |   3   | Member with no pools, empty inbox, empty admins            |
| Modals & confirms                     |   5   | Pay confirm, receipt detail, destructive confirm, start cycle, create pool |
| Loading skeletons                     |   2   | Home + receipts table                                      |
| Feedback & form states                |   2   | Toast / banner patterns + every input variant              |

For per-screen layout details, the prototypes themselves are the spec — open `poolpay-app.html`, click into an artboard for fullscreen view.

---

## Routes, roles, data model, integration

All in **`HANDOFF.md`**. Specifically:

- §2 Roles & permissions matrix
- §3 Routes (exact paths)
- §4 Data model — TypeScript interfaces for User, Pool, Membership, AdminGrant, Cycle, Contribution, Receipt, WhatsAppLink, InboxItem
- §5 Critical flows — WhatsApp ingestion, Pay flow, Admin signal-driven landing, Super-admin create-then-grant
- §6 Design tokens — colors, type, radius, spacing
- §9 Integration & env vars
- §12 Open questions for product (resolve before building)

---

## Design tokens — quick reference

Full list in `HANDOFF.md` §6. Most-used:

```css
/* Light theme */
--background: oklch(0.99 0.003 240);
--foreground: oklch(0.14 0 0);
--ajo-paid:        oklch(0.696 0.17 162.48);    /* success / paid */
--ajo-outstanding: oklch(0.769 0.188 70.08);    /* pending / warning */
--destructive:     oklch(0.577 0.245 27.325);

/* Direction-2 (consumer-fintech) — the chosen aesthetic */
--d2-warm-bg: oklch(0.98 0.01 75);
--d2-cream:   oklch(0.97 0.012 75);
--d2-ink:     oklch(0.18 0.02 260);
--d2-accent:  oklch(0.62 0.14 160);
--d2-coral:   oklch(0.72 0.13 38);
--d2-lav:     oklch(0.76 0.08 310);

/* Type */
--font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

/* Radius */
--radius:    0.625rem;   /* 10px */
--radius-sm: 0.375rem;   /* 6px  */
--radius-md: 0.5rem;     /* 8px  */
/* D2 cards: 14–18px */
```

Dark mode: apply `[data-theme="dark"]` to `<html>`. Tokens flip automatically (see `shell-styles.css` lines ~32–43 and the D2 dark block).

---

## Assets

- **Icons:** Lucide (via `lucide.jsx` wrapper). In your codebase, use `lucide-react` directly.
- **Fonts:** Geist + Geist Mono from Google Fonts.
- **Images:** None of the receipt screenshots are real — the `<ModalReceiptDetail>` shows a striped placeholder. Real receipts are user-uploaded and stored in S3/R2.
- **Logo:** PoolPay wordmark + "P" gradient mark — see `logo-final.html` in the project root.

---

## Acceptance checklist (full version in HANDOFF.md §14)

- [ ] All 35+ artboards render at production parity
- [ ] Auth: sign-in, sign-up via invite, OTP recovery work end-to-end
- [ ] Admin can confirm a real WhatsApp receipt; member sees confirmation in inbox <5s
- [ ] Super-admin can create-pool → assign-admin → admin signs in with temp creds
- [ ] Empty / loading / error states fire under the right conditions
- [ ] Dark mode (token flip — no hardcoded colors leak through)
- [ ] Mobile responsive at 390px wide; super-admin redirects on mobile
- [ ] Audit log row for every state change

---

**Start with `HANDOFF.md`. Then open `poolpay-app.html` in a browser. Then read `shell-styles.css`. Then write code.**

---

## Suggested prompt for Claude Code

Paste the block below into Claude Code (or any agent) at the repo root, **after** copying this folder into the repo. It frames the work, sets up rollback safety, and tells the agent how to parallelize across worktrees.

```
You are picking up the PoolPay design handoff. The full spec lives in
./design_handoff_poolpay_app/ — read README.md and HANDOFF.md first,
in that order, before writing any code. Open poolpay-app.html in a
browser as you build; it is the visual source of truth.

Scope — every screen ships in:
  Viewports:  mobile (390px) · tablet/iPad (768–1024px) · desktop (≥1280px)
  Themes:     light + dark
  => 6 variants per screen. No screen is "done" until all 6 render
     pixel-correct against poolpay-app.html.

Responsive + theme are CROSS-CUTTING, not their own slice. Each slice
builds its screens fully responsive and theme-correct from the start.
The design canvas only shows desktop + mobile artboards explicitly;
for tablet, follow these rules: super-admin tables collapse to the
mobile card layout below 1024px; member/admin shells keep the desktop
sidebar but narrow to a single content column at 768–1024; modals
center at 560px max-width on tablet, full-screen on mobile.

The work breaks into 6 roughly independent vertical slices:
  1. shell + tokens + auth          (foundation — must land first;
                                     owns the responsive shell + theme
                                     provider every other slice imports)
  2. member experience              (Home, Pool, Pay, Inbox, Profile)
  3. scoped-admin experience        (Receipts queue, Group tabs)
  4. super-admin experience         (Groups, Admins, WhatsApp links)
  5. WhatsApp ingestion pipeline    (worker + matcher + admin queue)
  6. errors / empty / loading / modals  (cross-cutting polish)

Branching model — INTEGRATION BRANCH, not slice→main:

  main                                          ← stays pristine
   └── feat/poolpay                             ← long-lived integration branch
        ├── feat/poolpay-1-shell                ← slice branches off integration
        ├── feat/poolpay-2-member               ← merge BACK to feat/poolpay,
        ├── feat/poolpay-3-admin                  not to main
        ├── feat/poolpay-4-super
        ├── feat/poolpay-5-whatsapp
        └── feat/poolpay-6-polish

Only when the whole feature passes acceptance does feat/poolpay
merge into main — as ONE merge commit, so a single
`git revert -m 1 <merge-sha>` rolls back the entire PoolPay rollout
if production reveals a problem.

Setup (one-time, from the main repo):

  git checkout main && git pull
  git tag pre-poolpay-handoff           # rollback anchor for everything
  git push origin pre-poolpay-handoff
  git checkout -b feat/poolpay
  git push -u origin feat/poolpay

Per slice (use worktrees so parallel agents don't collide):

  git worktree add ../poolpay-1-shell    -b feat/poolpay-1-shell    feat/poolpay
  git worktree add ../poolpay-2-member   -b feat/poolpay-2-member   feat/poolpay
  git worktree add ../poolpay-3-admin    -b feat/poolpay-3-admin    feat/poolpay
  git worktree add ../poolpay-4-super    -b feat/poolpay-4-super    feat/poolpay
  git worktree add ../poolpay-5-whatsapp -b feat/poolpay-5-whatsapp feat/poolpay
  git worktree add ../poolpay-6-polish   -b feat/poolpay-6-polish   feat/poolpay

Order of operations:
  1. Build slice 1 → merge into feat/poolpay (it owns shell-styles.css,
     auth, role middleware, data-model migrations — everything else
     imports from it).
  2. Slices 2–6 rebase onto feat/poolpay once slice 1 lands, then run
     concurrently. Each merges back to feat/poolpay when its slice
     passes acceptance.
  3. All slices ship as one rollout — do NOT merge to main
     incrementally. Only when all 6 slices are merged into
     feat/poolpay AND every screen passes the 3×2 responsive/theme
     matrix AND the full acceptance checklist (HANDOFF.md §14) is
     green: open ONE PR from feat/poolpay → main.
  4. main does not move during the build. If something urgent must
     land on main mid-rollout, merge main INTO feat/poolpay (never
     the reverse) to absorb it; main only receives feat/poolpay
     once at the end.

Rollback rules — non-negotiable:
  • Do not force-push, rewrite history, or delete branches I haven't
    explicitly approved. Every merge must be a normal merge or PR
    squash so `git revert` restores the prior state.
  • Slice merges into feat/poolpay should use `--no-ff` so each
    slice is a single revertable merge commit on the integration
    branch.
  • The final feat/poolpay → main merge MUST be `--no-ff` (a single
    merge commit). Production rollback = `git revert -m 1 <sha>`.
  • Before any destructive change to existing files inside a slice,
    commit the untouched version first ("snapshot before poolpay-N")
    so reverting that one commit restores the original.
  • Database migrations: every migration has a paired down migration.
    Never edit a migration after it has run anywhere.
  • Bad slice: `git worktree remove ../poolpay-N-xxx` +
    `git branch -D feat/poolpay-N-xxx`. feat/poolpay untouched, main
    untouched.
  • Bad integration: reset feat/poolpay back to its previous state.
    main still untouched.
  • Full nuke option: `git reset --hard pre-poolpay-handoff` on main
    returns the repo to the pre-handoff state.

For each slice, before opening a PR:
  • run the existing test suite + lint + typecheck — must be green
  • screenshot every screen at 390px / 820px / 1440px in BOTH light
     and dark mode (6 captures per screen) and diff against the
     artboards in poolpay-app.html
  • verify no hardcoded colors leak through dark mode — every color
     must come from a token in shell-styles.css
  • check the Acceptance Checklist items in HANDOFF.md §14 that fall
    in your slice
  • flag anything in HANDOFF.md §12 (open product questions) that
    blocks your slice — do not invent answers

Stack assumption (override if the repo already has one): Next.js
app router + Drizzle + Postgres + Auth.js, per HANDOFF.md §9.3.
If the repo has a different stack, follow HANDOFF.md §1 ("recreate
in the target codebase's existing environment") and adapt — the
design + data model + flows are stack-agnostic.

Start with slice 1. Confirm the worktree layout and the pre-handoff
tag are in place before writing code.
```

### Why integration branch + worktrees

- **Main stays pristine.** No half-finished PoolPay code on main until the whole feature is acceptance-green. Production rollback is one revert of one merge commit.
- **Slices iterate against each other** on `feat/poolpay` without polluting main. Slice 5's WhatsApp worker can land before Slice 6's empty-states polish without forcing main to ship a half-built admin queue.
- **Worktrees enable parallel agents.** One Claude Code session per worktree, separate dev-server ports, no stomping on each other's working tree or `node_modules`.
- **Independent rollback at every level.** Bad slice → drop the slice branch. Bad integration → reset `feat/poolpay`. Bad rollout → revert the one merge to main. Bad everything → reset to `pre-poolpay-handoff` tag.

### When NOT to bother with worktrees

If you're driving this solo and serially (one slice at a time, one terminal), regular branches off `feat/poolpay` in a single checkout give you the same rollback story with less ceremony. Keep the integration branch either way — that's the rollback surface for production.
