import { expect, type Page } from '@playwright/test';

export const testData = [
  {
    name: 'all fields',
    formData: {
      userName: 'Olena',
      email: 'olena@example.com',
      message: 'Знайшла помилку на сторінці статті.',
      subject: 'Повідомити про ваду',
      priority: 'Високий',
      receiveCopy: true,
      attachment: 'tests/objects/test-image.png',
    },

    verify: async function (page: Page) {
      await expect(
        page.getByRole('heading', { name: 'Дякуємо! 🎉' }),
      ).toBeVisible();
    },
  },

  {
    name: 'required fields only',
    formData: {
      userName: 'Pavlo',
      email: 'pavlo@example.com',
      message: 'Маю питання щодо статті.',
    },

    verify: async function (page: Page) {
      await expect(
        page.getByRole('heading', { name: 'Дякуємо! 🎉' }),
      ).toBeVisible();
    },
  },

  {
    name: 'optional fields only',
    formData: {
      subject: 'Пропозиція функції',
      priority: 'Низький',
      receiveCopy: true,
      attachment: 'tests/objects/test-image.png',
    },

    verify: async function (page: Page) {
      await expect(page.getByText("обов'язкове поле")).toHaveCount(2);

      await expect(page.getByText('некоректний email')).toBeVisible();

      await expect(
        page.getByRole('heading', { name: 'Дякуємо! 🎉' }),
      ).not.toBeVisible();
    },
  },
];
