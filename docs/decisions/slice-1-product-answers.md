# Slice 1 — locked product answers

These resolve two of the open questions in `docs/design-handoff/HANDOFF.md` §12.
The vendored handoff stays untouched; this file is the source of truth going
forward. Locked 2026-05-10.

---

## 1. Session length — opt-in 30 days `[locked 2026-05-10]`

**Decision.** Modern security best practice: short access token, short refresh
token by default, with an explicit user opt-in to extend the refresh-token
lifetime to 30 days.

| Token         | Default lifetime | When `Keep me signed in` is checked |
| ------------- | ---------------- | ----------------------------------- |
| Access token  | 15–60 min        | unchanged                           |
| Refresh token | ~1 day           | 30 days                             |

The "Keep me signed in for 30 days" checkbox on `/signin` is **opt-in only**.
Default is unchecked → ~1-day refresh-token lifetime → user re-authenticates
the next day.

### Slice-1 scope (this PR)

- A `rememberMe` checkbox renders below the password field on `/signin`.
- The submit handler sends `rememberMe: boolean` through `signInAction` and
  on to `issueTokens`, which forwards it to the backend `/api/auth/issue`
  body as `{ userId, rememberMe }`.
- The FE plumbing is in place even though the backend may not honour the
  flag yet — the additive field is a no-op on backends that ignore it.

### Slice-5 (api) follow-up

- The Rust backend reads `rememberMe` from the issue request and selects
  the refresh-token lifetime accordingly (default ~1 day, opt-in 30 days).
- Until that lands, the refresh token's effective lifetime is whatever the
  backend currently issues. That gap is acknowledged here so we don't
  pretend the FE checkbox already changes behaviour end-to-end.

### Why we don't change `SESSION_MAX_AGE_SECS`

The NextAuth session cookie wraps the backend-issued tokens. Its `maxAge` is
already 30 days (NextAuth default, mirrored in `lib/auth/auth-config.ts`).
The actual security boundary is the **refresh-token lifetime**, controlled
by the backend. Touching the cookie `maxAge` here would not change how
long the user stays signed in — only how long the encrypted JWT cookie
itself survives in the browser.

---

## 2. OTP fallback — hard-block on no WhatsApp `[locked 2026-05-10]`

**Decision.** WhatsApp is the **only** OTP delivery channel. There is no SMS
fallback, no choose-your-channel UI.

If a user's phone number is not on WhatsApp, the recovery flow surfaces a
clear error state and directs them to contact their group admin. The admin
will reset access on their behalf via the super-admin tools (slice 6).

### Why no SMS

- Bot detection / SIM-swap risk is materially higher on SMS.
- Adds a second deliverability vendor to operate, monitor, and pay for.
- Most target users are already on WhatsApp — that's the medium the groups
  coordinate over already.
- Diaspora numbers are often on data-only plans; SMS would simply not
  arrive.

### Slice-1 scope (this PR)

- `/recover` copy emphasises WhatsApp-only delivery; no "or SMS" copy.
- `/recover/verify` copy emphasises WhatsApp; no "didn't get the code? try
  SMS" affordance.
- A "no WhatsApp on this number" error state is documented in copy on the
  `/recover` editorial panel: _"We couldn't reach you on WhatsApp. Contact
  your group admin to recover access."_
- The zod schemas for the future real flow are sketched: a single E.164
  phone field on `/recover`; a 6-digit numeric code on `/recover/verify`.
  No SMS-channel field exists in either schema.

### Slice-4 (recovery flow) follow-up

- API returns a structured error code `whatsapp_unreachable` when delivery
  fails because the number is not registered with WhatsApp.
- FE renders the locked copy above on that error.
- Admin recovery UI surfaces a "reset member access" action (slice 6).

---

## Provenance

| Question                          | Source                                  |
| --------------------------------- | --------------------------------------- |
| Session length default + opt-in   | Product call 2026-05-10                 |
| WhatsApp-only OTP delivery        | Product call 2026-05-10                 |
| Slice-5 backend lifetime knob     | Backlog item, owner: api maintainer     |
| Slice-4 `whatsapp_unreachable`    | Recovery-flow ticket, slice 4 spec      |

Subsequent open questions in `HANDOFF.md` §12 (3–7) remain unresolved and
will be answered as their respective slices come up.
