import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Circle Dashboard.
 * Encapsulates all locators and interactions for the dashboard page.
 */
export class DashboardPage {
  readonly page: Page;

  // Member Payments card
  readonly memberPaymentsHeading: Locator;
  readonly memberPaymentsSubtitle: Locator;

  // Table / chart toggle group
  readonly viewToggleGroup: Locator;
  readonly tableViewButton: Locator;
  readonly chartViewButton: Locator;

  // Per-cycle / cumulative toggle group (only visible in chart view)
  readonly chartToggleGroup: Locator;
  readonly perCycleButton: Locator;
  readonly cumulativeButton: Locator;

  // Chart containers
  readonly perCycleChartContainer: Locator;
  readonly cumulativeChartContainer: Locator;

  // Group selector & admin link
  readonly groupSelector: Locator;
  readonly adminLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.memberPaymentsHeading = page.getByRole('heading', { name: 'Member Payments' });
    this.memberPaymentsSubtitle = page.locator('h2:has-text("Member Payments") + p');

    this.groupSelector = page.getByRole('combobox', { name: 'Select savings group' });
    this.adminLink = page.getByRole('link', { name: 'Admin panel' });

    this.viewToggleGroup = page.getByRole('group', { name: 'Switch between table and chart view' });
    this.tableViewButton = page.getByRole('button', { name: 'Table view' });
    this.chartViewButton = page.getByRole('button', { name: 'Chart view' });

    this.chartToggleGroup = page.getByRole('group', { name: 'Switch between per-cycle and cumulative chart' });
    this.perCycleButton = this.chartToggleGroup.getByRole('button', { name: 'Per Cycle' });
    this.cumulativeButton = this.chartToggleGroup.getByRole('button', { name: 'Cumulative' });

    // Recharts renders inside a div[role="img"] — match by partial aria-label
    this.perCycleChartContainer = page.locator('[role="img"][aria-label*="Collection per cycle chart"]');
    this.cumulativeChartContainer = page.locator('[role="img"][aria-label*="Cumulative pot growth chart"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async switchToChartView() {
    await this.chartViewButton.click();
    await this.chartToggleGroup.waitFor({ state: 'visible' });
  }

  async switchToTableView() {
    await this.tableViewButton.click();
    // Table is visible when the chart toggle group is gone
    await this.chartToggleGroup.waitFor({ state: 'hidden' });
  }

  async switchToPerCycle() {
    await this.perCycleButton.click();
    await this.perCycleChartContainer.waitFor({ state: 'visible' });
  }

  async switchToCumulative() {
    await this.cumulativeButton.click();
    await this.cumulativeChartContainer.waitFor({ state: 'visible' });
  }

  /**
   * Returns the subtitle text directly under the "Member Payments" heading.
   * The subtitle <p> is a sibling of the <h2> inside the same flex container.
   */
  async getSubtitleText(): Promise<string> {
    return this.memberPaymentsSubtitle.innerText();
  }

  /** Select a group by visible name from the GroupSelector dropdown. */
  async selectGroup(name: string) {
    await this.groupSelector.click();
    await this.page.getByRole('option', { name }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
