import { test, expect } from '@playwright/test'

test.describe('Project Creation & Application Flow', () => {
  // Authentication is handled via storageState (chromium-auth project in playwright.config.ts)

  test('Can navigate to new project form', async ({ page }) => {
    await page.goto('/projects/new')
    await expect(page.getByText(/Create a project/i)).toBeVisible()
  })

  test('Project form submit button is disabled when form is empty', async ({ page }) => {
    await page.goto('/projects/new')
    const submitBtn = page.getByRole('button', { name: /Create project/i })
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeDisabled()
  })

  test('Dashboard has link to create a new project', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('a[href="/projects/new"]').first()).toBeVisible()
  })

})
