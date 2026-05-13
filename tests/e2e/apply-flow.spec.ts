import { test, expect } from '@playwright/test'

test.describe('Apply Flow (User B as Applicant)', () => {
  // This spec runs in chromium-user-b project (User B session)

  test('Apply page loads for User B', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/apply`)
    await page.waitForLoadState('networkidle')
    await expect(page).not.toHaveURL(/login/)
    await expect(page).not.toHaveURL(/\/projects\/[^/]+$/)
  })

  test('Apply form shows motivation textarea', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/apply`)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('textbox').first()).toBeVisible()
  })

  test('Submit button is disabled with fewer than 30 characters', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/apply`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox').first().fill('Too short')
    await expect(page.getByRole('button', { name: /submit application/i })).toBeDisabled()
  })

  test('Submit button enables with 30+ character message', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/apply`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox').first().fill('This is a sufficiently long motivation message for the application.')
    await expect(page.getByRole('button', { name: /submit application/i })).toBeEnabled()
  })
})

test.describe('Project Detail (User B perspective)', () => {
  test('User B sees apply button on open project', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator(`a[href="/projects/${projectId}/apply"]`)
    ).toBeVisible()
  })

  test('User B sees project title on detail page', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}`)
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByRole('heading', { name: '[E2E Test] Playwright Test Project' })
    ).toBeVisible()
  })
})

test.describe('Applications Management (User B viewing — no access)', () => {
  test('User B is redirected away from applications page', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await page.goto(`/projects/${projectId}/applications`)
    await page.waitForLoadState('networkidle')
    // Non-creator gets redirected to project detail
    await expect(page).not.toHaveURL(/\/applications/)
  })
})
