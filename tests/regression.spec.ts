/**
 * Regression tests for Circle Dashboard business logic.
 *
 * These tests lock in the correct behaviour after each bug fix so that
 * future features cannot silently regress core rules:
 *
 *   1. Recipient exclusion — the member collecting this cycle is excluded
 *      from the payment table and all contribution-based calculations.
 *   2. Sequential row numbers — table rows are numbered 01…05 regardless of
 *      the member's position in the rotation order.
 *   3. KPI accuracy — Total Pot, Collected, and Outstanding all reflect the
 *      5 contributing members, not the full 6-member group.
 *   4. Progress bar accuracy — the fill width and aria-valuenow match the
 *      ratio of paid contributing members.
 *   5. Outstanding alert — lists only the specific members who have not paid,
 *      excluding the recipient.
 *
 * Mock data state (after reset):
 *   Cycle 3 (active): Ngozi Adeyemi is the recipient.
 *   Contributing members (5): Adaeze, Chukwuemeka, Tunde, Amaka, Seun
 *   Paid (3): Adaeze (01 Mar), Chukwuemeka (03 Mar), Amaka (07 Mar)
 *   Outstanding (2): Tunde Bakare, Seun Okafor
 *   Contribution per member: ₦10,000 (1,000,000 kobo)
 *   Total Pot: ₦50,000 (5 × ₦10,000)
 *   Collected: ₦30,000 (3 × ₦10,000)
 *   Outstanding: ₦20,000 (2 × ₦10,000)
 */

import { test, expect } from '@playwright/test';

// Serial mode prevents parallel workers from racing on the shared mutable
// in-memory payment store — each test must fully complete its reset before
// the next one starts.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  const resetResponse = await page.request.post('/api/test/reset');
  expect(resetResponse.ok()).toBeTruthy();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

// ---------------------------------------------------------------------------
// 1. Recipient exclusion
// ---------------------------------------------------------------------------

test.describe('Recipient exclusion', () => {
  test('Ngozi Adeyemi does not appear in the payment table', async ({ page }) => {
    const table = page.locator('div[aria-label*="Cycle 3"]');
    await expect(table).toBeVisible();
    await expect(table.getByText('Ngozi Adeyemi')).not.toBeVisible();
  });

  test('payment table shows exactly 5 card rows (5 contributing members)', async ({ page }) => {
    const table = page.locator('div[aria-label*="Cycle 3"]');
    const rows = table.locator('[role="button"]');
    await expect(rows).toHaveCount(5);
  });

  test('Ngozi does not appear in the outstanding alert', async ({ page }) => {
    const alert = page.locator('[role="alert"][aria-label*="outstanding"]');
    await expect(alert).toBeVisible();
    await expect(alert.getByText('Ngozi Adeyemi')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Sequential row numbers
// ---------------------------------------------------------------------------

test.describe('Sequential row numbers', () => {
  test('first cell of each row is numbered 01 through 05 in order', async ({ page }) => {
    const table = page.locator('div[aria-label*="Cycle 3"]');
    const rows = table.locator('[role="button"]');

    for (let i = 1; i <= 5; i++) {
      const numberCell = rows.nth(i - 1).locator('span.tabular-nums').first();
      await expect(numberCell).toHaveText(`0${i}`);
    }
  });

  test('row numbers do not skip (no gap at position 3 where recipient was)', async ({ page }) => {
    const table = page.locator('div[aria-label*="Cycle 3"]');
    const rows = table.locator('[role="button"]');
    const numberCells = rows.locator('span.tabular-nums').first();
    // Collect all row number texts
    const texts: string[] = [];
    for (let i = 0; i < 5; i++) {
      texts.push(await rows.nth(i).locator('span.tabular-nums').first().innerText());
    }
    expect(texts).toEqual(['01', '02', '03', '04', '05']);
  });
});

// ---------------------------------------------------------------------------
// 3. KPI accuracy
// ---------------------------------------------------------------------------

test.describe('KPI card accuracy', () => {
  test('Total Pot shows ₦50,000 (5 contributing members × ₦10,000)', async ({ page }) => {
    const region = page.getByRole('region', { name: 'Cycle summary statistics' });
    const totalPotCard = region.locator('[data-slot="card"]').filter({ hasText: 'Total Pot' });
    await expect(totalPotCard.getByText('₦50,000')).toBeVisible();
    await expect(totalPotCard.getByText('5 members')).toBeVisible();
  });

  test('Collected shows ₦30,000 (3 of 5 paid)', async ({ page }) => {
    const region = page.getByRole('region', { name: 'Cycle summary statistics' });
    const collectedCard = region.locator('[data-slot="card"]').filter({ hasText: 'Collected' });
    await expect(collectedCard.getByText('₦30,000')).toBeVisible();
    await expect(collectedCard.getByText('3 of 5 paid')).toBeVisible();
  });

  test('Outstanding shows ₦20,000 (2 members pending)', async ({ page }) => {
    const region = page.getByRole('region', { name: 'Cycle summary statistics' });
    const outstandingCard = region.locator('[data-slot="card"]').filter({ hasText: 'Outstanding' });
    await expect(outstandingCard.getByText('₦20,000')).toBeVisible();
    await expect(outstandingCard.getByText('2 members pending')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Progress bar accuracy
// ---------------------------------------------------------------------------

test.describe('Progress bar accuracy', () => {
  test('aria-valuenow is 60 (3 of 5 contributing members paid)', async ({ page }) => {
    const bar = page.locator('[role="progressbar"]').first();
    const ariaValue = await bar.getAttribute('aria-valuenow');
    expect(Number(ariaValue)).toBe(60);
  });

  test('progress bar fill width is 60%', async ({ page }) => {
    const bar = page.locator('[role="progressbar"]').first();
    const fill = bar.locator(':scope > div').first();
    const width = await fill.evaluate((el) => (el as HTMLElement).style.width);
    expect(width).toBe('60%');
  });

  test('progress bar summary text shows "3 of 5 members paid"', async ({ page }) => {
    const progressSection = page.locator('section[aria-label="Collection progress"]');
    await expect(progressSection.getByText('3 of 5 members paid')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Outstanding alert
// ---------------------------------------------------------------------------

test.describe('Outstanding alert', () => {
  test('alert shows 2 outstanding payments', async ({ page }) => {
    const alert = page.locator('[role="alert"][aria-label*="outstanding"]');
    await expect(alert).toBeVisible();
    await expect(alert.getByText('2 outstanding payments')).toBeVisible();
  });

  test('Tunde Bakare appears in the outstanding alert', async ({ page }) => {
    const alert = page.locator('[role="alert"][aria-label*="outstanding"]');
    await expect(alert.getByText('Tunde Bakare')).toBeVisible();
  });

  test('Seun Okafor appears in the outstanding alert', async ({ page }) => {
    const alert = page.locator('[role="alert"][aria-label*="outstanding"]');
    await expect(alert.getByText('Seun Okafor')).toBeVisible();
  });

  test('each outstanding entry shows ₦10,000 owed', async ({ page }) => {
    const alert = page.locator('[role="alert"][aria-label*="outstanding"]');
    const owedItems = alert.getByText('₦10,000 owed');
    await expect(owedItems).toHaveCount(2);
  });
});

// ---------------------------------------------------------------------------
// 6. Active cycle card
// ---------------------------------------------------------------------------

test.describe('Active cycle card', () => {
  test('shows Cycle 3 heading', async ({ page }) => {
    const cardHeading = page.getByRole('heading', { name: /Cycle 3/i }).first();
    await expect(cardHeading).toBeVisible();
  });

  test('shows Ngozi Adeyemi as the recipient', async ({ page }) => {
    const recipientSection = page.locator('section[aria-label="Recipient information"]');
    await expect(recipientSection.getByText('Ngozi Adeyemi')).toBeVisible();
  });

  test('shows recipient position #3', async ({ page }) => {
    const recipientSection = page.locator('section[aria-label="Recipient information"]');
    await expect(recipientSection.getByText('Position #3')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 7. Card row overlay — inline member detail
// ---------------------------------------------------------------------------

test.describe('Card row overlay', () => {
  test('clicking a row opens the inline overlay with the member name', async ({ page }) => {
    const table = page.locator('div[aria-label*="Cycle 3"]');
    const tundeRow = table.locator('[role="button"]').filter({ hasText: 'Tunde Bakare' });
    await tundeRow.click();

    // Overlay should appear inside the Member Payments card
    const overlay = page.locator('[aria-label="Close member detail"]');
    await expect(overlay).toBeVisible();
    await expect(page.getByText('Tunde Bakare').first()).toBeVisible();
  });

  test('overlay close button dismisses the overlay', async ({ page }) => {
    const table = page.locator('div[aria-label*="Cycle 3"]');
    await table.locator('[role="button"]').first().click();

    const closeBtn = page.getByRole('button', { name: 'Close member detail' });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(closeBtn).not.toBeVisible();
  });

  test('overlay shows Outstanding status for Tunde Bakare', async ({ page }) => {
    const table = page.locator('div[aria-label*="Cycle 3"]');
    await table.locator('[role="button"]').filter({ hasText: 'Tunde Bakare' }).click();

    const overlay = page.locator('button[aria-label="Close member detail"]').locator('..');
    await expect(page.getByText('Outstanding').last()).toBeVisible();
  });

  test('overlay shows Paid status for Adaeze', async ({ page }) => {
    const table = page.locator('div[aria-label*="Cycle 3"]');
    await table.locator('[role="button"]').filter({ hasText: 'Adaeze' }).click();

    await expect(page.getByText('Paid').last()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 8. Payment toggle — state updates flow back to KPIs and progress bar
// ---------------------------------------------------------------------------

test.describe('Payment toggle integration', () => {
  test('marking Tunde as paid via overlay updates collected count to 4 of 5', async ({ page }) => {
    // Open Tunde's card overlay
    const table = page.locator('div[aria-label*="Cycle 3"]');
    await table.locator('[role="button"]').filter({ hasText: 'Tunde Bakare' }).click();

    // Mark as paid from the overlay
    const markPaidBtn = page.getByRole('button', { name: 'Mark as paid' });
    await expect(markPaidBtn).toBeVisible();
    await markPaidBtn.click();

    // Wait for server action + page revalidation
    await page.waitForLoadState('networkidle');

    // KPI should now reflect 4 of 5 paid
    const region = page.getByRole('region', { name: 'Cycle summary statistics' });
    const collectedCard = region.locator('[data-slot="card"]').filter({ hasText: 'Collected' });
    await expect(collectedCard.getByText('4 of 5 paid')).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// 9. Search
// ---------------------------------------------------------------------------

test.describe('Search', () => {
  test('filtering by name hides non-matching rows', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: 'Search members by name or phone' });
    await searchInput.fill('Tunde');

    const table = page.locator('div[aria-label*="Cycle 3"]');
    const rows = table.locator('[role="button"]');
    await expect(rows).toHaveCount(1);
    await expect(rows.first().getByText('Tunde Bakare')).toBeVisible();
  });

  test('clearing search restores all 5 rows', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: 'Search members by name or phone' });
    await searchInput.fill('Tunde');

    const table = page.locator('div[aria-label*="Cycle 3"]');
    await expect(table.locator('[role="button"]')).toHaveCount(1);

    await searchInput.fill('');
    await expect(table.locator('[role="button"]')).toHaveCount(5);
  });

  test('no-match query shows empty state message', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: 'Search members by name or phone' });
    await searchInput.fill('zzznomatch');

    const table = page.locator('div[aria-label*="Cycle 3"]');
    await expect(table.locator('[role="button"]')).toHaveCount(0);
    await expect(page.getByText(/No members match/)).toBeVisible();
  });
});
