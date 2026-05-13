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
    await expect(page.getByRole('heading', { name: '[E2E Test] Playwright Test Project' })).toBeVisible()
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

  test('Project description is visible', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await navigateToProject(page, projectId)
    await expect(page.getByRole('heading', { name: 'About the project' })).toBeVisible()
    await expect(page.getByText(/automatisch angelegtes testprojekt/i)).toBeVisible()
  })

  test('Creator does not see own apply button', async ({ page }) => {
    const projectId = process.env.TEST_PROJECT_ID!
    await navigateToProject(page, projectId)
    // Owner should not see the "Apply" CTA
    await expect(
      page.locator(`a[href="/projects/${projectId}/apply"]`)
    ).not.toBeVisible()
  })
})
