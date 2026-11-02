import { test, expect } from '@playwright/test';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

test('Cookies Test', async ({ page, context }) => {
  await page.goto('https://www.zara.com/es/en/');
  await page.getByRole('button', { name: 'Accept All Cookies' }).click();
  await page.getByRole('button', { name: 'Yes, continue on Spain' }).click();
  const cookies = await context.cookies();
  expect(cookies.length).toBeGreaterThan(0);

  const initialCookie = cookies.find(
    (item) =>
      item.name === 'CookiesConsent' &&
      item.domain === '.www.zara.com' &&
      item.path === '/',
  );

  if (!initialCookie) {
    throw new Error('CookiesConsent cookie not found');
  }

  const initialValue = initialCookie.value;

  const updatedCookies = cookies.map((cookie) => {
    const isTarget =
      cookie.name === 'CookiesConsent' &&
      cookie.domain === '.www.zara.com' &&
      cookie.path === '/';

    if (isTarget) {
      return { ...cookie, value: 'changed' };
    }

    return cookie;
  });

  await context.clearCookies();
  const cookiesAfterClear = await context.cookies();
  expect(cookiesAfterClear).toEqual([]);

  await context.addCookies(updatedCookies);

  const cookiesAfterUpdate = await context.cookies();

  const updatedCookie = cookiesAfterUpdate.find(
    (item) =>
      item.name === 'CookiesConsent' &&
      item.domain === '.www.zara.com' &&
      item.path === '/',
  );

  if (!updatedCookie) {
    throw new Error('Updated CookiesConsent cookie not found');
  }

  const updatedCookieValue = updatedCookie.value;

  expect(updatedCookieValue).toBe('changed');
  expect(initialValue).not.toBe(updatedCookieValue);
});
