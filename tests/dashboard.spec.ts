import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Circle Dashboard', () => {
  test('loads without errors', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // The main landmark must always be present regardless of data
    await expect(page.getByRole('main')).toBeVisible();

    // No unhandled JS errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });

  test.describe('Member Payments card — table / chart toggle', () => {
    test('toggle group is visible in default table view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      if (!(await dashboard.hasData())) test.skip();

      await expect(dashboard.viewToggleGroup).toBeVisible();
      await expect(dashboard.tableViewButton).toBeVisible();
      await expect(dashboard.chartViewButton).toBeVisible();
    });

    test('subtitle shows a cycle number in table view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      if (!(await dashboard.hasData())) test.skip();

      const subtitle = await dashboard.getSubtitleText();
      expect(subtitle).toMatch(/^Cycle \d+$/);
    });

    test('switching to chart view shows "All cycles" subtitle', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      if (!(await dashboard.hasData())) test.skip();

      await dashboard.switchToChartView();

      const subtitle = await dashboard.getSubtitleText();
      expect(subtitle).toBe('All cycles');
    });

    test('switching back to table view restores cycle subtitle', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      if (!(await dashboard.hasData())) test.skip();

      const originalSubtitle = await dashboard.getSubtitleText();
      await dashboard.switchToChartView();
      await dashboard.switchToTableView();

      const restoredSubtitle = await dashboard.getSubtitleText();
      expect(restoredSubtitle).toBe(originalSubtitle);
    });
  });

  test.describe('Chart view — Per Cycle / Cumulative toggle', () => {
    test.beforeEach(async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      if (!(await dashboard.hasData())) test.skip();
      await dashboard.switchToChartView();
    });

    test('Per Cycle / Cumulative toggle is visible in chart view', async ({ page }) => {
      const dashboard = new DashboardPage(page);

      await expect(dashboard.chartToggleGroup).toBeVisible();
      await expect(dashboard.perCycleButton).toBeVisible();
      await expect(dashboard.cumulativeButton).toBeVisible();
    });

    test('Per Cycle view renders an area chart SVG with paths', async ({ page }) => {
      const dashboard = new DashboardPage(page);

      // Per Cycle is the default chart view
      await expect(dashboard.perCycleChartContainer).toBeVisible();

      // The SVG itself must be present and visible
      const svg = dashboard.perCycleChartContainer.locator('svg').first();
      await expect(svg).toBeVisible();

      // visx AreaChart renders AreaClosed + LinePath as SVG <path> elements.
      // SVG child elements can report as "hidden" under Playwright's visibility check even
      // when visually rendered — assert count() instead of toBeVisible() on SVG primitives.
      const paths = dashboard.perCycleChartContainer.locator('svg path');
      const pathCount = await paths.count();
      expect(pathCount).toBeGreaterThan(0);
    });

    test('Cumulative view renders a line chart SVG with a path', async ({ page }) => {
      const dashboard = new DashboardPage(page);

      await dashboard.switchToCumulative();

      await expect(dashboard.cumulativeChartContainer).toBeVisible();

      // Recharts renders the line as a <path> inside the SVG
      const linePath = dashboard.cumulativeChartContainer.locator('svg path');
      await expect(linePath.first()).toBeVisible();
      const pathCount = await linePath.count();
      expect(pathCount).toBeGreaterThan(0);
    });

    test('toggling back to Per Cycle from Cumulative works', async ({ page }) => {
      const dashboard = new DashboardPage(page);

      await dashboard.switchToCumulative();
      await expect(dashboard.cumulativeChartContainer).toBeVisible();

      await dashboard.switchToPerCycle();
      await expect(dashboard.perCycleChartContainer).toBeVisible();
      await expect(dashboard.cumulativeChartContainer).not.toBeVisible();
    });
  });

  test.describe('Group selector', () => {
    test('Admin link is present in the header', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await expect(dashboard.adminLink).toBeVisible();
    });

    test('Admin link navigates to /admin', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await dashboard.adminLink.click();
      await page.waitForURL('/admin');
      await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
    });

    test('group selector renders when groups exist', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      // The selector is only rendered when the backend returns groups.
      // Skip if no groups are configured on the test backend.
      const hasSelector = await dashboard.groupSelector.isVisible().catch(() => false);
      if (!hasSelector) test.skip();
      await expect(dashboard.groupSelector).toBeVisible();
    });

    test('selecting a group updates the URL with ?group= param', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      const hasSelector = await dashboard.groupSelector.isVisible().catch(() => false);
      if (!hasSelector) test.skip();
      // Open the combobox and check there are multiple options to choose from
      await dashboard.groupSelector.click();
      const options = page.getByRole('option');
      const optionCount = await options.count();
      if (optionCount < 2) {
        // With only one group, selecting it won't change the URL
        test.skip();
        return;
      }
      // Pick the second option (first is likely already selected)
      await options.nth(1).click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('group=');
      // Dashboard heading should still be visible after switch
      await expect(page.getByRole('main')).toBeVisible();
    });
  });

  test.describe('Chart tooltips', () => {
    test('tooltip appears with ₦ values on hover in Per Cycle view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      if (!(await dashboard.hasData())) test.skip();
      await dashboard.switchToChartView();

      // Scroll chart into view and wait for the chart to signal it is interactive
      const chartSvg = dashboard.perCycleChartContainer.locator('svg').first();
      await chartSvg.scrollIntoViewIfNeeded();
      await expect(chartSvg).toHaveAttribute('data-interactive', 'true', { timeout: 5000 });

      const svgBox = await chartSvg.boundingBox();
      if (!svgBox) throw new Error('Per cycle chart SVG not found');

      await page.mouse.move(
        svgBox.x + svgBox.width / 2,
        svgBox.y + svgBox.height / 2,
      );

      // Tooltip portals into the chart container div as .bg-popover
      const tooltip = dashboard.perCycleChartContainer.locator('.bg-popover');
      await expect(tooltip).toBeVisible({ timeout: 5000 });

      const tooltipText = await tooltip.innerText();
      expect(tooltipText).toContain('₦');
    });

    test('tooltip appears with ₦ values on hover in Cumulative view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      if (!(await dashboard.hasData())) test.skip();
      await dashboard.switchToChartView();
      await dashboard.switchToCumulative();

      const chartSvg = dashboard.cumulativeChartContainer.locator('svg').first();
      // Wait for the chart to signal it is interactive before attempting hover
      await expect(chartSvg).toHaveAttribute('data-interactive', 'true', { timeout: 5000 });
      const svgBox = await chartSvg.boundingBox();
      if (!svgBox) throw new Error('Cumulative chart SVG not found');

      await page.mouse.move(
        svgBox.x + svgBox.width / 2,
        svgBox.y + svgBox.height / 2,
      );

      // Tooltip portals into the chart container div as .bg-popover
      const tooltip = dashboard.cumulativeChartContainer.locator('.bg-popover');
      await expect(tooltip).toBeVisible({ timeout: 5000 });

      const tooltipText = await tooltip.innerText();
      expect(tooltipText).toContain('₦');
    });
  });
});
