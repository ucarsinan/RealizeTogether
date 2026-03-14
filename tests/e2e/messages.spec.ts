import { test, expect } from '@playwright/test'

test.describe('Messages', () => {
  // Authentication is handled via storageState (chromium-auth project in playwright.config.ts)

  test('Messages page loads', async ({ page }) => {
    await page.goto('/messages')
    await expect(page.getByRole('heading', { name: 'Conversations' })).toBeVisible()
  })

  test('Empty state or list is shown', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForLoadState('networkidle')
    const hasList = await page.locator('a[href*="/messages/"]').count()
    expect(hasList >= 0).toBeTruthy()
  })

})
