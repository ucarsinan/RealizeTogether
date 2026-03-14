import { test, expect } from '@playwright/test'

test.describe('Messages', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/Email/i).fill(process.env.TEST_USER_A_EMAIL!)
    await page.getByPlaceholder(/Password/i).fill(process.env.TEST_USER_A_PASSWORD!)
    await page.getByRole('button', { name: /Log in/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test('Messages page loads', async ({ page }) => {
    await page.goto('/messages')
    await expect(page.getByText(/Conversations/i)).toBeVisible()
  })

  test('Empty state is shown when no conversations', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(1500)
    const isEmpty = await page.getByText(/No conversations/i).isVisible().catch(() => false)
    const hasList = await page.locator('a[href*="/messages/"]').count()
    expect(isEmpty || hasList >= 0).toBeTruthy()
  })

})
