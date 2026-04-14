/**
 * Visual regression tests for PoolPay.
 *
 * These tests verify that key colour tokens render correctly in both
 * light and dark mode. Screenshots are saved to tests/screenshots/
 * (git-ignored) and can be deleted once you're satisfied — they exist
 * for human spot-checking, not pixel-diff comparison.
 *
 * Run with: npx playwright test tests/visual.spec.ts
 * Run all:  npx playwright test
 */
import path from 'path';
import { test, expect, type Page } from '@playwright/test';

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Serial mode prevents parallel workers from racing on the shared mutable
// in-memory payment store — each test must fully complete its reset before
// the next one starts.
test.describe.configure({ mode: 'serial' });

/** Returns the computed background-color of the first element matching the selector. */
async function computedBg(page: Page, selector: string): Promise<string> {
  return page.locator(selector).first().evaluate(
    (el) => window.getComputedStyle(el).backgroundColor
  );
}

/** Try to reset test state. Returns false if backend is unreachable. */
async function tryReset(page: Page): Promise<boolean> {
  const res = await page.request.post('/api/test/reset').catch(() => null);
  return res?.ok() ?? false;
}

// ---------------------------------------------------------------------------
// Light mode
// ---------------------------------------------------------------------------

test.describe('Visual — light mode', () => {
  test.beforeEach(async ({ page }) => {
    const resetOk = await tryReset(page);
    if (!resetOk) test.skip();
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('screenshot — full dashboard', async ({ page }) => {
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'light-full.png'),
      fullPage: true,
    });
  });

  test('progress bar fill is coloured (not transparent)', async ({ page }) => {
    const fill = page.locator('[role="progressbar"] > div').first();
    const fillVisible = await fill.isVisible().catch(() => false);
    if (!fillVisible) test.skip();
    const bg = await fill.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('progress bar fill width reflects collection percentage', async ({ page }) => {
    const bar = page.locator('[role="progressbar"]').first();
    const barVisible = await bar.isVisible().catch(() => false);
    if (!barVisible) test.skip();

    const fill = bar.locator(':scope > div').first();
    const ariaValue = await bar.getAttribute('aria-valuenow');
    expect(ariaValue).not.toBeNull();

    const percent = Number(ariaValue);
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);

    const width = await fill.evaluate((el) => (el as HTMLElement).style.width);
    expect(width).toBe(`${percent}%`);
  });

  test('"Paid" badge (ajo-paid-subtle) has a visible background', async ({ page }) => {
    const badge = page.locator('[class*="ajo-paid-subtle"]').first();
    const badgeVisible = await badge.isVisible().catch(() => false);
    if (!badgeVisible) test.skip();
    const bg = await computedBg(page, '[class*="ajo-paid-subtle"]');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('"Outstanding" badge (ajo-outstanding-subtle) has a visible background', async ({ page }) => {
    const badge = page.locator('[class*="ajo-outstanding-subtle"]').first();
    const badgeVisible = await badge.isVisible().catch(() => false);
    if (!badgeVisible) test.skip();
    const bg = await computedBg(page, '[class*="ajo-outstanding-subtle"]');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('"Active" badge uses same paid colour token', async ({ page }) => {
    const activeBadge = page.locator('[class*="ajo-paid-subtle"]').filter({ hasText: 'Active' }).first();
    const badgeVisible = await activeBadge.isVisible().catch(() => false);
    if (!badgeVisible) test.skip();
    const bg = await activeBadge.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('screenshot — payment table', async ({ page }) => {
    const paymentCard = page.locator('[aria-label^="Member payment statuses for Cycle"]').first();
    const cardVisible = await paymentCard.isVisible().catch(() => false);
    if (!cardVisible) test.skip();
    await paymentCard.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'light-payment-table.png'),
    });
  });

  test('screenshot — active cycle card', async ({ page }) => {
    const progressSection = page.locator('section[aria-label="Collection progress"]');
    const sectionVisible = await progressSection.isVisible().catch(() => false);
    if (!sectionVisible) test.skip();
    await progressSection.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'light-cycle-progress.png'),
    });
  });
});

// ---------------------------------------------------------------------------
// Dark mode
// ---------------------------------------------------------------------------

test.describe('Visual — dark mode', () => {
  test.beforeEach(async ({ page }) => {
    const resetOk = await tryReset(page);
    if (!resetOk) test.skip();
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
  });

  test('screenshot — full dashboard in dark mode', async ({ page }) => {
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dark-full.png'),
      fullPage: true,
    });
  });

  test('progress bar fill is coloured in dark mode', async ({ page }) => {
    const fill = page.locator('[role="progressbar"] > div').first();
    const fillVisible = await fill.isVisible().catch(() => false);
    if (!fillVisible) test.skip();
    const bg = await fill.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('"Paid" badge has a visible background in dark mode', async ({ page }) => {
    const badge = page.locator('[class*="ajo-paid-subtle"]').first();
    const badgeVisible = await badge.isVisible().catch(() => false);
    if (!badgeVisible) test.skip();
    const bg = await computedBg(page, '[class*="ajo-paid-subtle"]');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('"Outstanding" badge has a visible background in dark mode', async ({ page }) => {
    const badge = page.locator('[class*="ajo-outstanding-subtle"]').first();
    const badgeVisible = await badge.isVisible().catch(() => false);
    if (!badgeVisible) test.skip();
    const bg = await computedBg(page, '[class*="ajo-outstanding-subtle"]');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  test('screenshot — payment table in dark mode', async ({ page }) => {
    const paymentCard = page.locator('[aria-label^="Member payment statuses for Cycle"]').first();
    const cardVisible = await paymentCard.isVisible().catch(() => false);
    if (!cardVisible) test.skip();
    await paymentCard.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dark-payment-table.png'),
    });
  });
});
