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

    test('Per Cycle view renders a bar chart SVG with bars', async ({ page }) => {
      const dashboard = new DashboardPage(page);

      // Per Cycle is the default chart view
      await expect(dashboard.perCycleChartContainer).toBeVisible();

      // The SVG itself must be present and visible
      const svg = dashboard.perCycleChartContainer.locator('svg').first();
      await expect(svg).toBeVisible();

      // Recharts renders stacked bars as <rect> elements inside .recharts-bar-rectangles.
      // SVG child elements can report as "hidden" under Playwright's visibility check even
      // when visually rendered — assert count() instead of toBeVisible() on SVG primitives.
      const barRects = dashboard.perCycleChartContainer.locator('svg .recharts-bar-rectangle');
      const barCount = await barRects.count();
      expect(barCount).toBeGreaterThan(0);
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
    test('tooltip appears with ₦ values on bar hover in Per Cycle view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await dashboard.switchToChartView();

      // Hover the first bar in the per-cycle chart
      const firstBar = dashboard.perCycleChartContainer.locator('svg .recharts-bar-rectangle').first();
      await firstBar.hover();

      // The tooltip renders outside the role="img" container — search globally
      const tooltip = page.locator('.recharts-tooltip-wrapper');
      await expect(tooltip).toBeVisible();

      const tooltipText = await tooltip.innerText();
      expect(tooltipText).toContain('₦');
    });

    test('tooltip appears with ₦ values on line hover in Cumulative view', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.goto();
      await dashboard.switchToChartView();
      await dashboard.switchToCumulative();

      // Hover over the SVG area to trigger the line chart tooltip
      const chartSvg = dashboard.cumulativeChartContainer.locator('svg').first();
      const svgBox = await chartSvg.boundingBox();
      if (!svgBox) throw new Error('Cumulative chart SVG not found');

      // Move to the horizontal midpoint where a data point should be
      await page.mouse.move(
        svgBox.x + svgBox.width / 2,
        svgBox.y + svgBox.height / 2
      );

      const tooltip = page.locator('.recharts-tooltip-wrapper');
      await expect(tooltip).toBeVisible();

      const tooltipText = await tooltip.innerText();
      expect(tooltipText).toContain('₦');
    });
  });
});
