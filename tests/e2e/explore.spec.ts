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

  test('Commitment filter changes URL param', async ({ page }) => {
    await page.goto('/explore')
    // Click the first commitment chip that's not "Any"
    // commitmentOptions: Hobby → 'hobby', Side Project → 'side_project', Serious → 'serious', Professional → 'professional'
    await page.getByRole('button', { name: 'Hobby' }).click()
    await expect(page).toHaveURL(/commitment=hobby/)
  })

  test('Multiple filters combine in URL', async ({ page }) => {
    await page.goto('/explore')
    await page.getByRole('button', { name: 'Idea' }).click()
    await expect(page).toHaveURL(/stage=idea/)
    await page.getByRole('button', { name: 'Hobby' }).click()
    await expect(page).toHaveURL(/commitment=hobby/)
    await expect(page).toHaveURL(/stage=idea/)
  })

  test('All Stages button resets stage filter', async ({ page }) => {
    await page.goto('/explore?stage=idea')
    await page.getByRole('button', { name: 'All Stages' }).click()
    await expect(page).not.toHaveURL(/stage=idea/)
  })

  test('Any button resets commitment filter', async ({ page }) => {
    await page.goto('/explore?commitment=hobby')
    await page.getByRole('button', { name: 'Any' }).click()
    await expect(page).not.toHaveURL(/commitment=hobby/)
  })

  test('Role filter input sets URL param after debounce', async ({ page }) => {
    await page.goto('/explore')
    const roleInput = page.getByPlaceholder('Role needed…')
    await expect(roleInput).toBeVisible()
    await roleInput.fill('cinematographer')
    await expect(page).toHaveURL(/role=cinematographer/, { timeout: 2000 })
  })

  test('Role filter is pre-filled from URL', async ({ page }) => {
    await page.goto('/explore?role=director')
    const roleInput = page.getByPlaceholder('Role needed…')
    await expect(roleInput).toHaveValue('director')
  })

  test('Seed project card is visible in explore', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto('/explore')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(`a[href="/projects/${projectId}"]`)).toBeVisible({ timeout: 8000 })
  })

  test('Nonsense role filter shows empty state', async ({ page }) => {
    await page.goto('/explore?role=zzz-no-such-role-xyz')
    await page.waitForLoadState('networkidle')
    await expect(page.getByLabel('No projects found')).toBeVisible({ timeout: 8000 })
  })

})
