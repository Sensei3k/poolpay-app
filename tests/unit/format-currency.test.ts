import { describe, expect, it } from 'vitest';
import { currencySymbol, formatCurrency } from '@/lib/format/currency';

describe('formatCurrency', () => {
  it('formats NGN as whole naira with the ₦ symbol', () => {
    expect(formatCurrency(1_200_000, 'NGN')).toMatch(/₦12,000/);
  });

  it('drops decimals for NGN regardless of input precision', () => {
    expect(formatCurrency(1_200_050, 'NGN')).not.toMatch(/\.5/);
  });

  it('renders zero amounts without an em-dash', () => {
    const out = formatCurrency(0, 'NGN');
    expect(out).toContain('0');
    expect(out).toContain('₦');
  });

  it('keeps GHS at two decimal places', () => {
    const out = formatCurrency(150_000, 'GHS');
    expect(out).toMatch(/1,500\.00/);
  });

  it('drops decimals for KES even though minor units exist', () => {
    const out = formatCurrency(150_000, 'KES');
    expect(out).not.toMatch(/\.00/);
    expect(out).toContain('1,500');
  });

  it('groups thousands for large NGN amounts', () => {
    expect(formatCurrency(12_345_678_900, 'NGN')).toContain(',');
  });

  it('throws on unsupported currencies', () => {
    // @ts-expect-error testing runtime guard against typing escape-hatches
    expect(() => formatCurrency(0, 'XYZ')).toThrow(/unsupported currency/);
  });
});

describe('currencySymbol', () => {
  it('forces the canonical NGN naira symbol', () => {
    expect(currencySymbol('NGN')).toBe('₦');
  });

  it('returns a string for every supported currency', () => {
    expect(currencySymbol('GHS')).toBeTruthy();
    expect(currencySymbol('KES')).toBeTruthy();
    expect(currencySymbol('USD')).toBeTruthy();
  });
});
