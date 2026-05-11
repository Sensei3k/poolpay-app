export type StrengthTier = "weak" | "ok" | "strong";

/**
 * Visual-only heuristic mirroring the design handoff's `scoreStrength`.
 *
 * Not a gate — zod enforces the 8-char minimum. This is purely a UX nudge to
 * encourage stronger passwords. Offline (no zxcvbn dep).
 *
 * Points:
 *  - length ≥ 8        (+1)
 *  - length ≥ 12       (+1)
 *  - mixed case        (+1)
 *  - digit present     (+1)
 *  - special char      (+1)
 *
 * ≤1 → weak · 2–3 → ok · ≥4 → strong.
 *
 * Returns null for an empty string so callers can hide the meter on an
 * untouched field.
 */
export function scoreStrength(password: string): StrengthTier | null {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return "weak";
  if (score <= 3) return "ok";
  return "strong";
}
