// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const setTheme = vi.fn();
let resolvedTheme: string | undefined = 'light';

vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

import { SidebarThemeToggle } from '@/components/layout/sidebar-theme-toggle';

afterEach(() => {
  cleanup();
  setTheme.mockReset();
  resolvedTheme = 'light';
});

describe('SidebarThemeToggle', () => {
  it('renders a moon icon and calls setTheme("dark") when current is light', async () => {
    resolvedTheme = 'light';
    render(<SidebarThemeToggle />);
    const button = await screen.findByRole('button', { name: 'Switch to dark theme' });
    await userEvent.click(button);
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('renders a sun icon and calls setTheme("light") when current is dark', async () => {
    resolvedTheme = 'dark';
    render(<SidebarThemeToggle />);
    const button = await screen.findByRole('button', { name: 'Switch to light theme' });
    await userEvent.click(button);
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
