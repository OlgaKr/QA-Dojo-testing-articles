import { test, expect } from '@playwright/test';

const HAR_PATH = 'tests/mocks/articles.har';

test('record HAR for articles', async ({ page }) => {
  await page.routeFromHAR(HAR_PATH, {
    url: '**/api/**',
    update: true,
    updateContent: 'embed',
    updateMode: 'minimal',
  });

  await page.goto('');

  await expect(
    page.locator('[data-testid^="article-preview-"]').first(),
  ).toBeVisible();
});

test('replay articles from HAR', async ({ page }) => {
  await page.routeFromHAR(HAR_PATH, {
    url: '**/api/**',
    notFound: 'abort',
  });

  await page.goto('');

  await expect(page.locator('[data-testid^="article-preview-"]')).toHaveCount(
    9,
  );

  await expect(
    page.getByText('ЭТУ СТАТЬЮ ПОДСУНУЛ PLAYWRIGHT HAR 😎'),
  ).toBeVisible();
});

test('abort request missing from HAR', async ({ page }) => {
  await page.routeFromHAR('tests/mocks/articles-without-articles.har', {
    url: '**/api/articles?*',
    notFound: 'abort',
  });

  await page.goto('');

  await expect(
    page.getByText('could not load articles', { exact: false }),
  ).toBeVisible();
});

test('fallback to real API when HAR entry is missing', async ({ page }) => {
  await page.routeFromHAR('tests/mocks/articles-without-articles.har', {
    url: '**/api/articles?*',
    notFound: 'fallback',
  });

  await page.goto('');

  await expect(
    page.locator('[data-testid^="article-preview-"]').first(),
  ).toBeVisible();

  await page.waitForTimeout(5000);
});
