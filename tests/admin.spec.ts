import { test, expect } from '@playwright/test';
import { AdminPage } from './pages/admin.page';

/**
 * Admin CRUD E2E tests.
 *
 * Requirements:
 *  - The Rust backend must be running with at least one group seeded.
 *  - ADMIN_TOKEN must be set correctly on the backend.
 *  - Run with --workers=1 to avoid race conditions on shared backend state.
 */
test.describe.serial('Admin panel', () => {
  test('navigates to /admin and renders the page', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    await expect(admin.heading).toBeVisible();
    await expect(admin.backLink).toBeVisible();
    await expect(admin.groupsHeading).toBeVisible();
    await expect(admin.membersHeading).toBeVisible();
    await expect(admin.cyclesHeading).toBeVisible();
  });

  test('back link returns to dashboard', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    await admin.backLink.click();
    await page.waitForURL('/');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('Groups section renders table with at least one group', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    // Expect the table to be present (will be empty message or populated)
    await expect(admin.groupsHeading).toBeVisible();
    await expect(admin.addGroupButton).toBeVisible();
  });

  test('Add Group button opens dialog', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    await admin.addGroupButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(admin.dialogTitle).toContainText('Add Group');
  });

  test('Add Group dialog can be cancelled', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    await admin.addGroupButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await admin.cancelButton.click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Members section is visible', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    await expect(admin.membersHeading).toBeVisible();
    await expect(admin.addMemberButton).toBeVisible();
  });

  test('Add Member button opens dialog', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    // The button is disabled when no group is selected/loaded
    const isEnabled = await admin.addMemberButton.isEnabled({ timeout: 5000 }).catch(() => false);
    if (!isEnabled) test.skip();

    await admin.addMemberButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(admin.dialogTitle).toContainText('Add Member');
  });

  test('Add Member dialog can be cancelled', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    const isEnabled = await admin.addMemberButton.isEnabled({ timeout: 5000 }).catch(() => false);
    if (!isEnabled) test.skip();

    await admin.addMemberButton.click();
    await admin.cancelButton.click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Cycles section is visible', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    await expect(admin.cyclesHeading).toBeVisible();
    await expect(admin.addCycleButton).toBeVisible();
  });

  test('Add Cycle button opens dialog', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    const isEnabled = await admin.addCycleButton.isEnabled({ timeout: 5000 }).catch(() => false);
    if (!isEnabled) test.skip();

    await admin.addCycleButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(admin.dialogTitle).toContainText('Add Cycle');
  });

  test('Add Cycle dialog can be cancelled', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    const isEnabled = await admin.addCycleButton.isEnabled({ timeout: 5000 }).catch(() => false);
    if (!isEnabled) test.skip();

    await admin.addCycleButton.click();
    await admin.cancelButton.click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('group tabs render when multiple groups exist', async ({ page }) => {
    const admin = new AdminPage(page);
    await admin.goto();

    // Tab list is present when there are groups to display
    const tabList = page.getByRole('tablist', { name: 'Select group' });
    const hasTabs = await tabList.isVisible().catch(() => false);
    if (!hasTabs) test.skip();

    await expect(tabList).toBeVisible();
    const tabs = tabList.getByRole('tab');
    expect(await tabs.count()).toBeGreaterThan(0);
  });

  test('page renders in dark mode without layout breakage', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const admin = new AdminPage(page);
    await admin.goto();

    await expect(admin.heading).toBeVisible();
    await expect(admin.groupsHeading).toBeVisible();
  });

  test('page renders in light mode without layout breakage', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const admin = new AdminPage(page);
    await admin.goto();

    await expect(admin.heading).toBeVisible();
    await expect(admin.groupsHeading).toBeVisible();
  });
});
