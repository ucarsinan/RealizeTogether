import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  // chromium-auth project provides User A session via storageState

  test('Dashboard has link to create a new project', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('link', { name: /new project/i }).or(
      page.locator('a[href="/projects/new"]')
    ).first()).toBeVisible()
  })

  test('Dashboard has navigation to profile edit', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('a[href="/dashboard/profile"]').first()).toBeVisible()
  })

  test('Profile edit page loads with form fields', async ({ page }) => {
    await page.goto('/dashboard/profile')
    await expect(page.locator('#full_name')).toBeVisible()
    await expect(page.locator('#bio')).toBeVisible()
  })

  test('Profile full_name field is editable', async ({ page }) => {
    await page.goto('/dashboard/profile')
    const nameInput = page.locator('#full_name')
    await nameInput.clear()
    await nameInput.fill('E2E Test Name')
    await expect(nameInput).toHaveValue('E2E Test Name')
  })
})
