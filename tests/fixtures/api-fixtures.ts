import {
  test as base,
  request as requestFactory,
  type APIRequestContext,
} from '@playwright/test';

type MyFixtures = {
  token: string;
  login: void;
  request: APIRequestContext;
};

export const test = base.extend<MyFixtures>({
  token: async ({}, use) => {
    const apiContext = await requestFactory.newContext();
    const response = await apiContext.post(
      'http://104.168.59.50/api/users/login',
      {
        data: {
          user: {
            email: 'olena@example.com',
            password: 'password',
          },
        },
        failOnStatusCode: true,
      },
    );
    const json = await response.json();
    const token = json.user.token;
    await use(token);
    await apiContext.dispose();
  },

  login: async ({ context, baseURL, token }, use) => {
    if (!baseURL) {
      throw new Error('baseURL is not configured');
    }
    await context.setStorageState({
      cookies: [],
      origins: [
        {
          origin: new URL(baseURL).origin,
          localStorage: [
            {
              name: 'qa-dojo.token',
              value: token,
            },
          ],
        },
      ],
    });
    await use();
  },

  request: async ({ token, baseURL }, use) => {
    const apiContext = await requestFactory.newContext({
      baseURL,
      extraHTTPHeaders: {
        Authorization: `Token ${token}`,
      },
    });
    await use(apiContext);
    await apiContext.dispose();
  },
});
