import { defineConfig, devices } from '@playwright/test';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './__tests__/e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: siteUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    contextOptions: {
      reducedMotion: 'reduce',
    },
    javaScriptEnabled: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: siteUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
}); 