// Slice-2 screenshot matrix capture.
//
// Drives Playwright at the dev-only `/internal/preview/member/*` routes
// to capture 30 cells (5 routes × 3 viewports × 2 themes). The
// screenshots land in docs/screenshots/slice-2/ named
// `route-viewport-theme.png`.
//
// Usage (dev server already running on :3020):
//   node scripts/capture-slice-2-screenshots.mjs
//
// Theme is forced via the `colorScheme` browser context option, which
// drives `prefers-color-scheme` and triggers next-themes' system mode.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const OUT_DIR = join(ROOT, 'docs', 'screenshots', 'slice-2');
const BASE_URL = process.env.PREVIEW_BASE_URL ?? 'http://localhost:3020';

const ROUTES = [
  { id: 'home', path: '/internal/preview/member/home' },
  { id: 'pool', path: '/internal/preview/member/pool' },
  { id: 'pay', path: '/internal/preview/member/pay' },
  { id: 'inbox', path: '/internal/preview/member/inbox' },
  { id: 'profile', path: '/internal/preview/member/profile' },
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
  // Wait a beat for hydration + theme application — preview routes have
  // no images / no async data, so 250ms is more than enough.
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
  try {
    for (const route of ROUTES) {
      for (const viewport of VIEWPORTS) {
        for (const theme of THEMES) {
          const file = await captureCell(browser, route, viewport, theme);
          captured.push(file);
          process.stdout.write(`✓ ${file}\n`);
        }
      }
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(`\nCaptured ${captured.length} cells in ${OUT_DIR}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
