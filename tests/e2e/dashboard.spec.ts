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

  test('Seed project appears in own projects list', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(`a[href="/projects/${projectId}"]`)).toBeVisible()
  })

  test('Dashboard shows Open Projects stat', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Open Projects')).toBeVisible()
  })

  // skipped: analytics feature not yet deployed to Vercel; re-enable after first push
  test.skip('Dashboard shows CREATOR ANALYTICS section heading', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('CREATOR ANALYTICS')).toBeVisible()
  })

  test.skip('Dashboard shows Total Applications analytics chip', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Total Applications')).toBeVisible()
  })

  test.skip('Dashboard analytics project table links to project detail', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // The analytics table contains a link to the seed project
    const analyticsLink = page.locator(
      `.mt-6 a[href="/projects/${projectId}"]`
    ).first()
    await expect(analyticsLink).toBeVisible()
  })
})
