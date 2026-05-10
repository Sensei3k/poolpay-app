import { cn } from '@/lib/utils';

const SWATCH_BACKGROUNDS: Record<'a' | 'b' | 'c' | 'd', string> = {
  a: 'linear-gradient(135deg, var(--d2-accent), oklch(0.55 0.14 190))',
  b: 'linear-gradient(135deg, var(--d2-coral), oklch(0.65 0.16 38))',
  c: 'linear-gradient(135deg, var(--d2-lav), oklch(0.6 0.13 280))',
  d: 'linear-gradient(135deg, oklch(0.6 0.13 195), var(--d2-accent))',
};

export interface PoolSwatchProps {
  /** Single-character glyph (e.g. first letter of pool name). */
  glyph: string;
  /** Color slot a..d — paired to the gradient set above. */
  swatch: 'a' | 'b' | 'c' | 'd';
  /** Render size — `sm` = 32px (mobile cards), `md` = 36px (desktop cards). */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Square pool glyph with a deterministic gradient. The four swatch
 * variants are picked from the pool id by `toPoolSummary()` so the same
 * pool always shows the same accent color across surfaces.
 */
export function PoolSwatch({
  glyph,
  swatch,
  size = 'md',
  className,
}: PoolSwatchProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-bold text-white',
        size === 'sm' ? 'h-8 w-8 text-[13px]' : 'h-9 w-9 text-sm',
        className,
      )}
      style={{ background: SWATCH_BACKGROUNDS[swatch] }}
      aria-hidden="true"
    >
      {glyph}
    </span>
  );
}
