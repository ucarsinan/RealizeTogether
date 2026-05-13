import { test as base, type Page } from '@playwright/test'

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

export async function navigateToProject(page: Page, projectId: string) {
  await page.goto(`/projects/${projectId}`)
  await page.waitForLoadState('networkidle')
}

export async function navigateToProfile(page: Page, userId: string) {
  await page.goto(`/profile/${userId}`)
  await page.waitForLoadState('networkidle')
}
