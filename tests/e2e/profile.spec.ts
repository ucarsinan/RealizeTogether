import { test, expect } from '@playwright/test'
import { navigateToProfile } from './fixtures'

test.describe('Public Profile', () => {
  // Runs in chromium-user-b (User B) AND potentially chromium-auth (User A viewing User B)

  test('Profile page renders', async ({ page }) => {
    const userId = process.env.TEST_USER_B_ID!
    await navigateToProfile(page, userId)
    await expect(page.locator('div.min-h-screen').first()).toBeVisible()
  })

  test('Profile page does not 404', async ({ page }) => {
    const userId = process.env.TEST_USER_B_ID!
    await navigateToProfile(page, userId)
    await expect(page).not.toHaveURL(/not-found/)
    await expect(page.getByText('404')).not.toBeVisible()
  })

  test('Breadcrumb navigation is visible', async ({ page }) => {
    const userId = process.env.TEST_USER_B_ID!
    await navigateToProfile(page, userId)
    await expect(page.getByRole('link', { name: 'Explore' })).toBeVisible()
  })
})
