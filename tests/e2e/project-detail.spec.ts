import { test, expect } from '@playwright/test'
import { navigateToProject } from './fixtures'

test.describe('Project Detail', () => {
  // chromium-auth = User A (Creator of the seed project)

  test('Project detail page loads', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await navigateToProject(page, projectId)
    await expect(page.locator('div.min-h-screen').first()).toBeVisible()
  })

  test('Project title is visible', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await navigateToProject(page, projectId)
    await expect(page.getByText('[E2E Test] Playwright Test Project')).toBeVisible()
  })

  test('Stage badge is visible', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await navigateToProject(page, projectId)
    // Stage 'idea' renders as 'Idea' via STAGE_LABELS
    await expect(page.getByText('Idea', { exact: false })).toBeVisible()
  })

  test('Creator sees link to Applications page', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await navigateToProject(page, projectId)
    await expect(
      page.locator(`a[href="/projects/${projectId}/applications"]`)
    ).toBeVisible()
  })
})
