// spec: specs/registration-exploration.plan.md
// seed: tests/seed.spec.ts

import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';

test.describe('Successful registration and account lifecycle', () => {
  test('REG-04 — Register with default choices', async ({ page }) => {
    const suffix = randomUUID().replace(/-/g, '').slice(0, 20);
    const username = `qa_reg_${suffix}`;
    const email = `${username}@example.com`;
    const password = 'ValidPass123!';
    let registrationRequests = 0;
    const registrationStatuses: number[] = [];

    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        new URL(request.url()).pathname === '/api/users'
      ) {
        registrationRequests += 1;
      }
    });
    page.on('response', (response) => {
      if (
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/users'
      ) {
        registrationStatuses.push(response.status());
      }
    });

    // Fresh start F: open the article feed and click the header Register link.
    await page.goto('');
    await page.getByTestId('nav-sign-up').click();
    await expect(page).toHaveURL(/\/articles\/register\/?$/);

    // 1. Complete V, retaining Ukraine, Search, and digest selected.
    await page.getByTestId('auth-username').fill(username);
    await page.getByTestId('auth-email').fill(email);
    await page.getByTestId('auth-password').fill(password);
    await page.getByTestId('register-confirm-password').fill(password);
    await expect(
      page.getByTestId('register-country').locator('option:checked'),
    ).toHaveText('Ukraine');
    await expect(page.getByTestId('register-source-search')).toBeChecked();
    await expect(page.getByTestId('register-source-friend')).not.toBeChecked();
    await expect(page.getByTestId('register-source-social')).not.toBeChecked();
    await expect(page.getByTestId('register-source-course')).not.toBeChecked();
    await expect(page.getByTestId('register-newsletter')).toBeChecked();
    await expect(page.getByTestId('auth-submit')).toBeDisabled();
    await page.getByTestId('register-terms').check();

    // 2. Verify Create account becomes enabled after terms is selected; click it once.
    await expect(page.getByTestId('auth-submit')).toBeEnabled();
    const registrationResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/users',
    );
    await page.getByTestId('auth-submit').click();

    // 3. Verify the successful registration outcomes in convention 4.
    expect((await registrationResponse).status()).toBe(201);
    await expect(page).toHaveURL(/\/articles\/?$/);
    await expect(
      page.getByRole('link', { name: 'New article', exact: true }),
    ).toBeVisible();
    const profileLink = page.getByRole('link', { name: username, exact: true });
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toHaveAttribute(
      'href',
      `/articles/profile/${username}`,
    );
    await expect(page.getByTestId('error-messages')).not.toBeVisible();

    // 4. Open the username profile and Edit profile; verify the username and email match the submitted values.
    await profileLink.click();
    await expect(
      page.getByRole('heading', { name: username, exact: true }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Edit profile', exact: true }).click();
    await expect(page.getByTestId('settings-username')).toHaveValue(username);
    await expect(page.getByTestId('settings-email')).toHaveValue(email);
    expect(registrationRequests).toBe(1);
    expect(registrationStatuses).toEqual([201]);
  });
});
