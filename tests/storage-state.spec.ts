import { test, expect } from '@playwright/test';

test('Global Setup Test', async ({ page }) => {
  await page.goto('');
  await expect(page.getByTestId('nav-profile')).toBeVisible();
});
