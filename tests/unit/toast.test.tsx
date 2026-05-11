// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '@/components/feedback/toast';

afterEach(() => {
  cleanup();
});

describe('Toast', () => {
  it('renders the title and optional description', () => {
    render(
      <Toast
        title="Receipt confirmed"
        description="Tola B. · ₦ 12,000 · cycle 10"
      />,
    );
    expect(screen.getByText('Receipt confirmed')).toBeTruthy();
    expect(screen.getByText('Tola B. · ₦ 12,000 · cycle 10')).toBeTruthy();
  });

  it('exposes status role and aria-live polite for non-urgent tones', () => {
    render(<Toast title="Saved" />);
    const node = screen.getByRole('status');
    expect(node.getAttribute('aria-live')).toBe('polite');
  });

  it('uses alert role and aria-live assertive for error tone', () => {
    render(<Toast tone="error" title="Upload failed" />);
    const node = screen.getByRole('alert');
    expect(node.getAttribute('aria-live')).toBe('assertive');
  });

  it('uses alert role and aria-live assertive for warning tone', () => {
    render(<Toast tone="warning" title="Storage almost full" />);
    const node = screen.getByRole('alert');
    expect(node.getAttribute('aria-live')).toBe('assertive');
  });

  it('omits the dismiss button by default', () => {
    render(<Toast title="Saved" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders and fires the dismiss button when onDismiss is provided', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Toast title="Saved" onDismiss={onDismiss} />);
    await user.click(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    );
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
