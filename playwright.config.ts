import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.test' })

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  reporter: [['html', { outputFolder: 'tests/reports/playwright' }], ['list']],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      // Unauthenticated tests only (public pages, auth flows)
      name: 'chromium-anon',
      testMatch: ['**/auth.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Authenticated tests — session loaded from storageState (global-setup.ts)
      name: 'chromium-auth',
      testMatch: [
        '**/explore.spec.ts',
        '**/messages.spec.ts',
        '**/project-flow.spec.ts',
        '**/security.spec.ts',
        '**/dashboard.spec.ts',
        '**/project-detail.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user-a.json',
      },
    },
    {
      name: 'chromium-user-b',
      testMatch: [
        '**/apply-flow.spec.ts',
        '**/profile.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user-b.json',
      },
    },
  ],
})
