import { test, expect } from '@playwright/test'

test.describe('Explore', () => {
  // Authentication is handled via storageState (chromium-auth project in playwright.config.ts)

  test('Explore page loads with filter controls', async ({ page }) => {
    await page.goto('/explore')
    await expect(page.getByText(/Find your next project/i)).toBeVisible()
    await expect(page.getByText('All Stages')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Any' })).toBeVisible()
  })

  test('Stage filter changes URL params', async ({ page }) => {
    await page.goto('/explore')
    await page.getByRole('button', { name: 'Idea' }).click()
    await expect(page).toHaveURL(/stage=idea/)
  })

  test('Explore page renders content area', async ({ page }) => {
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('div.min-h-screen').first()).toBeVisible()
  })

})
