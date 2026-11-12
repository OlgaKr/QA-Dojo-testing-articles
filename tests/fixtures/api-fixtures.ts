import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
  UserController,
  type UserResponse,
} from '../controllers/UserController';

type ApiFixtures = {
  user: UserResponse;
  login: void;
};

export const test = base.extend<ApiFixtures>({
  user: async ({ request }, use) => {
    const userData = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: '123456',
    };

    const userController = new UserController(request);
    const createdUser = await userController.createUser({ user: userData });
    expect(createdUser.user.username).toBe(userData.username);
    expect(createdUser.user.email).toBe(userData.email);
    expect(createdUser.user.token).toBeTruthy();

    await use(createdUser);
  },

  login: async ({ user, context }, use) => {
    const token = user.user.token;

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    await context.setStorageState({
      cookies: [],
      origins: [
        {
          origin: 'http://104.168.59.50',
          localStorage: [{ name: 'qa-dojo.token', value: token }],
        },
      ],
    });
    await use();
  },
});
