import { test } from './fixtures/api-fixtures';
import { expect, request as requestFactory } from '@playwright/test';
import { ArticleController } from './controllers/ArticleController';
import { UserController } from './controllers/UserController';
import { faker } from '@faker-js/faker';

test('Login via API', async ({ request }) => {
  const response = await request.post('http://104.168.59.50/api/users/login', {
    data: {
      user: {
        email: 'olena@example.com',
        password: 'password',
      },
    },
  });

  expect(response.status()).toBe(200);

  const json = await response.json();
  const token = json.user.token;

  console.log('TOKEN:', token);
});

test('Get token via fixture', async ({ token }) => {
  console.log('TOKEN FROM FIXTURE:', token);
});

test('Login via fixture', async ({ page, login }) => {
  await page.goto('');

  await expect(page.getByTestId('nav-profile')).toBeVisible();
});

test('Get current user via API', async ({ request }) => {
  const response = await request.get('/api/user');

  expect(response.status()).toBe(200);

  const json = await response.json();
  console.log('CURRENT USER:', json);
});

test('Create article via API', async ({ page, request, login }) => {
  const articleController = new ArticleController(request);

  const title = `Test article from Antonio ${Date.now()}`;

  const response = await articleController.createArticle({
    article: {
      title,
      description: 'Created via Playwright API',
      body: 'This article was created using ArticleController.',
      tagList: ['playwright', 'api'],
    },
  });

  console.log('CREATED ARTICLE:', response);

  const slug = response.article.slug;

  try {
    expect(response.article.title).toBe(title);

    await page.goto('', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  } finally {
    await articleController.deleteArticle(slug);

    const response = await request.get(
      `/api/articles/${encodeURIComponent(slug)}`,
    );

    expect(response.status()).toBe(404);
  }
});

test('Add another user article to Favorites', async ({
  request,
  baseURL,
  page,
  login,
}) => {
  const userController = new UserController(request);

  const userData = {
    email: faker.internet.email(),
    password: '123456',
    username: faker.internet.username(),
  };

  const response = await userController.createUser({
    user: userData,
  });

  expect(response.user.email).toBe(userData.email);
  expect(response.user.username).toBe(userData.username);

  console.log(
    'Email: ' + response.user.email + 'Username: ' + response.user.username,
  );

  const newUserToken = await userController.loginAsUser(
    userData.email,
    userData.password,
  );

  expect(newUserToken).toBeTruthy();

  const newUserContext = await requestFactory.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: `Token ${newUserToken}`,
    },
  });

  try {
    const newUserArticleController = new ArticleController(newUserContext);
    const title = `${faker.book.title()} - ${response.user.username}}`;
    const articleResponse = await newUserArticleController.createArticle({
      article: {
        title,
        description: 'Article for Favorites test',
        body: 'Created by a newly registered user',
        tagList: [],
      },
    });

    console.log(title);

    const slug = articleResponse.article.slug;
    console.log(slug);

    expect(articleResponse.article.title).toBe(title);
    expect(articleResponse.article.author.username).toBe(userData.username);

    await page.goto(`/articles/article/${slug}`);

    await expect(page.getByTestId('nav-profile')).toHaveText('olena');
    await expect(page.getByText(title, { exact: true })).toBeVisible();

    await page.getByTestId('article-favorite-button').click();
    await page.getByTestId('nav-profile').click();
    await page.getByTestId('profile-tab-favorited').click();

    await expect(page.getByTestId('article-list')).toContainText(title);
  } finally {
    await newUserContext.dispose();
  }
});
