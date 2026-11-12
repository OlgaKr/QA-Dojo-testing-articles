import { type Page, type Locator } from '@playwright/test';

export class SettingsPage {
  private readonly page: Page;
  readonly avatarInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly editProfile: Locator;
  readonly avatar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.avatarInput = this.page.getByTestId('settings-image');
    this.usernameInput = this.page.getByTestId('settings-username');
    this.emailInput = this.page.getByTestId('settings-email');
    this.submitButton = this.page.getByTestId('settings-submit');
    this.editProfile = this.page.getByRole('link', { name: 'Edit profile' });
    this.avatar = this.page.getByTestId('profile-page').locator('img');
  }

  async openSettingsPage(username: string) {
    await this.page.goto(`profile/${username}`);
    await this.editProfile.click();
  }

  async setAvatar(avatarUrl: string) {
    await this.avatarInput.fill(avatarUrl);
    await this.submitButton.click();
  }
}
