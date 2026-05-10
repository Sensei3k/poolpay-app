# PoolPay — Engineering Handoff

> **Purpose:** Everything an implementer needs to translate the design in `poolpay-app.html` into a working web app. Pixel-fidelity is the goal — when in doubt, the rendered design is the source of truth, not this document.

---

## 1. Product context · one-paragraph version

PoolPay digitizes **rotating savings groups** (Nigerian _ajo / esusu_, Kenyan _chama_, etc.) for diaspora and home-country members. A **pool** has a fixed contribution amount, a fixed cadence (weekly / monthly), and a fixed roster. Each cycle, every member contributes; one member receives the full pot. Money still moves over WhatsApp/bank transfer in v1 — PoolPay does **not** custody funds. We add: a clean ledger, automatic phone-number-based matching of WhatsApp receipts, and an admin queue for human verification. **No OCR. No fund custody.** Humans confirm money moved.

---

## 2. Roles & permissions matrix

| Surface                        | Member | Admin (scoped) | Super-admin |
| ------------------------------ | :----: | :------------: | :---------: |
| Home / pool list               |   ✓    |       ✓        |      ✓      |
| Pool detail (own pools)        |   ✓    |       ✓        |      ✓      |
| Pay flow (contribute)          |   ✓    |       ✓        |      ✓      |
| Inbox                          |   ✓    |       ✓        |      ✓      |
| Receipts queue (group-scoped)  |        |       ✓        |      ✓      |
| Receipts queue (system-wide)   |        |                |      ✓      |
| Manage members (in their group)|        |       ✓        |      ✓      |
| Start cycle / edit settings    |        |       ✓        |      ✓      |
| Create pool                    |        |                |      ✓      |
| Create / revoke admins         |        |                |      ✓      |
| Manage WhatsApp links          |        |                |      ✓      |

**Scoped admin** = an admin granted access to a specific group only. They cannot see other groups' receipts, members, or settings. Granted at admin-creation time by super-admin.

**Logged-out users** see only the auth screens. There is no public marketing site in this scope.

---

## 3. Routes · React Router or equivalent

```
/                          → redirect: signed-in → /home, signed-out → /signin

# Auth
/signin                    → AuthSignIn
/signup/:inviteToken       → AuthSignUp           (must hit /verify-invite first)
/recover                   → AuthForgot           (sends OTP via WhatsApp)
/recover/verify            → OTP entry            (same screen)

# Member
/home                      → MD_Home / MM_Home    (responsive)
/pools/:poolId             → MD_Pool / MM_Pool
/pools/:poolId/pay         → MD_Pay / MM_Pay      (modal-style on desktop, page on mobile)
/inbox                     → MD_Inbox / MM_Inbox
/profile                   → MD_Profile / MM_Profile
/settings                  → /profile (alias)

# Admin (scoped)
/admin/receipts            → AD_Receipts          (default route on login if pending > 0)
/admin/groups/:poolId      → AD_Group
  ?tab=overview|members|cycles|payments|receipts|settings

# Super-admin
/sys/receipts              → SD_Receipts          (system-wide queue)
/sys/groups                → SD_Groups
/sys/groups/:poolId        → SD_GroupDetail
/sys/admins                → SD_Admins
/sys/whatsapp              → SD_WhatsApp

# System
/offline                   → ErrOffline           (PWA service-worker fallback)
/404                       → Err404
/500                       → Err500
```

**Login routing rule:** if user is admin and has pending receipts > 0, route to `/admin/receipts` instead of `/home`. (This is the "signal-driven landing" — see `adm-d-receipts` artboard.)

---

## 4. Data model (inferred from the screens)

```ts
type UserId   = string; // uuid
type PoolId   = string;
type CycleId  = string;
type ReceiptId= string;

interface User {
  id: UserId;
  name: string;
  phone: string;            // e164, used as the WhatsApp matching key
  email?: string;           // optional
  passwordHash: string;
  createdAt: ISO;
  // role is per-pool — see Membership / AdminGrant below
}

interface Pool {
  id: PoolId;
  name: string;
  currency: 'NGN' | 'KES' | 'GHS' | 'USD';   // extend as needed
  cadence: 'weekly' | 'biweekly' | 'monthly';
  contributionAmount: number;                // minor units
  cycleCount: number;                        // total planned cycles
  startDate: ISO;
  status: 'active' | 'paused' | 'completed' | 'archived';
  whatsappLinkId?: WhatsAppLinkId;           // for receipt matching
  createdBy: UserId;                          // super-admin
  createdAt: ISO;
}

interface Membership {
  poolId: PoolId;
  userId: UserId;
  joinedAt: ISO;
  drawPosition: number;     // 1..cycleCount, who collects each cycle
  status: 'active' | 'removed' | 'pending_invite';
}

interface AdminGrant {
  userId: UserId;
  poolId: PoolId;            // null only for super-admin (project-owner)
  scope: 'group' | 'system';
  grantedBy: UserId;          // super-admin id
  grantedAt: ISO;
  revokedAt?: ISO;
}

interface Cycle {
  id: CycleId;
  poolId: PoolId;
  index: number;              // 1..cycleCount
  recipientUserId: UserId;
  dueDate: ISO;
  startedAt: ISO;
  closedAt?: ISO;
  status: 'pending' | 'open' | 'partial' | 'closed' | 'rolled_over';
}

interface Contribution {
  id: string;
  cycleId: CycleId;
  payerUserId: UserId;
  expectedAmount: number;
  receivedAmount?: number;    // null until matched
  receiptId?: ReceiptId;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  paidAt?: ISO;
}

interface Receipt {
  id: ReceiptId;
  source: 'whatsapp' | 'manual_upload';
  rawImageUrl: string;
  senderPhone: string;        // matched against User.phone
  matchedUserId?: UserId;
  detectedAmount?: number;    // from caption parsing — never trusted, just hint
  bankTrace?: string;
  submittedAt: ISO;
  status: 'unmatched' | 'matched' | 'confirmed' | 'rejected_duplicate' | 'flagged';
  reviewedBy?: UserId;        // admin who actioned it
  reviewedAt?: ISO;
  rejectionReason?: string;
}

interface WhatsAppLink {
  id: string;
  poolId: PoolId;
  inviteUrl: string;
  groupName: string;
  linkedAt: ISO;
  status: 'linked' | 'drift' | 'orphan' | 'unlinked';
  // 'drift' = phones in the WA group don't match pool roster
  // 'orphan' = WA group has no matching pool
}

interface InboxItem {
  id: string;
  userId: UserId;
  kind: 'receipt_confirmed' | 'cycle_starting' | 'payout_scheduled' | 'admin_message' | 'overdue';
  title: string;
  body: string;
  poolId?: PoolId;
  cycleId?: CycleId;
  readAt?: ISO;
  createdAt: ISO;
}
```

---

## 5. Critical flows

### 5.1 WhatsApp receipt ingestion (the core loop)

1. Member screenshots a bank-transfer confirmation in their pool's WhatsApp group.
2. Bot (out of scope of this UI; bot already exists) posts the image + sender phone to PoolPay's webhook.
3. Server creates a `Receipt` with `source: 'whatsapp'`, `senderPhone`, `rawImageUrl`.
4. **Auto-matching:** if `senderPhone` matches exactly one `User.phone` who is in the WhatsApp group's linked pool's `Membership`, set `matchedUserId` and `status: 'matched'`. Otherwise `status: 'unmatched'`.
5. Receipt appears in the admin's queue (scoped to that pool's admin, plus all super-admins).
6. Admin opens the modal (see `mod-receipt`), eyeballs the screenshot, and either:
   - **Confirm** → status `confirmed`; corresponding `Contribution.status = 'paid'`; member gets `receipt_confirmed` inbox item.
   - **Reject as duplicate** / **Flag** → status updated; receipt stays in audit log; no contribution change.

### 5.2 Pay flow

Member triggers from "Quick pay" CTA or from a pool detail page. The pay flow does NOT move money — it's a confirmation step that produces a "I sent it" intent. Real money still flows through their existing bank app + WhatsApp. The flow exists to:
- Prefill the bank details of the next-cycle recipient.
- Optionally notify the WhatsApp group when admin confirms.
- Generate a memo string the user can paste.

### 5.3 Admin landing (signal-driven)

On login as admin: query pending receipts assigned to their groups. If `count > 0`, route to `/admin/receipts`. If `count === 0`, route to `/home` and show an inbox-clear pill at the top of member home (see `adm-d-empty`).

### 5.4 Super-admin: create-then-grant

Adding an admin is an atomic two-step (visually one form): create the User account + create an `AdminGrant`. After submit, reveal **temporary credentials once** (see `sup-d-admin-add`). No email invites in v1 — delivery channel is "copy-paste these to the person via Signal/WhatsApp/in-person."

---

## 6. Design tokens

> Source of truth: `poolpay/shell-styles.css`. Lift these into your token system as-is. They use `oklch()` so dark mode is a single CSS variable swap.

### Colors — light theme

| Token                      | Value                          | Use                                          |
| -------------------------- | ------------------------------ | -------------------------------------------- |
| `--background`             | `oklch(0.99 0.003 240)`        | Page bg                                      |
| `--foreground`             | `oklch(0.14 0 0)`              | Primary text                                 |
| `--card`                   | `oklch(1 0 0)`                 | Card surface                                 |
| `--muted`                  | `oklch(0.965 0.003 240)`       | Subtle bg                                    |
| `--muted-foreground`       | `oklch(0.50 0 0)`              | Secondary text                               |
| `--border`                 | `oklch(0.922 0 0)`             | Hairlines                                    |
| `--destructive`            | `oklch(0.577 0.245 27.325)`    | Errors, danger CTAs                          |
| `--ajo-paid` (success)     | `oklch(0.696 0.17 162.48)`     | Status "paid", confirms                      |
| `--ajo-outstanding`        | `oklch(0.769 0.188 70.08)`     | Status "pending", warnings                   |

### Direction-2 (consumer-fintech) accents

| Token            | Value                          | Use                                  |
| ---------------- | ------------------------------ | ------------------------------------ |
| `--d2-warm-bg`   | `oklch(0.98 0.01 75)`          | Warm cream page bg                   |
| `--d2-cream`     | `oklch(0.97 0.012 75)`         | Card bg                              |
| `--d2-ink`       | `oklch(0.18 0.02 260)`         | Primary text                         |
| `--d2-accent`    | `oklch(0.62 0.14 160)`         | Brand green-teal · primary CTA accent |
| `--d2-coral`     | `oklch(0.72 0.13 38)`          | Warm accent · pool sq                |
| `--d2-lav`       | `oklch(0.76 0.08 310)`         | Cool accent · gradients              |

### Dark mode

Apply `[data-theme="dark"]` to `<html>`. Tokens flip automatically. The Tweaks panel in the design exposes the toggle; in production a user setting drives it.

### Typography

- **Sans:** Geist (400, 500, 600, 700) · all UI body and headings
- **Mono:** Geist Mono (400, 500) · numerical values, kicker labels, codes, status pills

Type scale (commonly used):

| Class / role        | Size      | Weight | Letter-spacing |
| ------------------- | --------- | ------ | -------------- |
| Hero title          | 2rem (32) | 600    | -0.03em        |
| Page title          | 1.5rem    | 600    | -0.02em        |
| Section title       | 1.125rem  | 600    | -0.02em        |
| Body                | 0.875rem  | 400    | normal         |
| Body small          | 0.8125rem | 500    | normal         |
| Kicker mono         | 0.6875rem | 400    | 0.06em UPPER   |

### Radius

| Token         | Value               |
| ------------- | ------------------- |
| `--radius`    | `0.625rem` (10px)   |
| `--radius-sm` | `0.375rem` (6px)    |
| `--radius-md` | `0.5rem` (8px)      |
| Cards (D2)    | `14px`–`18px`       |
| Pills         | `999px`             |

### Spacing

Use Tailwind's default 4px scale (`0.25rem` increments). Most internal padding is `0.75–1.25rem`; gaps between cards `0.75rem`; section gaps `1.25–2rem`.

### Status row treatment

Tables use a **left-edge gradient tint** keyed by status (`paid` / `pending` / `out` / `linked` / `drift`, etc.). See `.status-row[data-tone="…"]` in `shell-styles.css`. The Tweaks panel exposes 4 variants — production should ship the **gradient** variant (default).

---

## 7. Component inventory (from the design)

| Component                   | Location in code           | Notes                                         |
| --------------------------- | -------------------------- | --------------------------------------------- |
| `<PPShell>`                 | `poolpay/shell.jsx`        | Sidebar + topbar + content slot. Role-aware.  |
| `<PPSidebar>`               | `poolpay/shell.jsx`        | Single sidebar; sections gated by role        |
| `<PPTopbar>`                | `poolpay/shell.jsx`        | Crumbs + title + sub + search + bell + CTA   |
| `<Lu>` (Lucide icon)        | `poolpay/lucide.jsx`       | Wrap any Lucide icon by name                  |
| `<Field>`                   | `poolpay/missing-screens.jsx` | Form input · default/focus/error/disabled |
| `<PrimaryBtn>` / `<GhostBtn>` / `<DangerBtn>` | `missing-screens.jsx` | Three button variants only        |
| `<Skel>`                    | `missing-screens.jsx`      | Shimmer skeleton primitive                    |
| `<ModalShell>`              | `missing-screens.jsx`      | Centered modal w/ blurred backdrop            |
| Status pill `.pill.paid/.out` | `shell-styles.css`       | Consistent across all roles                   |

**Do not introduce new button styles or input styles.** If you need a variant, parameterize one of the above.

---

## 8. Responsive behavior

The web app is responsive — same React tree at desktop and mobile widths. Breakpoint: `768px`.

- **Desktop (≥768px):** sidebar visible, topbar with full search.
- **Mobile (<768px):** sidebar collapses to a top app bar + bottom tab bar. The mobile artboards in `poolpay-app.html` (sections `mem-m`, `adm-m`) show the target.
- **Super-admin is desktop-only.** On mobile, super-admin routes redirect to `/home` with a banner: "Super-admin tools are desktop-only."
- **Admin mobile is read-only.** Settings / member management / cycle config are blocked behind a "Open on desktop" prompt.

PWA: install-to-home-screen is **not** in v1 scope. Plan for it but ship without it. Build the manifest + offline route now (`/offline`), wire the service worker later.

---

## 9. Integration & environment

### 9.1 Required services

| Service                      | What for                                    | v1 status      |
| ---------------------------- | ------------------------------------------- | -------------- |
| Auth (sessions + password)   | sign-in, sign-up, recovery                  | TBD — your call: bare Postgres + bcrypt + httpOnly cookie is fine; or Supabase/Auth.js |
| WhatsApp webhook receiver    | receipt ingestion                           | bot exists; PoolPay needs the inbound endpoint |
| Image storage                | receipt screenshots                         | S3 / R2 / Supabase Storage. Receipts are private, signed URLs only. |
| OTP delivery                 | password recovery via WhatsApp message      | likely Twilio WhatsApp Business or Meta Cloud API |
| Postgres                     | primary store                               | required       |
| Redis (optional v1)          | session cache, rate limit                   | nice-to-have   |

### 9.2 Environment variables (suggested)

```
DATABASE_URL=
SESSION_SECRET=
WA_WEBHOOK_SECRET=          # validates inbound from the bot
WA_API_TOKEN=               # for sending OTP messages
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
APP_URL=                    # base url, used in invite links
```

### 9.3 Stack recommendation (non-binding)

Next.js (app router) + Postgres + Drizzle/Prisma + Auth.js + Tailwind + the existing shell-styles.css imported as-is. Tailwind is overkill given how much styling is already in `shell-styles.css` — feel free to ship without it and just use the class system already established.

---

## 10. What's mocked vs. real in the design

| Element                              | Real / Mock                                         |
| ------------------------------------ | --------------------------------------------------- |
| Numbers (₦ amounts, member counts)    | Mock — all hardcoded                                |
| Pool names, member names, dates       | Mock                                                |
| Charts / sparklines                   | Mock (drawn as SVG)                                 |
| Receipt screenshots                   | Placeholder striped boxes                           |
| Tweaks panel                          | Design-time only — DO NOT ship                      |
| Theme toggle                          | Design-time only — replace with user setting in DB  |
| All interactivity inside artboards    | Static — clicks don't do anything                   |

When implementing: every artboard is a snapshot of state. Hook the data layer up; don't reinvent the layout.

---

## 11. Out of scope for v1

- Push notifications (use inbox + WhatsApp instead)
- Native iOS / Android apps (responsive web only; PWA later)
- In-app payments / fund custody (still bank transfers)
- Multi-currency conversion (each pool has one currency, period)
- Receipt OCR (humans confirm, by design)
- Marketing site
- Analytics dashboard for super-admin (just the Groups list with health pills)

---

## 12. Open questions for product

These are explicitly **not answered by the design** and need a decision before coding:

1. **Session length:** "Keep me signed in 30 days" is in the UI — confirm 30d cookie or shorter.
2. **OTP channel fallback:** WhatsApp is primary. If a number isn't on WhatsApp, do we SMS or block?
3. **Removing a member with outstanding balance:** the destructive modal warns but doesn't block. Should the system hard-block until settled? (Recommend yes.)
4. **Cycle close trigger:** auto-close on due-date + 7d, or admin-only manual?
5. **Currency precision:** all examples are NGN whole-naira. Do we need decimals for KES/GHS? (Likely yes — store as minor units regardless.)
6. **Audit log retention:** how long do we keep rejected receipts and removed-member records?
7. **WhatsApp group drift detection:** what triggers the `drift` status? Phone-number diff at hourly cadence?

---

## 13. File layout in this handoff

```
poolpay-app.html                 — design canvas, all screens
poolpay/
  shell-styles.css               — TOKENS + base styles · lift wholesale
  shell.jsx                      — PPShell, PPSidebar, PPTopbar
  lucide.jsx                     — <Lu> icon wrapper
  member-desktop.jsx             — MD_Home, MD_Pool, MD_Pay, MD_Inbox, MD_Profile
  member-mobile.jsx              — MM_*  responsive variants
  admin-desktop.jsx              — AD_Receipts, AD_Empty, AD_Group
  admin-mobile.jsx               — AM_Receipts, AM_Group
  super-desktop.jsx              — SD_Receipts, SD_Groups, SD_GroupDetail, SD_Admins, SD_WhatsApp
  whatsapp-story.jsx             — WAStoryboard (illustrative)
  missing-screens.jsx            — Auth, errors, empties, modals, loading, toasts, form states
  design-canvas.jsx              — design-time only · do NOT ship
  ios-frame.jsx                  — design-time only · do NOT ship
HANDOFF.md                       — this file
```

The `.jsx` files were written for the design canvas. They use plain JSX with global components (no module system). When porting to a real framework, treat them as **layout reference** and re-write component-by-component — copy markup and styles, not the script-tag plumbing.

---

## 14. Acceptance checklist

A first cut is shippable when:

- [ ] All 26 desktop + 7 mobile artboards render at production parity (visual diff vs. `poolpay-app.html`)
- [ ] Auth flow signs in real users; OTP recovery works end-to-end
- [ ] An admin can confirm a real WhatsApp receipt and the member sees it in their inbox within 5s
- [ ] Super-admin can create a pool, assign a scoped admin, and the new admin can sign in with the temp credentials
- [ ] Empty / loading / error states fire on the right conditions (test by killing the network mid-load)
- [ ] Dark mode works (tokens flip; no hardcoded colors leaked through)
- [ ] Mobile responsive at 390px wide; super-admin routes redirect on mobile
- [ ] Audit: every state change has a log row (who, when, what)

Ship narrow. The product is _ledger + matching + queue_. Everything else is decoration.
