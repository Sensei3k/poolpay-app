import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the /admin page.
 * Encapsulates locators and interactions for admin CRUD flows.
 */
export class AdminPage {
  readonly page: Page;

  // Nav
  readonly heading: Locator;
  readonly backLink: Locator;

  // Config warning banner
  readonly configWarning: Locator;

  // Groups section
  readonly groupsHeading: Locator;
  readonly addGroupButton: Locator;

  // Members section
  readonly membersHeading: Locator;
  readonly addMemberButton: Locator;

  // Cycles section
  readonly cyclesHeading: Locator;
  readonly addCycleButton: Locator;

  // Dialog / form elements (shared)
  readonly dialogTitle: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Admin' });
    this.backLink = page.getByRole('link', { name: 'Back to dashboard' });
    this.configWarning = page.getByRole('alert').filter({ hasText: 'ADMIN_TOKEN is not set' });

    this.groupsHeading = page.getByRole('heading', { name: 'Groups' });
    this.addGroupButton = page.getByRole('button', { name: 'Add Group' });

    this.membersHeading = page.getByRole('heading', { name: 'Members' });
    this.addMemberButton = page.getByRole('button', { name: 'Add Member' });

    this.cyclesHeading = page.getByRole('heading', { name: 'Cycles' });
    this.addCycleButton = page.getByRole('button', { name: 'Add Cycle' });

    this.dialogTitle = page.getByRole('dialog').getByRole('heading');
    this.saveButton = page.getByRole('button', { name: /^(Create|Add|Save)/ });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
    this.errorMessage = page.getByRole('alert').filter({ hasNot: page.getByText('ADMIN_TOKEN') });
  }

  async goto(groupId?: string) {
    const url = groupId ? `/admin?group=${groupId}` : '/admin';
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  /** Click the group tab with the given name. */
  async selectGroupTab(name: string) {
    await this.page.getByRole('tab', { name }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Open the add/edit form for a group by name (edit) or click Add Group. */
  async clickEditGroup(name: string) {
    await this.page.getByRole('button', { name: `Edit ${name}` }).click();
  }

  async clickDeleteGroup(name: string) {
    await this.page.getByRole('button', { name: `Delete ${name}` }).click();
  }

  async clickEditMember(name: string) {
    await this.page.getByRole('button', { name: `Edit ${name}` }).click();
  }

  async clickDeleteMember(name: string) {
    await this.page.getByRole('button', { name: `Delete ${name}` }).click();
  }

  async clickEditCycle(number: number) {
    await this.page.getByRole('button', { name: `Edit cycle ${number}` }).click();
  }

  async clickDeleteCycle(number: number) {
    await this.page.getByRole('button', { name: `Delete cycle ${number}` }).click();
  }
}
