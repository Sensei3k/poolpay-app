/**
 * Currency display formatting.
 *
 * Resolves HANDOFF §12 #5 (currency precision): minor units are stored
 * universally on the server (kobo for NGN, cents for KES/GHS), and the
 * UI layer is responsible for converting and rendering per-currency.
 *
 * NGN renders without decimals, Nigerian retail receipts almost never
 * show kobo, and the design surfaces use whole-naira typography.
 *
 * KES historically does not show cents in practice, but the ISO 4217
 * spec carries two-decimal precision and we round-trip through it so
 * future rates pages that need cent-level accuracy don't lose data.
 *
 * GHS shows two decimals, Ghanaian invoicing uses pesewas.
 *
 * USD shows two decimals.
 *
 * Implementation note: `Intl.NumberFormat` with the right locale handles
 * grouping, symbol placement, and per-currency decimal scale. We never
 * scatter `(kobo / 100).toLocaleString(...)` ternaries across the
 * codebase, every amount display goes through `formatCurrency`.
 */

import type { Currency } from '@/lib/types';

/**
 * Super-admin slice 4 surfaces operate cross-currency (the system list
 * spans NGN groups today and KES/GHS groups when they land). Define the
 * extended currency set in one place rather than scattering string
 * literal unions across view-models.
 */
export type AnyCurrency = Currency | 'KES' | 'GHS' | 'USD';

interface CurrencySpec {
  /** ISO 4217 code passed to `Intl.NumberFormat`. */
  code: AnyCurrency;
  /** Locale that ships the canonical grouping + symbol convention. */
  locale: string;
  /** Minor-unit scale: `100` means two decimals, `1` means none. */
  minorPerMajor: number;
  /**
   * Decimal places to render. Falls below `minorPerMajor`'s implied
   * precision when local convention drops the minor unit even though
   * ISO 4217 says it exists (NGN: kobo not shown; KES: cents not shown).
   */
  decimals: number;
  /** Symbol forced when `Intl` would otherwise render the ISO code. */
  symbolOverride?: string;
}

const SPECS: Readonly<Record<AnyCurrency, CurrencySpec>> = {
  NGN: { code: 'NGN', locale: 'en-NG', minorPerMajor: 100, decimals: 0, symbolOverride: '₦' },
  KES: { code: 'KES', locale: 'en-KE', minorPerMajor: 100, decimals: 0 },
  GHS: { code: 'GHS', locale: 'en-GH', minorPerMajor: 100, decimals: 2 },
  USD: { code: 'USD', locale: 'en-US', minorPerMajor: 100, decimals: 2 },
};

function spec(currency: AnyCurrency): CurrencySpec {
  const found = SPECS[currency];
  if (!found) {
    throw new Error(`format/currency: unsupported currency ${currency}`);
  }
  return found;
}

/**
 * Render a minor-units amount as a localized currency string.
 *
 * Examples:
 *  - `formatCurrency(1_200_000, 'NGN')` → `"₦12,000"`
 *  - `formatCurrency(150_000, 'GHS')` → `"GH₵1,500.00"`
 *  - `formatCurrency(0, 'NGN')` → `"₦0"`
 */
export function formatCurrency(minorUnits: number, currency: AnyCurrency): string {
  const s = spec(currency);
  const major = minorUnits / s.minorPerMajor;
  const formatted = new Intl.NumberFormat(s.locale, {
    style: 'currency',
    currency: s.code,
    minimumFractionDigits: s.decimals,
    maximumFractionDigits: s.decimals,
  }).format(major);

  if (s.symbolOverride) {
    // `Intl` sometimes prefers the ISO code (e.g. NGN under non-NG
    // runtimes). Force the canonical retail symbol so admin and
    // member views agree regardless of the server's `Intl` data set.
    return formatted.replace(s.code, s.symbolOverride);
  }
  return formatted;
}

/**
 * Symbol-only accessor used by inputs and chip captions where the
 * full grouped number isn't appropriate.
 */
export function currencySymbol(currency: AnyCurrency): string {
  const s = spec(currency);
  if (s.symbolOverride) return s.symbolOverride;
  const parts = new Intl.NumberFormat(s.locale, {
    style: 'currency',
    currency: s.code,
  }).formatToParts(0);
  const symbolPart = parts.find((p) => p.type === 'currency');
  return symbolPart?.value ?? s.code;
}
