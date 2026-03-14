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
