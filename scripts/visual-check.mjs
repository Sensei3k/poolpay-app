/**
 * Visual check + accessibility audit script.
 * Usage: node scripts/visual-check.mjs [screenshot-name]
 */
import { chromium } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';

const name = process.argv[2] ?? 'screenshot';
const url = process.argv[3] ?? 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1280, height: 800 });
await page.goto(url, { waitUntil: 'networkidle' });

// Screenshot
const screenshotPath = `scripts/screenshots/${name}.png`;
await page.screenshot({ path: screenshotPath, fullPage: true });
console.log(`Screenshot saved: ${screenshotPath}`);

// Accessibility audit (axe-core, WCAG 2.1 AA)
await injectAxe(page);
try {
  await checkA11y(page, null, {
    axeOptions: {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    },
    reportOptions: {
      reporter: 'v2',
    },
  });
  console.log('Accessibility audit passed: no WCAG 2.1 AA violations.');
} catch (err) {
  console.error('Accessibility violations found:\n', err.message);
  process.exitCode = 1;
}

// Playwright a11y snapshot (structural)
const snapshot = await page.locator('body').ariaSnapshot();
console.log('\nAccessibility tree snapshot:');
console.log(snapshot);

await browser.close();
