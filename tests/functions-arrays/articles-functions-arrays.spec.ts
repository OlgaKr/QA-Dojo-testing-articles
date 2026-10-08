import { test } from '@playwright/test';
import {
  registerUser,
  createArticle,
  verifyArticlesInFeed,
  deleteArticle,
  openGlobalFeed,
} from './article-helpers';

test('should create 10 articles and display them in Global Feed', async ({
  page,
}) => {
  //test.setTimeout(120000);

  await page.goto('register');

  await registerUser(page);

  const titles: string[] = [];
  const runId = Date.now();

  for (let i = 1; i <= 10; i++) {
    const title = `Test Article ${runId}-${i}`;

    await createArticle(
      page,
      title,
      'This article is about QA',
      'Text of article',
    );

    titles.push(title);
  }

  await openGlobalFeed(page);
  await verifyArticlesInFeed(page, titles);

  for (const title of titles) {
    await deleteArticle(page, title);
  }
});
