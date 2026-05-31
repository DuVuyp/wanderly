import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // Port client
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Chạy song song nhưng không quá tải máy
  workers: process.env.CI ? 2 : 1,
});