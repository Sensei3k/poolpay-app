// Slice-3 screenshot matrix capture.
//
// Drives Playwright at the dev-only `/internal/preview/admin/*` routes
// to capture 60 cells (8 routes × 3 viewports × 2 themes). The
// screenshots land in docs/screenshots/slice-3/ named
// `route-viewport-theme.png`.
//
// Usage (dev server already running on :3030):
//   BASE_URL=http://localhost:3030 node scripts/capture-slice-3-screenshots.mjs
//
// Theme is forced via the `colorScheme` browser context option (drives
// `prefers-color-scheme`) and a `localStorage.theme` seed so `next-themes`
// hydrates with the chosen mode regardless of system preference.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const OUT_DIR = join(ROOT, 'docs', 'screenshots', 'slice-3');
const BASE_URL = process.env.BASE_URL ?? process.env.PREVIEW_BASE_URL ?? 'http://localhost:3030';

const ROUTES = [
  { id: 'receipts', path: '/internal/preview/admin/receipts' },
  { id: 'group-overview', path: '/internal/preview/admin/group-overview' },
  { id: 'group-members', path: '/internal/preview/admin/group-members' },
  { id: 'group-cycles', path: '/internal/preview/admin/group-cycles' },
  { id: 'group-payments', path: '/internal/preview/admin/group-payments' },
  { id: 'group-receipts', path: '/internal/preview/admin/group-receipts' },
  { id: 'group-settings', path: '/internal/preview/admin/group-settings' },
  { id: 'group-mobile-prompt', path: '/internal/preview/admin/group-mobile-prompt' },
];

const VIEWPORTS = [
  { id: 'mobile', width: 390, height: 844 },
  { id: 'tablet', width: 820, height: 1180 },
  { id: 'desktop', width: 1440, height: 900 },
];

const THEMES = [
  { id: 'light', colorScheme: 'light' },
  { id: 'dark', colorScheme: 'dark' },
];

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
  await page.goto(url, { waitUntil: 'networkidle' });
  // Wait a beat for hydration + theme application; preview routes have
  // no images / no async data, so 300ms is more than enough.
  await page.waitForTimeout(300);
  // Hide the Next.js dev-mode badge / overlay so it doesn't bleed into
  // the bottom-left corner of mobile / dark captures. The portal is a
  // shadow-DOM element rendered by Next dev only; in production builds
  // it isn't there at all.
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
  const captured = [];
  const failed = [];
  try {
    for (const route of ROUTES) {
      for (const viewport of VIEWPORTS) {
        for (const theme of THEMES) {
          try {
            const file = await captureCell(browser, route, viewport, theme);
            captured.push(file);
            process.stdout.write(`OK ${file}\n`);
          } catch (err) {
            const cell = `${route.id}-${viewport.id}-${theme.id}`;
            failed.push({ cell, message: err instanceof Error ? err.message : String(err) });
            process.stdout.write(`FAIL ${cell}: ${err instanceof Error ? err.message : err}\n`);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(`\nCaptured ${captured.length}/${ROUTES.length * VIEWPORTS.length * THEMES.length} cells in ${OUT_DIR}\n`);
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
