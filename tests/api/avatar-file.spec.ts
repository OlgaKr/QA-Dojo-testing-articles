import { test } from '../fixtures/api-fixtures';
import { expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('Update avatar via API', async ({ request, user, login, page }) => {
  const imageBuffer = await readFile('tests/fixtures/images/avatar.jpg');
  const base64 = imageBuffer.toString('base64');
  const imageDataUrl = `data:image/jpeg;base64,${base64}`;
  const response = await request.put('http://104.168.59.50/api/user', {
    headers: {
      Authorization: `Token ${user.user.token}`,
    },
    data: {
      user: {
        image: imageDataUrl,
        username: user.user.username,
        email: user.user.email,
        bio: '',
      },
    },
  });

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(responseBody.user.image).toBe(imageDataUrl);

  const getResponse = await request.get(
    `http://104.168.59.50/api/profiles/${user.user.username}`,
  );

  expect(getResponse.status()).toBe(200);

  const profile = await getResponse.json();

  expect(profile.profile.image).toBe(imageDataUrl);

  await page.goto(`profile/${user.user.username}`);

  const avatar = page.getByTestId('profile-page').locator('header img');

  await expect(avatar).toHaveAttribute('src', imageDataUrl);

  await page.waitForTimeout(5000);
});
