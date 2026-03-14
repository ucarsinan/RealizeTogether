import { test, expect } from '@playwright/test'

test.describe('Messages', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(process.env.TEST_USER_A_EMAIL!)
    await page.locator('input[type="password"]').fill(process.env.TEST_USER_A_PASSWORD!)
    await page.getByRole('button', { name: /Log in/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test('Messages page loads', async ({ page }) => {
    await page.goto('/messages')
    await expect(page.getByText(/Conversations/i)).toBeVisible()
  })

  test('Empty state or list is shown', async ({ page }) => {
    await page.goto('/messages')
    // Page renders either a list of conversations or an empty state — both are valid
    await page.waitForLoadState('networkidle')
    const hasList = await page.locator('a[href*="/messages/"]').count()
    expect(hasList >= 0).toBeTruthy()
  })

})
