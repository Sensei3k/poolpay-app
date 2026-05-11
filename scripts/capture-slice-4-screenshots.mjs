// Slice-4 screenshot matrix capture.
//
// Drives Playwright at the dev-only `/internal/preview/sys/*` routes
// to capture 34 cells. Super-admin is desktop-only, so the matrix
// is narrower than slices 2/3:
//
//   - 6 desktop routes × 2 desktop viewports (1280, 1440) × 2 themes = 24
//   - mobile-banner × 1 mobile viewport (390)        × 2 themes = 2
//   - 4 tablet-collapsing routes × 1 tablet viewport (1024) × 2 themes = 8
//
// Output: docs/screenshots/slice-4/, named `route-viewport-theme.png`.
//
// Usage (dev server already running on :3040):
//   BASE_URL=http://localhost:3040 node scripts/capture-slice-4-screenshots.mjs
//
// Theme is forced via the `colorScheme` browser context option (drives
// `prefers-color-scheme`) and a `localStorage.theme` seed so `next-themes`
// hydrates with the chosen mode regardless of system preference.
//
// `admins-modal` is captured by navigating to `/internal/preview/sys/admins`
// and clicking the "Add admin" trigger; the modal opens to the form step.
// The temp-credentials revealed state requires a real backend round-trip
// (the modal generates the password client-side, posts to a server action
// that talks to poolpay-api, and only on success does it transition to
// `revealed`), so dev captures show the form-open state instead. Visual
// fidelity of the revealed panel is reviewable via `components/super/
// modal-add-admin.tsx`.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const OUT_DIR = join(ROOT, 'docs', 'screenshots', 'slice-4');
const BASE_URL = process.env.BASE_URL ?? process.env.PREVIEW_BASE_URL ?? 'http://localhost:3040';

const DESKTOP_VIEWPORTS = [
  { id: 'desktop-1280', width: 1280, height: 900 },
  { id: 'desktop-1440', width: 1440, height: 900 },
];

const TABLET_VIEWPORT = { id: 'tablet-1024', width: 1024, height: 1366 };
const MOBILE_VIEWPORT = { id: 'mobile', width: 390, height: 844 };

const THEMES = [
  { id: 'light', colorScheme: 'light' },
  { id: 'dark', colorScheme: 'dark' },
];

// Six desktop routes captured at 1280 + 1440 in both themes (24 cells).
// `admins-modal` reuses the admins preview route and opens the modal
// post-load via a click on the "Add admin" trigger.
const DESKTOP_ROUTES = [
  { id: 'receipts', path: '/internal/preview/sys/receipts' },
  { id: 'groups', path: '/internal/preview/sys/groups' },
  { id: 'group-detail', path: '/internal/preview/sys/group-detail' },
  { id: 'admins', path: '/internal/preview/sys/admins' },
  { id: 'admins-modal', path: '/internal/preview/sys/admins', openAddAdminModal: true },
  { id: 'whatsapp', path: '/internal/preview/sys/whatsapp' },
];

// Four routes whose card-layout band kicks in at <=1024px (8 cells).
const TABLET_ROUTES = [
  { id: 'receipts', path: '/internal/preview/sys/receipts' },
  { id: 'groups', path: '/internal/preview/sys/groups' },
  { id: 'admins', path: '/internal/preview/sys/admins' },
  { id: 'whatsapp', path: '/internal/preview/sys/whatsapp' },
];

// Mobile banner only — the rest of /sys/* redirects on mobile (2 cells).
const MOBILE_ROUTES = [
  { id: 'mobile-banner', path: '/internal/preview/sys/mobile-banner' },
];

async function captureCell(browser, route, viewport, theme) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    colorScheme: theme.colorScheme,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.addInitScript((scheme) => {
    try {
      window.localStorage.setItem('theme', scheme);
    } catch {
      /* localStorage unavailable in some restricted contexts */
    }
  }, theme.id);

  const url = `${BASE_URL}${route.path}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // If this cell is the modal-open variant, click the "Add admin"
  // trigger and wait for the dialog to mount before screenshotting.
  if (route.openAddAdminModal) {
    const trigger = page.getByRole('button', { name: /add admin/i });
    await trigger.first().click();
    await page.waitForSelector('[role="dialog"][aria-modal="true"]', { state: 'visible' });
    await page.waitForTimeout(200);
  }

  // Hide the Next.js dev-mode badge / overlay so it doesn't bleed into
  // the corner of captures. The portal is a shadow-DOM element rendered
  // by Next dev only; production builds don't have it.
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

function buildMatrix() {
  const cells = [];
  for (const route of DESKTOP_ROUTES) {
    for (const viewport of DESKTOP_VIEWPORTS) {
      for (const theme of THEMES) {
        cells.push({ route, viewport, theme });
      }
    }
  }
  for (const route of TABLET_ROUTES) {
    for (const theme of THEMES) {
      cells.push({ route, viewport: TABLET_VIEWPORT, theme });
    }
  }
  for (const route of MOBILE_ROUTES) {
    for (const theme of THEMES) {
      cells.push({ route, viewport: MOBILE_VIEWPORT, theme });
    }
  }
  return cells;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const matrix = buildMatrix();
  const browser = await chromium.launch({ headless: true });
  const captured = [];
  const failed = [];
  try {
    for (const cell of matrix) {
      const { route, viewport, theme } = cell;
      const label = `${route.id}-${viewport.id}-${theme.id}`;
      try {
        const file = await captureCell(browser, route, viewport, theme);
        captured.push(file);
        process.stdout.write(`OK  ${file}\n`);
      } catch (err) {
        failed.push({ cell: label, message: err instanceof Error ? err.message : String(err) });
        process.stdout.write(`FAIL ${label}: ${err instanceof Error ? err.message : err}\n`);
      }
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(
    `\nCaptured ${captured.length}/${matrix.length} cells in ${OUT_DIR}\n`,
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
