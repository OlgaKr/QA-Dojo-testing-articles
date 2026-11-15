import { resolve } from 'node:path';

export interface ContactFormData {
  userName?: string;
  email?: string;
  message?: string;
  subject?: string;
  priority?: string;
  receiveCopy?: boolean;
  attachment?: string;
}

type RequiredContactFormData = ContactFormData &
  Required<Pick<ContactFormData, 'userName' | 'email' | 'message'>>;

export type ContactFormTestCase = { readonly name: string } & (
  | {
      readonly formData: RequiredContactFormData;
      readonly expected: { readonly kind: 'success' };
    }
  | {
      readonly formData: ContactFormData;
      readonly expected: {
        readonly kind: 'validation-error';
        readonly requiredFieldErrorCount: number;
        readonly invalidEmail: boolean;
      };
    }
);

const attachment = resolve(__dirname, 'test-image.png');

export const contactFormCases = [
  {
    name: 'all fields',
    formData: {
      userName: 'Olena',
      email: 'olena@example.com',
      message: 'Знайшла помилку на сторінці статті.',
      subject: 'Повідомити про ваду',
      priority: 'Високий',
      receiveCopy: true,
      attachment,
    },
    expected: { kind: 'success' },
  },
  {
    name: 'required fields only',
    formData: {
      userName: 'Pavlo',
      email: 'pavlo@example.com',
      message: 'Маю питання щодо статті.',
    },
    expected: { kind: 'success' },
  },
  {
    name: 'optional fields only',
    formData: {
      subject: 'Пропозиція функції',
      priority: 'Низький',
      receiveCopy: true,
      attachment,
    },
    expected: {
      kind: 'validation-error',
      requiredFieldErrorCount: 2,
      invalidEmail: true,
    },
  },
] satisfies readonly ContactFormTestCase[];
