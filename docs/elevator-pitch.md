---
title: PoolPay — Elevator Pitch
tags: [poolpay, pitch, comms]
aliases: [PoolPay Pitch, Recruiter Pitch]
audience: [recruiters, non-technical, technical-followup]
---

# PoolPay — Elevator Pitch

A pocket script for explaining PoolPay without losing the listener in tech jargon. Lead with the **human problem**, not the stack. Save the architecture for round two.

> [!tip] Framing trick
> Say **"two services"** out loud before naming any tech. It signals architectural awareness without sounding like a buzzword tour, and gives the listener a mental box for each piece you name afterwards.

---

## 10-second version

> PoolPay is a dashboard for running savings circles — the kind of informal money-pooling group where everyone chips in each month and one member takes home the pot. I built the tool that lets the organizer see who's paid, who hasn't, and whose turn is up — without juggling a WhatsApp group and a spreadsheet.

## 30-second version (if they lean in)

> It's built for **Ajo** groups — a Nigerian rotating-savings tradition where, say, ten friends each put in ₦10,000 a month and one person collects the full ₦100,000 that month. Next month someone else collects, and so on until everyone's had a turn. The headache is always the organizer's: tracking payments, chasing latecomers, remembering whose cycle it is. PoolPay turns that into a single screen — active cycle, who owes, collection progress, and a clean admin view for setting up groups and members.

---

## If they ask "what's the stack?" — under-the-hood tier

> It's **two services**. The **frontend** is a Next.js dashboard — TypeScript, server-rendered, Tailwind + shadcn for the UI. The **backend** is a separate Rust API talking to SurrealDB, which the dashboard hits through a thin server-side fetch layer. Auth is NextAuth-issued JWTs, signed with a shared secret so the Rust API trusts the token without a second round-trip. There's also a WhatsApp bot side that feeds payment receipts into the same database, so members can confirm payments by message instead of needing a login. Tested with Vitest and Playwright end-to-end.

## If they push deeper — one line per layer

| Layer | Tech | What it does |
|---|---|---|
| Dashboard | Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui | Organizer-facing UI, server components, server actions |
| Auth | NextAuth v5, JWT, HMAC-shared secret | Signs in once, token is trusted by the API |
| API | Rust, SurrealDB | Groups, members, cycles, payments, receipts |
| Bot | WhatsApp webhook → matcher service | Members confirm payments via message |
| Quality | Vitest (unit), Playwright (E2E + visual) | Regression + a11y coverage |

---

## Reusable formula

> It's a [dashboard / tool] for [who] so they can [the one thing they couldn't do before].

For PoolPay → *"A dashboard for savings-group organizers so they can see payments and cycle progress at a glance."* Safe fallback when eyes start glazing.

## What to avoid

- Leading with "Rust" or "SurrealDB" cold — those are answers to *how*, not *what*.
- Mentioning kobo, server actions, HMAC, or NextAuth internals before the listener has asked.
- Listing every tool in the repo. The table above is a menu, not a recital.

## Related

- [[wiki/poolpay/architecture/auth-api-contract|Auth API contract]]
- `poolpay-app/README.md`
- `poolpay-app/docs/RUNBOOK.md`
