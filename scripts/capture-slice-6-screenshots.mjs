// Slice-6 (polish) screenshot matrix capture.
//
// Slice 6 ships the polish sweep: error/offline pages, empty states,
// loading skeletons, toast + banner primitives, confirm modals, and the
// form-state matrix. The matrix targets the real error/offline routes
// (composed on `<DarkErrorFrame>`) plus the dev-only preview routes
// under `app/internal/preview/feedback/*` and `/internal/preview/modals/*`.
//
// Matrix (52 cells total):
//   - 3 error routes (/404, /500-preview, /offline) × 3 viewports × 2 themes = 18
//   - 1 empty-states preview                       × 3 viewports × 2 themes = 6
//   - 2 skeleton previews                          × 1 viewport (1440) × 2 themes = 4
//   - 1 toasts/banners preview                     × 2 viewports (390, 1440) × 2 themes = 4
//   - 1 form-states preview                        × 2 viewports × 2 themes = 4
//   - 4 confirm-modal previews                     × 2 viewports × 2 themes = 16
//
// Output: docs/screenshots/slice-6/<route-slug>-<viewport>-<theme>.png
//
// Usage (dev server already running on :3060):
//   BASE_URL=http://localhost:3060 node scripts/capture-slice-6-screenshots.mjs
//
// Theme is forced via the `colorScheme` browser context option (drives
// `prefers-color-scheme`) and a `localStorage.theme` seed so `next-themes`
// hydrates with the chosen mode regardless of system preference. The
// browser context runs with `reducedMotion: 'reduce'` so the skeleton
// shimmer + modal entrance animations don't bleed into the captures.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const OUT_DIR = join(ROOT, 'docs', 'screenshots', 'slice-6');
const BASE_URL =
  process.env.BASE_URL ?? process.env.PREVIEW_BASE_URL ?? 'http://localhost:3060';

const VIEWPORTS = {
  mobile: { id: 'mobile', width: 390, height: 844 },
  tablet: { id: 'tablet-820', width: 820, height: 1180 },
  desktop: { id: 'desktop-1440', width: 1440, height: 900 },
};

const THEMES = [
  { id: 'light', colorScheme: 'light' },
  { id: 'dark', colorScheme: 'dark' },
];

// Error / offline routes (real routes, not previews). For /404 we hit a
// known-nonexistent path so Next.js renders `app/not-found.tsx`.
const ERROR_ROUTES = [
  { id: 'not-found', path: '/this-route-does-not-exist' },
  { id: 'err500', path: '/internal/preview/feedback/err500' },
  { id: 'offline', path: '/offline' },
];

const EMPTY_STATES_ROUTE = {
  id: 'empty-states',
  path: '/internal/preview/feedback/empty-states',
};

const SKELETON_ROUTES = [
  { id: 'home-skeleton', path: '/internal/preview/feedback/home-skeleton' },
  {
    id: 'receipts-skeleton',
    path: '/internal/preview/feedback/receipts-skeleton',
  },
];

const TOASTS_ROUTE = {
  id: 'toasts-banners',
  path: '/internal/preview/feedback/toasts-banners',
};

const FORM_STATES_ROUTE = {
  id: 'form-states',
  path: '/internal/preview/feedback/form-states',
};

const MODAL_ROUTES = [
  { id: 'pay-confirm', path: '/internal/preview/modals/pay-confirm' },
  {
    id: 'destructive-confirm',
    path: '/internal/preview/modals/destructive-confirm',
  },
  { id: 'start-cycle', path: '/internal/preview/modals/start-cycle' },
  { id: 'create-pool', path: '/internal/preview/modals/create-pool' },
];

/**
 * Cells the matrix should capture. Built as a flat list so progress
 * printing and failure tracking stay linear.
 */
function buildCells() {
  const cells = [];
  const allViewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];
  const mobileAndDesktop = [VIEWPORTS.mobile, VIEWPORTS.desktop];

  for (const route of ERROR_ROUTES) {
    for (const viewport of allViewports) {
      for (const theme of THEMES) {
        cells.push({ route, viewport, theme });
      }
    }
  }

  for (const viewport of allViewports) {
    for (const theme of THEMES) {
      cells.push({ route: EMPTY_STATES_ROUTE, viewport, theme });
    }
  }

  for (const route of SKELETON_ROUTES) {
    for (const theme of THEMES) {
      cells.push({ route, viewport: VIEWPORTS.desktop, theme });
    }
  }

  for (const viewport of mobileAndDesktop) {
    for (const theme of THEMES) {
      cells.push({ route: TOASTS_ROUTE, viewport, theme });
    }
  }

  for (const viewport of mobileAndDesktop) {
    for (const theme of THEMES) {
      cells.push({ route: FORM_STATES_ROUTE, viewport, theme });
    }
  }

  for (const route of MODAL_ROUTES) {
    for (const viewport of mobileAndDesktop) {
      for (const theme of THEMES) {
        cells.push({ route, viewport, theme });
      }
    }
  }

  return cells;
}

async function captureCell(browser, route, viewport, theme) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    colorScheme: theme.colorScheme,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  // Force theme via localStorage so next-themes picks it up consistently
  // even when the html element is server-rendered without a theme class.
  await page.addInitScript((scheme) => {
    try {
      window.localStorage.setItem('theme', scheme);
    } catch {
      /* localStorage unavailable in some restricted contexts */
    }
  }, theme.id);
  const url = `${BASE_URL}${route.path}`;
  // /404 returns HTTP 404, networkidle still resolves but goto rejects on
  // non-2xx by default. Allow any status, the rendered DOM is what matters.
  await page.goto(url, { waitUntil: 'networkidle' });
  // Modal previews mount with `open=true`, but the Radix Dialog portal
  // chains a couple of RAFs before the panel is painted. 600ms is a
  // comfortable buffer above two paints + the entrance animation, which
  // is already neutered by reducedMotion=reduce.
  await page.waitForTimeout(600);
  // Hide the Next.js dev-mode badge / overlay so it doesn't bleed into
  // the bottom-left corner of mobile / dark captures.
  await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (portal instanceof HTMLElement) portal.style.display = 'none';
  });

  const fileName = `${route.id}-${viewport.id}-${theme.id}.png`;
  const filePath = join(OUT_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  await context.close();
  return fileName;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const cells = buildCells();
  const captured = [];
  const failed = [];
  try {
    for (const cell of cells) {
      const cellId = `${cell.route.id}-${cell.viewport.id}-${cell.theme.id}`;
      try {
        const file = await captureCell(browser, cell.route, cell.viewport, cell.theme);
        captured.push(file);
        process.stdout.write(`OK  ${file}\n`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failed.push({ cell: cellId, message });
        process.stdout.write(`FAIL ${cellId}: ${message}\n`);
      }
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(
    `\nCaptured ${captured.length}/${cells.length} cells in ${OUT_DIR}\n`,
  );
  if (failed.length > 0) {
    process.stdout.write(`Failed ${failed.length} cells:\n`);
    for (const f of failed) {
      process.stdout.write(`  - ${f.cell}: ${f.message}\n`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
