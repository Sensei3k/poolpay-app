# Slice 1 — locked product answers

These address two of the open questions in `docs/design-handoff/HANDOFF.md` §12.
The vendored handoff stays untouched; this file is the source of truth going
forward. Status as of 2026-05-10: OTP fallback locked; session length
deferred pending security review.

---

## 1. Session length — opt-in 30 days `[deferred 2026-05-10]`

**Status.** 30-day opt-in deferred. Need to revisit after security review of
refresh-token-lifetime tradeoffs. UI checkbox markup preserved (commented
out) as forward-looking reference. Default session length unchanged from
current NextAuth config.

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
| WhatsApp-only OTP delivery        | Product call 2026-05-10                 |
| Slice-4 `whatsapp_unreachable`    | Recovery-flow ticket, slice 4 spec      |
| Session length default + opt-in   | Deferred 2026-05-10, revisit post-sec-review |

Subsequent open questions in `HANDOFF.md` §12 (3–7) remain unresolved and
will be answered as their respective slices come up.
