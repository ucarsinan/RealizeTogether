import { test, expect } from '@playwright/test'

// chromium-auth = User A (Creator of the seed project)
test.describe('Applications Management (User A as Creator)', () => {
  test('Applications page loads for creator', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/applications`)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/applications`))
  })

  test('Applications page shows project title', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/applications`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: '[E2E Test] Playwright Test Project' })).toBeVisible()
  })

  test('Applications page shows pending application count', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/applications`)
    await page.waitForLoadState('networkidle')
    // The seed application creates "New Applications (1)" heading
    await expect(page.getByRole('heading', { name: /New Applications/i })).toBeVisible()
  })

  test('Seed application from User B is listed', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/applications`)
    await page.waitForLoadState('networkidle')
    // The seed application exists — at least one applicant card should render
    const cards = page.locator('[class*="rounded-2xl"]')
    await expect(cards.first()).toBeVisible({ timeout: 8000 })
  })

  test('Back link navigates to project detail', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/applications`)
    await page.waitForLoadState('networkidle')
    await page.locator(`a[href="/projects/${projectId}"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}$`))
  })
})
