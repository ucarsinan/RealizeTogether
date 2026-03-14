import { test, expect } from '@playwright/test'

test.describe('Explore', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(process.env.TEST_USER_A_EMAIL!)
    await page.locator('input[type="password"]').fill(process.env.TEST_USER_A_PASSWORD!)
    await page.getByRole('button', { name: /Log in/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test('Explore page loads with filter controls', async ({ page }) => {
    await page.goto('/explore')
    await expect(page.getByText(/Find your next project/i)).toBeVisible()
    // SegmentedControl labels — scoped to the filter section
    await expect(page.getByText('All Stages')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Any' })).toBeVisible()
  })

  test('Stage filter changes URL params', async ({ page }) => {
    await page.goto('/explore')
    await page.getByRole('button', { name: 'Idea' }).click()
    await expect(page).toHaveURL(/stage=idea/)
  })

  test('Project cards are visible when projects exist', async ({ page }) => {
    await page.goto('/explore')
    const hasCards = await page.locator('[data-testid="project-card"]').count()
    const hasEmpty = await page.getByText(/No projects found/i).isVisible().catch(() => false)
    expect(hasCards > 0 || hasEmpty).toBeTruthy()
  })

})
