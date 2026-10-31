// spec: specs/login-cli.plan.md
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('Successful login', async ({ page }) => {
    await page.goto('login');
    await expect(
      page.getByRole('heading', { name: 'Sign in', exact: true }),
    ).toBeVisible();

    // 1. Enter olena@example.com in Email.
    await page.getByTestId('auth-email').fill('olena@example.com');

    // 2. Enter password in Password.
    await page.getByTestId('auth-password').fill('password');

    // 3. Click the form's Sign in button.
    await page.getByTestId('auth-submit').click();

    // 4. Wait for navigation and inspect only the header for authentication evidence.
    await expect(page).toHaveURL('http://104.168.59.50/articles');
    const header = page.getByRole('banner');
    await expect(
      header.getByRole('link', { name: 'olena', exact: true }),
    ).toBeVisible();
    await expect(
      header.getByRole('link', { name: 'Sign in', exact: true }),
    ).toHaveCount(0);
    await expect(
      header.getByRole('link', { name: 'Register', exact: true }),
    ).toHaveCount(0);
  });
});
