// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { SkeletonBlock } from '@/components/feedback/skeleton-block';

afterEach(() => {
  cleanup();
});

describe('SkeletonBlock', () => {
  it('marks itself aria-hidden so screen readers skip the shimmer', () => {
    const { container } = render(<SkeletonBlock />);
    const span = container.querySelector('span');
    expect(span?.getAttribute('aria-hidden')).toBe('true');
  });

  it('coerces numeric width/height into pixel strings', () => {
    const { container } = render(<SkeletonBlock w={120} h={14} />);
    const span = container.querySelector('span');
    expect(span?.style.width).toBe('120px');
    expect(span?.style.height).toBe('14px');
  });

  it('passes percentage widths through verbatim', () => {
    const { container } = render(<SkeletonBlock w="60%" />);
    const span = container.querySelector('span');
    expect(span?.style.width).toBe('60%');
  });

  it('applies the configured radius', () => {
    const { container } = render(<SkeletonBlock r={999} />);
    const span = container.querySelector('span');
    expect(span?.style.borderRadius).toBe('999px');
  });

  it('keeps the surface-shimmer animation set on the inline style', () => {
    const { container } = render(<SkeletonBlock />);
    const span = container.querySelector('span');
    expect(span?.style.animation).toContain('surface-shimmer');
  });
});
