import { test as base } from '@playwright/test'

/**
 * Extends the base Playwright test with an `authenticatedPage` fixture
 * that reuses the stored session from global-setup (no login round-trip).
 */
export const test = base.extend<{ authenticatedPage: void }>({
  authenticatedPage: [
    async ({ page }, use) => {
      // storageState is already applied via playwright.config.ts project config.
      // This fixture just makes the dependency explicit and navigates to dashboard
      // so tests can start from a known authenticated state.
      await page.goto('/dashboard')
      await use()
    },
    { auto: false },
  ],
})

export { expect } from '@playwright/test'
