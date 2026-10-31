import { defineConfig, devices } from '@playwright/test';
//import 'dotenv/config';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [['dot'], ['html']],

  use: {
    trace: 'on-first-retry',
    baseURL: 'http://104.168.59.50/articles/',
    //baseURL: process.env.BASE_URL ?? 'https://qa.example.com',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
