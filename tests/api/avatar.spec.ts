import { test } from '../fixtures/api-fixtures';
import { expect } from '@playwright/test';
import { SettingsPage } from '../pages/SettingsPage';

test('User can update avatar via UI', async ({ page, user, login }) => {
  const settingsPage = new SettingsPage(page);
  await settingsPage.openSettingsPage(user.user.username);
  await expect(settingsPage.usernameInput).toHaveValue(user.user.username);
  await expect(settingsPage.emailInput).toHaveValue(user.user.email);

  const avatarUrl =
    'https://i.pinimg.com/474x/72/f3/ab/72f3ab641148d227d799570de7547777.jpg';

  await settingsPage.setAvatar(avatarUrl);

  await expect(settingsPage.avatar).toBeVisible();
  await expect(settingsPage.avatar).toHaveAttribute('src', avatarUrl);

  await expect
    .poll(async () => {
      return await settingsPage.avatar.evaluate(
        (img: HTMLImageElement) => img.naturalWidth,
      );
    })
    .toBeGreaterThan(0);

  await page.reload();
  await expect(settingsPage.avatar).toBeVisible();
  await expect(settingsPage.avatar).toHaveAttribute('src', avatarUrl);

  await settingsPage.openSettingsPage(user.user.username);
  await expect(settingsPage.avatarInput).toHaveValue(avatarUrl);
});
