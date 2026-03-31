import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Circle Dashboard', () => {
  test('loads without errors', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();

    // The main landmark and heading must be present
    await expect(page.getByRole('main')).toBeVisible();
    await expect(dashboard.memberPaymentsHeading).toBeVisible();

    // No unhandled JS errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    expect(errors).toHaveLength(0);
  });

  test.describe('Member Payments card — table / chart toggle', () => {
    test('toggle group is visible in default table view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await expect(dashboard.viewToggleGroup).toBeVisible();
      await expect(dashboard.tableViewButton).toBeVisible();
      await expect(dashboard.chartViewButton).toBeVisible();
    });

    test('subtitle shows "Cycle 3" in table view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      const subtitle = await dashboard.getSubtitleText();
      expect(subtitle).toBe('Cycle 3');
    });

    test('switching to chart view shows "All cycles" subtitle', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await dashboard.switchToChartView();

      const subtitle = await dashboard.getSubtitleText();
      expect(subtitle).toBe('All cycles');
    });

    test('switching back to table view restores "Cycle 3" subtitle', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();

      await dashboard.switchToChartView();
      await dashboard.switchToTableView();

      const subtitle = await dashboard.getSubtitleText();
      expect(subtitle).toBe('Cycle 3');
    });
  });

  test.describe('Chart view — Per Cycle / Cumulative toggle', () => {
    test.beforeEach(async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
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

  test.describe('Chart tooltips', () => {
    test('tooltip appears with ₦ values on hover in Per Cycle view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
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
