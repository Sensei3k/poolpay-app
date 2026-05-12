import type { CSSProperties } from 'react';

export interface SkeletonBlockProps {
  /** CSS width, accepts strings or numbers (numbers become px). */
  w?: string | number;
  /** CSS height, accepts strings or numbers (numbers become px). */
  h?: string | number;
  /** Border-radius. Defaults to 6px (matches the handoff `<Skel>` default). */
  r?: number;
  /** Extra inline styles for composition. */
  style?: CSSProperties;
  className?: string;
}

const toCssDimension = (value: string | number | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

/**
 * Shimmer skeleton primitive lifted from the handoff `<Skel>` artboard.
 * Mirrors the ink linear-gradient shimmer rather than the shadcn
 * `<Skeleton>` pulse so the loading state visually matches the rest of
 * the brand surface. The shadcn primitive stays for chart skeletons and
 * the legacy dashboard loading.tsx; new shell-aware skeletons compose
 * this.
 */
export function SkeletonBlock({
  w = '100%',
  h = 14,
  r = 6,
  style,
  className,
}: SkeletonBlockProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-block',
        width: toCssDimension(w),
        height: toCssDimension(h),
        borderRadius: r,
        background:
          'linear-gradient(90deg, color-mix(in oklch, var(--ink) 6%, transparent) 0%, color-mix(in oklch, var(--ink) 11%, transparent) 50%, color-mix(in oklch, var(--ink) 6%, transparent) 100%)',
        backgroundSize: '200% 100%',
        animation: 'surface-shimmer 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}
