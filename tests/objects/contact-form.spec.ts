import { test } from '@playwright/test';
import { testData } from './contact-form-data';

for (const data of testData) {
  test(`Contact form: ${data.name}`, async ({ page }) => {
    await page.goto('contact');

    if (data.formData.userName) {
      await page
        .getByRole('textbox', { name: "Ім'я" })
        .fill(data.formData.userName);
    }

    if (data.formData.email) {
      await page.getByTestId('contact-email').fill(data.formData.email);
    }

    if (data.formData.message) {
      await page
        .getByRole('textbox', { name: 'Повідомлення' })
        .fill(data.formData.message);
    }

    if (data.formData.subject) {
      await page
        .getByLabel('Тема')
        .selectOption({ label: data.formData.subject });
    }

    if (data.formData.priority) {
      await page.getByLabel(data.formData.priority).check();
    }

    if (data.formData.receiveCopy) {
      await page
        .getByRole('checkbox', {
          name: 'Надіслати копію звернення мені на email',
        })
        .check();
    }

    if (data.formData.attachment) {
      await page
        .locator('input[type="file"]')
        .setInputFiles(data.formData.attachment);
    }

    await page.getByRole('button', { name: 'Надіслати' }).click();

    await data.verify(page);
  });
}
