import { cn } from '@/lib/utils';

const SWATCH_BACKGROUNDS: Record<'a' | 'b' | 'c' | 'd', string> = {
  a: 'linear-gradient(135deg, var(--accent-primary), var(--pool-swatch-teal))',
  b: 'linear-gradient(135deg, var(--accent-coral), var(--pool-swatch-coral-deep))',
  c: 'linear-gradient(135deg, var(--accent-lavender), var(--pool-swatch-lav-deep))',
  d: 'linear-gradient(135deg, var(--pool-swatch-aqua), var(--accent-primary))',
};

export interface PoolSwatchProps {
  /** Single-character glyph (e.g. first letter of pool name). */
  glyph: string;
  /** Color slot a..d, paired to the gradient set above. */
  swatch: 'a' | 'b' | 'c' | 'd';
  /** Render size, `sm` = 32px (mobile cards), `md` = 36px (desktop cards). */
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
