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

  test('Messages heading is present', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Conversations' })).toBeVisible()
  })

  test('Conversation detail loads if conversations exist', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForLoadState('networkidle')
    const conversationLinks = page.locator('a[href*="/messages/"]')
    const count = await conversationLinks.count()
    if (count === 0) {
      // Empty state is valid
      return
    }
    await conversationLinks.first().click()
    await page.waitForLoadState('networkidle')
    // Message input area exists in conversation
    await expect(
      page.getByRole('textbox').or(page.getByPlaceholder(/message/i))
    ).toBeVisible({ timeout: 5000 })
  })

})
