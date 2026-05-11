// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/feedback/empty-state';

afterEach(() => {
  cleanup();
});

describe('EmptyState', () => {
  it('renders the title as a heading with the default h3 level', () => {
    render(
      <EmptyState
        icon={<svg aria-hidden="true" />}
        title="Inbox is empty"
        description="Nothing yet."
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Inbox is empty', level: 3 }),
    ).toBeTruthy();
  });

  it('promotes the heading to h2 when requested', () => {
    render(
      <EmptyState
        icon={<svg aria-hidden="true" />}
        title="No pools"
        headingLevel="h2"
      />,
    );
    expect(screen.getByRole('heading', { name: 'No pools', level: 2 })).toBeTruthy();
  });

  it('omits the action row when no primary or secondary actions are supplied', () => {
    const { container } = render(
      <EmptyState icon={<svg aria-hidden="true" />} title="No pools" />,
    );
    expect(container.querySelector('button')).toBeNull();
  });

  it('renders the primary + secondary CTAs when both are supplied', () => {
    render(
      <EmptyState
        icon={<svg aria-hidden="true" />}
        title="No pools"
        primaryAction={<button type="button">Join</button>}
        secondaryAction={<button type="button">Ask</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Join' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ask' })).toBeTruthy();
  });

  it('exposes the ariaLabel on the root region', () => {
    render(
      <EmptyState
        ariaLabel="No pools yet"
        icon={<svg aria-hidden="true" />}
        title="No pools"
      />,
    );
    const region = screen.getByRole('status', { name: 'No pools yet' });
    expect(region).toBeTruthy();
  });

  it('applies the dashed-border tone wrapper when tone="dashed"', () => {
    render(
      <EmptyState
        ariaLabel="No admins"
        tone="dashed"
        icon={<svg aria-hidden="true" />}
        title="No admins"
      />,
    );
    const region = screen.getByRole('status', { name: 'No admins' });
    // The dashed variant sets a `border: 1px dashed …` inline style; the
    // muted variant does not. We assert the border presence rather than
    // the exact colour because color-mix() resolves to differently-formatted
    // strings across jsdom versions.
    expect(region.style.border.includes('dashed')).toBe(true);
  });
});
