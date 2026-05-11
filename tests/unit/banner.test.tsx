// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Banner } from '@/components/feedback/banner';

afterEach(() => {
  cleanup();
});

describe('Banner', () => {
  it('renders the title and body', () => {
    render(<Banner title="Pool paused." body="3 members are >7 days overdue." />);
    expect(screen.getByText('Pool paused.')).toBeTruthy();
    expect(screen.getByText('3 members are >7 days overdue.')).toBeTruthy();
  });

  it('exposes status role and aria-live polite for non-urgent tones', () => {
    render(<Banner body="Update available." />);
    const node = screen.getByRole('status');
    expect(node.getAttribute('aria-live')).toBe('polite');
  });

  it('uses alert role and aria-live assertive for error tone', () => {
    render(<Banner tone="error" body="Payment failed." />);
    const node = screen.getByRole('alert');
    expect(node.getAttribute('aria-live')).toBe('assertive');
  });

  it('uses alert role and aria-live assertive for warning tone', () => {
    render(<Banner tone="warning" body="Pool paused." />);
    const node = screen.getByRole('alert');
    expect(node.getAttribute('aria-live')).toBe('assertive');
  });

  it('renders the dismiss button only when onDismiss is provided', () => {
    const { rerender } = render(<Banner body="Add a payout method" />);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();

    rerender(<Banner body="Add a payout method" onDismiss={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy();
  });

  it('fires onDismiss when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Banner body="Remind me later" onDismiss={onDismiss} />);
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders inline actions when provided', () => {
    render(
      <Banner
        body="Add a payout method"
        actions={<button type="button">Set up</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Set up' })).toBeTruthy();
  });

  it('accepts a custom dismissLabel for the close button', () => {
    render(
      <Banner body="x" onDismiss={() => undefined} dismissLabel="Close banner" />,
    );
    expect(screen.getByRole('button', { name: 'Close banner' })).toBeTruthy();
  });
});
