// Slice-5-FE screenshot matrix capture.
//
// Drives Playwright at the dev-only `/internal/preview/admin/*` and
// `/internal/preview/member/*` routes to capture the slice-5 visual
// surfaces. Slice 5 FE doesn't add new top-level routes; it wires up
// the receipt confirm / reject / flag actions and the inbox
// `receipt_confirmed` renderer, so the matrix targets the four new
// modal-state preview routes plus the existing inbox preview.
//
// Matrix:
//   - 4 modal-state previews × 2 desktop viewports (1280, 1440) × 2 themes = 16 cells
//   - 4 modal-state previews × 1 mobile viewport (390) × 2 themes        = 8 cells
//   - 1 inbox preview × 3 viewports (390, 820, 1440) × 2 themes          = 6 cells
//   Total: 30 cells.
//
// Output: docs/screenshots/slice-5-fe/<route-slug>-<viewport>-<theme>.png
//
// Usage (dev server already running on :3050):
//   BASE_URL=http://localhost:3050 node scripts/capture-slice-5-fe-screenshots.mjs
//
// Theme is forced via the `colorScheme` browser context option (drives
// `prefers-color-scheme`) and a `localStorage.theme` seed so `next-themes`
// hydrates with the chosen mode regardless of system preference.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const OUT_DIR = join(ROOT, 'docs', 'screenshots', 'slice-5-fe');
const BASE_URL =
  process.env.BASE_URL ?? process.env.PREVIEW_BASE_URL ?? 'http://localhost:3050';

const MODAL_ROUTES = [
  { id: 'receipts-modal-default', path: '/internal/preview/admin/receipts-modal-default' },
  { id: 'receipts-modal-rejecting', path: '/internal/preview/admin/receipts-modal-rejecting' },
  { id: 'receipts-modal-flagging', path: '/internal/preview/admin/receipts-modal-flagging' },
  { id: 'receipts-modal-confirming', path: '/internal/preview/admin/receipts-modal-confirming' },
];

const INBOX_ROUTE = {
  id: 'inbox',
  path: '/internal/preview/member/inbox',
};

const VIEWPORTS = {
  mobile: { id: 'mobile', width: 390, height: 844 },
  tablet: { id: 'tablet-820', width: 820, height: 1180 },
  desktop1280: { id: 'desktop-1280', width: 1280, height: 800 },
  desktop1440: { id: 'desktop-1440', width: 1440, height: 900 },
};

const THEMES = [
  { id: 'light', colorScheme: 'light' },
  { id: 'dark', colorScheme: 'dark' },
];

/**
 * Cells the matrix should capture. Built as a flat list so progress
 * printing and failure tracking stay linear.
 */
function buildCells() {
  const cells = [];
  for (const route of MODAL_ROUTES) {
    for (const viewport of [VIEWPORTS.desktop1280, VIEWPORTS.desktop1440, VIEWPORTS.mobile]) {
      for (const theme of THEMES) {
        cells.push({ route, viewport, theme });
      }
    }
  }
  for (const viewport of [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop1440]) {
    for (const theme of THEMES) {
      cells.push({ route: INBOX_ROUTE, viewport, theme });
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
  await page.goto(url, { waitUntil: 'networkidle' });
  // Wait long enough for the modal preview driver's RAF chain to:
  //   1. seed the store (one tick)
  //   2. mount the modal (commit)
  //   3. click the reason-prompt button (second RAF)
  //   4. flush the reason form (next commit)
  // 600ms is comfortably above two paints + the click handler at 60fps.
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
