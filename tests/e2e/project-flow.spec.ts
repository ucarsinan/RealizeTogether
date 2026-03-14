import { test, expect } from '@playwright/test'

test.describe('Project Creation & Application Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(process.env.TEST_USER_A_EMAIL!)
    await page.locator('input[type="password"]').fill(process.env.TEST_USER_A_PASSWORD!)
    await page.getByRole('button', { name: /Log in/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test('Can navigate to new project form', async ({ page }) => {
    await page.goto('/projects/new')
    await expect(page.getByText(/Create a project/i)).toBeVisible()
  })

  test('Project form validates required fields', async ({ page }) => {
    await page.goto('/projects/new')
    await page.getByRole('button', { name: /Create project/i }).click()
    await expect(page).toHaveURL(/projects\/new/)
  })

  test('Dashboard shows "New project" button', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/New project/i)).toBeVisible()
  })

})
