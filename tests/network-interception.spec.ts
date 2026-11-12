import { test } from './fixtures/api-fixtures';
import { expect } from '@playwright/test';
import mockArticles from './mocks/articles.json' with { type: 'json' };

test('Should modify article title in POST request', async ({ page, login }) => {
  const originalTitle = 'Original article title';
  const modifiedTitle = 'Modified article title';

  await page.route('**/api/articles', async (route) => {
    const request = route.request();

    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }
    const postData = request.postDataJSON();
    postData.article.title = modifiedTitle;

    await route.continue({
      postData: JSON.stringify(postData),
    });
  });

  await page.goto('');
  await page.getByTestId('nav-new-article').click();

  await page.getByTestId('editor-title').fill(originalTitle);
  await page.getByTestId('editor-description').fill('Test description');
  await page.getByTestId('editor-body').fill('Test article body');

  await page.getByTestId('editor-submit').click();

  await expect(
    page.getByRole('heading', { name: modifiedTitle }),
  ).toBeVisible();
});

test('Should display mocked article', async ({ page }) => {
  await page.route('**/api/articles?**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        json: mockArticles,
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('');
  await page.getByTestId('feed-tab-global').click();

  await expect(
    page.getByRole('heading', { name: mockArticles.articles[0].title }),
  ).toBeVisible();

  await expect(page.locator('[data-testid^="article-preview-"]')).toHaveCount(
    1,
  );
});
