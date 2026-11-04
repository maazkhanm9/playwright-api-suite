import { defineConfig } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  // Where the test files are.
  testDir: './tests',

  // Runs once before all tests: wakes up the server (cold start).
  globalSetup: './src/setup/global-setup.ts',

  // Run tests at the same time. Safe because each test makes its own data.
  fullyParallel: true,

  // If a test fails, try it once more (network blips on the free server).
  // A test that only passes on the retry is marked "flaky" in the report.
  retries: 1,

  // Max time for one test: 60 seconds, because the free server can be slow.
  timeout: 60000,

  // 'list' prints results in the terminal; 'html' makes the report file.
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
  ],

  use: {
    // So tests can call '/booking' instead of the full URL.
    baseURL: env.baseUrl,

    // Sent with every request. Without Accept, POST /booking returns 418.
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },

  // One project called 'api'. No browsers, because we only test the API.
  projects: [{ name: 'api' }],
});
