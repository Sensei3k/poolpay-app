'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const subscribe = () => () => {};
const getMountedSnapshot = () => true;
const getMountedServerSnapshot = () => false;

/**
 * Sidebar-styled theme toggle. Lives next to the sign-out button in the
 * user-foot block. Cycles light and dark; system mode is honoured on first
 * paint via next-themes defaults but not exposed as a third click target,
 * since the sidebar slot is icon-only and a dropdown would visually clash
 * with the adjacent sign-out icon button.
 *
 * Hydration: render a neutral placeholder until mounted so the SSR HTML
 * (theme unknown server-side) and the first client render agree on icon
 * choice. `useSyncExternalStore` provides the mounted flag without a
 * setState-in-effect, satisfying `react-hooks/set-state-in-effect`.
 */
export function SidebarThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    getMountedSnapshot,
    getMountedServerSnapshot,
  );

  const isDark = mounted && resolvedTheme === 'dark';
  const next = isDark ? 'light' : 'dark';
  const label = mounted ? `Switch to ${next} theme` : 'Toggle theme';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!mounted}
      onClick={() => setTheme(next)}
      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-ink/5"
      style={{ color: 'color-mix(in oklch, var(--ink) 60%, transparent)' }}
    >
      {isDark ? (
        <Sun size={15} aria-hidden="true" />
      ) : (
        <Moon size={15} aria-hidden="true" />
      )}
    </button>
  );
}
