# Design System

Circle Dashboard design system reference. All tokens, patterns, and conventions in one place.

---

## Overview

- **Token-based**: every colour, radius, and font is a CSS custom property — no hardcoded values in components
- **Colour space**: OKLCH — perceptually uniform, better contrast predictability than sRGB or HSL
- **Accessibility target**: WCAG 2.2 AA
- **Component foundation**: [shadcn/ui](https://ui.shadcn.com) (`base-nova` style) + [Base UI](https://base-ui.com) headless primitives + [CVA](https://cva.style) variants
- **Theme switching**: [next-themes](https://github.com/pacocoursey/next-themes) — system preference by default, manual override via header toggle, persisted in `localStorage`

---

## Colour Tokens

All tokens are defined in `app/globals.css`. Light values live in `:root`, dark overrides in `.dark`.

### Core Semantic Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Page background (`bg-background`) |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Default text (`text-foreground`) |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Card surface (`bg-card`) |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text on cards |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Dropdown/popover surface |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text in popovers |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Primary action colour |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Text on primary backgrounds |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Secondary surfaces |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on secondary surfaces |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Subdued backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Placeholder / secondary text |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover/focus highlight surface |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent surfaces |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error states, destructive actions |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Dividers and outlines |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Form input borders |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus ring |

### Chart Tokens

Chart colours are **identical in light and dark** — they were chosen to read well on both backgrounds.

| Token | Value | Usage |
|-------|-------|-------|
| `--chart-1` | `oklch(0.809 0.105 251.813)` | Lightest blue |
| `--chart-2` | `oklch(0.623 0.214 259.815)` | Blue |
| `--chart-3` | `oklch(0.546 0.245 262.881)` | Mid blue |
| `--chart-4` | `oklch(0.488 0.243 264.376)` | Dark blue |
| `--chart-5` | `oklch(0.424 0.199 265.638)` | Darkest blue |

### Ajo Accent Tokens

> **Theme-invariant** — these colours do not change between light and dark. They are set directly in `@theme inline`, not in `:root`/`.dark`, so they are never overridden. Do not add `.dark` overrides for these unless the contrast requirement genuinely cannot be met without them.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-ajo-paid` | `oklch(0.696 0.17 162.48)` | Paid status text and icons (`text-ajo-paid`) |
| `--color-ajo-paid-subtle` | `oklch(0.696 0.17 162.48 / 14%)` | Paid status badge background (`bg-ajo-paid-subtle`) |
| `--color-ajo-outstanding` | `oklch(0.769 0.188 70.08)` | Outstanding status text and icons |
| `--color-ajo-outstanding-subtle` | `oklch(0.769 0.188 70.08 / 14%)` | Outstanding status badge background |
| `--color-ajo-active` | `oklch(0.696 0.17 162.48)` | Active cycle indicator (matches paid) |

### Sidebar Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Sidebar surface |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Sidebar text |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.488 0.243 264.376)` | Sidebar primary accent |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Text on sidebar primary |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Sidebar hover/focus surface |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on sidebar accent |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Sidebar dividers |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Sidebar focus ring |

---

## Typography

| Variable | Font | Usage |
|----------|------|-------|
| `--font-sans` (`--font-geist-sans`) | [Geist Sans](https://vercel.com/font) | All UI text |
| `--font-mono` (`--font-geist-mono`) | [Geist Mono](https://vercel.com/font) | Code, monospaced values |

Both fonts are loaded via `next/font/google` in `app/layout.tsx` as CSS variables, then referenced in `@theme inline`.

**Scale in use:**
- `text-sm` (0.875rem) — secondary text, dates, badges, table content
- `text-2xl` (1.5rem) — page title (h1)
- `font-semibold` — headings
- `font-medium` — badge labels, table headers

---

## Spacing & Border Radius

All radii derive from a single base token: `--radius: 0.625rem` (10px).

| Token | Calc | Approx value | Usage |
|-------|------|--------------|-------|
| `--radius-sm` | `var(--radius) * 0.6` | 6px | Tight UI elements |
| `--radius-md` | `var(--radius) * 0.8` | 8px | Inputs, small badges |
| `--radius-lg` | `var(--radius)` | 10px | Cards, default |
| `--radius-xl` | `var(--radius) * 1.4` | 14px | Modals, larger surfaces |
| `--radius-2xl` | `var(--radius) * 1.8` | 18px | Large cards |
| `--radius-3xl` | `var(--radius) * 2.2` | 22px | Decorative elements |
| `--radius-4xl` | `var(--radius) * 2.6` | 26px | Pills, fully rounded |

Use Tailwind utilities: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, etc. — they map to these tokens automatically.

---

## Theme System

### How it works

1. `next-themes` wraps the app in `components/theme-provider.tsx` (a `'use client'` boundary around `NextThemesProvider`)
2. On load, next-themes reads `localStorage` for a saved preference. If none, it falls back to `prefers-color-scheme`
3. It injects a small **blocking inline script** before React hydrates that sets `class="dark"` (or removes it) on `<html>` — this prevents any flash of the wrong theme
4. Tailwind's `@custom-variant dark (&:is(.dark *))` activates dark utilities on all elements that are descendants of `.dark` — since `.dark` is on `<html>`, everything responds

### Three theme states

| State | Behaviour |
|-------|-----------|
| `light` | Force light mode regardless of system |
| `dark` | Force dark mode regardless of system |
| `system` | Track `prefers-color-scheme` (default on first visit) |

### Selector note

The dark variant is defined as:
```css
@custom-variant dark (&:is(.dark *));
```

This matches elements that are **descendants** of `.dark`. The `<html>` element itself is not a descendant — so avoid applying dark utilities directly to `<html>`. All content inside `<body>` is matched correctly.

### Persistence

User's choice is saved to `localStorage` under the key `theme`. Manual selection always wins over system preference. Selecting "System" from the dropdown removes the override and re-enables system tracking.

### ThemeToggle

The toggle lives in `components/dashboard/theme-toggle.tsx`. It uses:
- shadcn `DropdownMenu` — three explicit options: Light, Dark, System
- shadcn `Tooltip` — accessible label on the icon-only trigger button
- `useTheme()` from next-themes — `setTheme` for state changes
- lucide-react `Sun` / `Moon` / `Monitor` icons

The trigger button shows an animated Sun↔Moon icon using CSS transforms (`scale` + `rotate`) — both icons stay in the DOM to avoid hydration mismatches when `resolvedTheme` is `undefined` on first render.

### FOUC prevention

`suppressHydrationWarning` is set on `<html>` in `app/layout.tsx`. This tells React to accept the class mismatch between server-rendered HTML (no class) and client-hydrated HTML (class set by the inline script). Without this, React would log a hydration warning in development.

---

## Component Patterns

### CVA + Base UI

Components use [CVA](https://cva.style) for variant management on top of [Base UI](https://base-ui.com) headless primitives. This keeps behaviour (focus management, ARIA, keyboard) separate from styling.

Example — adding a new Button variant:

```tsx
// components/ui/button.tsx
const buttonVariants = cva('...base classes...', {
  variants: {
    variant: {
      default: '...',
      outline: '...',
      // Add your variant here:
      brand: 'bg-ajo-paid text-white hover:bg-ajo-paid/90',
    },
  },
});
```

### Client Component pattern

Use `'use client'` only when the component needs:
- React hooks (`useState`, `useEffect`, `useTheme`, etc.)
- Browser APIs
- Event handlers that can't be passed as props from a server component

Server Components can import Client Components freely — the RSC boundary is one-way. `ThemeToggle` is a Client Component imported into the `DashboardHeader` Server Component as the reference example.

### shadcn components

All shadcn components live in `components/ui/`. Current inventory:

| Component | File | Notes |
|-----------|------|-------|
| Button | `button.tsx` | Base-UI primitive + CVA variants |
| Badge | `badge.tsx` | Base-UI `useRender` |
| Card | `card.tsx` | Composite: Card, CardHeader, CardContent, etc. |
| Progress | `progress.tsx` | — |
| Chart | `chart.tsx` | Recharts wrapper |
| Table | `table.tsx` | Semantic table |
| Separator | `separator.tsx` | Divider |
| Skeleton | `skeleton.tsx` | Loading placeholder |
| DropdownMenu | `dropdown-menu.tsx` | Radix-based, used in ThemeToggle |
| Tooltip | `tooltip.tsx` | Radix-based, used in ThemeToggle |

---

## Accessibility

- **Target**: WCAG 2.2 AA
- **Skip link**: `<a href="#main-content">` in `app/layout.tsx` — visible on keyboard focus, uses `sr-only focus:not-sr-only`
- **Icon buttons**: always have `aria-label` describing the action, never the current state. Icons carry `aria-hidden="true"`
- **Semantic HTML**: `<header>`, `<main id="main-content">`, `<table>` with proper `<th scope>` attributes
- **Focus rings**: all interactive elements inherit `outline-ring/50` from the base layer reset
- **Automated checks**: `@axe-core/playwright` runs in E2E tests — add `checkA11y(page)` assertions to any new test file

---

## Adding New Tokens

1. **Add to both `:root` and `.dark`** in `app/globals.css`:
   ```css
   :root {
     --my-token: oklch(...);
   }
   .dark {
     --my-token: oklch(...);
   }
   ```

2. **Expose as a Tailwind utility** by referencing it in `@theme inline`:
   ```css
   @theme inline {
     --color-my-token: var(--my-token);
   }
   ```
   This enables `bg-my-token`, `text-my-token`, `border-my-token` utilities.

3. **For theme-invariant colours** (like the ajo accents), define them directly in `@theme inline` without adding `:root`/`.dark` entries:
   ```css
   @theme inline {
     --color-my-static: oklch(...);
   }
   ```

4. **Never hardcode colour values in components.** Always use a semantic token so the value can be updated in one place and automatically responds to theme changes.
