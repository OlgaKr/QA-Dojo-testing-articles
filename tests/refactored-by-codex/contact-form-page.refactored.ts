import { type Locator, type Page } from '@playwright/test';
import { type ContactFormData } from './contact-form-data.refactored';

export class ContactFormPage {
  readonly successHeading: Locator;
  readonly requiredFieldErrors: Locator;
  readonly invalidEmailError: Locator;

  constructor(private readonly page: Page) {
    this.successHeading = page.getByRole('heading', { name: 'Дякуємо! 🎉' });
    this.requiredFieldErrors = page.getByText("обов'язкове поле");
    this.invalidEmailError = page.getByText('некоректний email');
  }

  async open(): Promise<void> {
    await this.page.goto('contact');
  }

  async fill(data: ContactFormData): Promise<void> {
    if (data.userName !== undefined) {
      await this.page.getByRole('textbox', { name: "Ім'я" }).fill(data.userName);
    }

    if (data.email !== undefined) {
      await this.page.getByTestId('contact-email').fill(data.email);
    }

    if (data.message !== undefined) {
      await this.page
        .getByRole('textbox', { name: 'Повідомлення' })
        .fill(data.message);
    }

    if (data.subject !== undefined) {
      await this.page.getByLabel('Тема').selectOption({ label: data.subject });
    }

    if (data.priority !== undefined) {
      await this.page.getByLabel(data.priority).check();
    }

    if (data.receiveCopy !== undefined) {
      await this.page
        .getByRole('checkbox', {
          name: 'Надіслати копію звернення мені на email',
        })
        .setChecked(data.receiveCopy);
    }

    if (data.attachment !== undefined) {
      await this.page.locator('input[type="file"]').setInputFiles(data.attachment);
    }
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Надіслати' }).click();
  }
}
