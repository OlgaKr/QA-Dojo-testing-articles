import { test } from '@playwright/test';

import {
  registerUser,
  loginUser,
  logoutUser,
  createArticle,
  followAuthor,
  openYourFeed,
  verifyArticlesInFeed,
  deleteArticle,
} from './your-feed-helpers';

test('should display followed author articles in Your Feed', async ({
  page,
}) => {
  test.setTimeout(120000);

  await page.goto('register');

  const author = await registerUser(page);

  const titles: string[] = [];
  const runId = Date.now();

  for (let i = 1; i <= 10; i++) {
    const title = `Your Feed Article ${runId}-${i}`;

    await createArticle(
      page,
      title,
      'This article is about QA',
      'Text of article',
    );

    titles.push(title);
  }

  await logoutUser(page);

  await page.goto('register');

  await registerUser(page);

  const articleTitle = titles[titles.length - 1];

  await followAuthor(page, articleTitle);

  await openYourFeed(page);

  await verifyArticlesInFeed(page, titles);

  await logoutUser(page);

  await loginUser(page, author.email, author.password, author.username);

  for (const title of titles) {
    await deleteArticle(page, title);
  }
});
