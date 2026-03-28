/**
 * Tests for the branded 404 not-found page.
 *
 * Covers:
 *   1. Rendering — correct content on any unknown route
 *   2. Navigation — "Go Home" returns to /, "Go Back" is present
 *   3. Visual — light and dark mode screenshots
 */

import path from 'path';
import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

test.describe('404 Not-Found page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('networkidle');
  });

  // -------------------------------------------------------------------------
  // 1. Rendering
  // -------------------------------------------------------------------------

  test('renders the 404 page on an unknown route', async ({ page }) => {
    // Both spans together form "404"
    await expect(page.getByText('40')).toBeVisible();
    await expect(page.getByText('4').last()).toBeVisible();
  });

  test('shows the description text', async ({ page }) => {
    await expect(page.getByText("The page you're looking for doesn't exist.")).toBeVisible();
    await expect(page.getByText('It may have been moved or deleted.')).toBeVisible();
  });

  test('renders "Go Home" link', async ({ page }) => {
    const goHome = page.getByRole('link', { name: /go home/i });
    await expect(goHome).toBeVisible();
  });

  test('renders "Go Back" button', async ({ page }) => {
    const goBack = page.getByRole('button', { name: /go back/i });
    await expect(goBack).toBeVisible();
  });

  test('Ghost icon widget is present', async ({ page }) => {
    // EmptyMedia renders a div[data-slot="empty-media"]
    const media = page.locator('[data-slot="empty-media"]');
    await expect(media).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 2. Navigation
  // -------------------------------------------------------------------------

  test('"Go Home" navigates to the root dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /go home/i }).click();
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('main')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 3. Visual
  // -------------------------------------------------------------------------

  test('screenshot — 404 page light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'light-not-found.png'),
      fullPage: true,
    });
  });

  test('screenshot — 404 page dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('networkidle');

    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dark-not-found.png'),
      fullPage: true,
    });
  });
});
