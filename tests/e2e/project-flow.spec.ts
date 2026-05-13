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

  test('Submit enables after filling title and description', async ({ page }) => {
    await page.goto('/projects/new')
    await page.locator('#title').fill('My Test Project Title')
    await page.locator('#description').fill('This description is long enough to pass the 20 character minimum validation.')
    await expect(page.getByRole('button', { name: /Create project/i })).toBeEnabled()
  })

  test('Title with fewer than 3 characters keeps submit disabled', async ({ page }) => {
    await page.goto('/projects/new')
    await page.locator('#title').fill('AB')
    await page.locator('#description').fill('This description is long enough to pass validation.')
    await expect(page.getByRole('button', { name: /Create project/i })).toBeDisabled()
  })

  test('Stage selector buttons are visible and clickable', async ({ page }) => {
    await page.goto('/projects/new')
    await expect(page.getByRole('button', { name: 'Idea' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Concept' })).toBeVisible()
    await page.getByRole('button', { name: 'Concept' }).click()
    // Concept button should now be active — verify no error thrown
    await expect(page.getByRole('button', { name: /Create project/i })).toBeVisible()
  })
})
