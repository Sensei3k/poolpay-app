import { cn } from '@/lib/utils';
import type { PoolSwatchSlot } from '@/lib/view-models/admin';

const GLYPH_BACKGROUNDS: Record<PoolSwatchSlot, string> = {
  a: 'linear-gradient(135deg, var(--d2-accent), var(--pool-swatch-teal))',
  b: 'linear-gradient(135deg, var(--d2-coral), var(--pool-swatch-coral-deep))',
  c: 'linear-gradient(135deg, var(--d2-lav), var(--pool-swatch-lav-deep))',
  d: 'linear-gradient(135deg, var(--pool-swatch-aqua), var(--d2-accent))',
};

export interface PoolGlyphProps {
  /** Single character drawn inside the tile (initial of pool name). */
  initial: string;
  /** Swatch slot 'a'..'d', keyed off pool id by `pickPoolSwatch`. */
  swatch: PoolSwatchSlot;
  /**
   * Render size, `xs` = 22px (queue rows), `sm` = 30px (mobile rows), `md`
   * = 36px (header / breadcrumb).
   */
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PoolGlyphProps['size']>, string> = {
  xs: 'h-[22px] w-[22px] rounded-md text-[11px]',
  sm: 'h-[30px] w-[30px] rounded-lg text-[12px]',
  md: 'h-9 w-9 rounded-lg text-sm',
};

/**
 * Admin-side pool glyph. Mirrors the member-side `<PoolSwatch>` so the
 * same pool renders with the same gradient + initial across surfaces.
 * Kept independent from the member component so each side can iterate on
 * sizing without leaking the other's design choices.
 */
export function PoolGlyph({
  initial,
  swatch,
  size = 'xs',
  className,
}: PoolGlyphProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-bold text-white',
        SIZE_CLASSES[size],
        className,
      )}
      style={{ background: GLYPH_BACKGROUNDS[swatch] }}
    >
      {initial}
    </span>
  );
}
