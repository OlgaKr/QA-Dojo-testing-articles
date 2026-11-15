import { expect, test } from '@playwright/test';
import { contactFormCases } from './contact-form-data.refactored';
import { ContactFormPage } from './contact-form-page.refactored';

test.describe('Contact form (refactored)', () => {
  for (const { name, formData, expected } of contactFormCases) {
    test(name, async ({ page }) => {
      const contactForm = new ContactFormPage(page);

      await contactForm.open();
      await contactForm.fill(formData);
      await contactForm.submit();

      if (expected.kind === 'success') {
        await expect(contactForm.successHeading).toBeVisible();
        return;
      }

      await expect(contactForm.requiredFieldErrors).toHaveCount(
        expected.requiredFieldErrorCount,
      );
      await expect(contactForm.invalidEmailError).toBeVisible({
        visible: expected.invalidEmail,
      });
      await expect(contactForm.successHeading).not.toBeVisible();
    });
  }
});
