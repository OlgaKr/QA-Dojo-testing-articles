import { expect, Page } from '@playwright/test';

export async function registerUser(page: Page) {
  const timestamp = Date.now();
  const username = `olga${timestamp}`;
  const email = `olga${timestamp}@test.com`;
  const password = 'Test123!';

  await page.getByTestId('auth-username').fill(username);
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('register-confirm-password').fill(password);
  await page.getByTestId('register-terms').check();
  await page.getByTestId('auth-submit').click();

  await expect(page.getByTestId('nav-profile')).toContainText(username);

  return {
    username,
    email,
    password,
  };
}

export async function loginUser(
  page: Page,
  email: string,
  password: string,
  username: string,
) {
  await page.getByTestId('nav-sign-in').click();
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  await page.getByTestId('auth-submit').click();

  await expect(page.getByTestId('nav-profile')).toContainText(username);
}

export async function logoutUser(page: Page) {
  await page.getByTestId('nav-profile').click();
  await page.getByRole('link', { name: 'Edit profile' }).click();
  await page.getByTestId('logout-button').click();
}

export async function createArticle(
  page: Page,
  title: string,
  description: string,
  body: string,
) {
  await page.getByTestId('nav-new-article').click();
  await page.getByTestId('editor-title').fill(title);
  await page.getByTestId('editor-description').fill(description);
  await page.getByTestId('editor-body').fill(body);
  await page.getByTestId('editor-submit').click();

  await expect(
    page.getByRole('heading', {
      name: title,
      level: 1,
    }),
  ).toBeVisible();
}

export async function followAuthor(page: Page, articleTitle: string) {
  await page.getByTestId('feed-tab-global').click();

  await page
    .getByRole('heading', {
      name: articleTitle,
      level: 2,
      exact: true,
    })
    .click();

  await page.getByTestId('article-follow-button').click();
}

export async function openYourFeed(page: Page) {
  await page.getByTestId('nav-home').click();
  await page.getByTestId('feed-tab-your').click();
}

export async function verifyArticlesInFeed(page: Page, titles: string[]) {
  const foundTitles: string[] = [];
  let pageNumber = 1;

  await expect(page.getByText('Loading articles…')).toBeHidden();
  await expect(page.locator('main article').first()).toBeVisible();

  while (foundTitles.length < titles.length) {
    for (const title of titles) {
      if (foundTitles.includes(title)) {
        continue;
      }

      const articleTitle = page.getByRole('heading', {
        name: title,
        level: 2,
        exact: true,
      });

      if ((await articleTitle.count()) > 0) {
        foundTitles.push(title);
      }
    }

    if (foundTitles.length === titles.length) {
      break;
    }

    pageNumber++;

    const nextPage = page.getByRole('button', {
      name: String(pageNumber),
      exact: true,
    });

    if ((await nextPage.count()) === 0) {
      const missingTitles = titles.filter(
        (title) => !foundTitles.includes(title),
      );

      throw new Error(
        `Articles not found in feed: ${missingTitles.join(', ')}`,
      );
    }

    await nextPage.click();
    await expect(page.getByText('Loading articles…')).toBeHidden();
  }
}

export async function deleteArticle(page: Page, title: string) {
  await page.getByTestId('nav-home').click();
  await page.getByTestId('feed-tab-global').click();

  await expect(page.getByText('Loading articles…')).toBeHidden();
  await expect(page.locator('main article').first()).toBeVisible();

  let pageNumber = 1;

  while (true) {
    const articleTitle = page.getByRole('heading', {
      name: title,
      level: 2,
      exact: true,
    });

    if ((await articleTitle.count()) > 0) {
      await articleTitle.click();

      const deleteButton = page.getByTestId('delete-article-button');

      await expect(deleteButton).toBeVisible();
      await deleteButton.click({ force: true });

      await expect(page.getByTestId('feed-tab-global')).toBeVisible();

      return;
    }

    pageNumber++;

    const nextPage = page.getByRole('button', {
      name: String(pageNumber),
      exact: true,
    });

    if ((await nextPage.count()) === 0) {
      throw new Error(`Article not found for deletion: ${title}`);
    }

    await nextPage.click();
    await expect(page.getByText('Loading articles…')).toBeHidden();
  }
}
