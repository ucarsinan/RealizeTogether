import { test, expect } from '@playwright/test'

test.describe('Security Headers', () => {
  test('X-Frame-Options is set to DENY', async ({ request }) => {
    const response = await request.get('/')
    expect(response.headers()['x-frame-options']).toBe('DENY')
  })

  test('X-Content-Type-Options is set to nosniff', async ({ request }) => {
    const response = await request.get('/')
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
  })

  test('Referrer-Policy is set', async ({ request }) => {
    const response = await request.get('/')
    expect(response.headers()['referrer-policy']).toBeTruthy()
  })

  test('404 page renders correctly', async ({ page }) => {
    // Login first — middleware redirects unauthenticated users to /login
    // before Next.js can render the 404 page
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(process.env.TEST_USER_A_EMAIL!)
    await page.locator('input[type="password"]').fill(process.env.TEST_USER_A_PASSWORD!)
    await page.getByRole('button', { name: /Log in/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    await page.goto('/diese-seite-existiert-nicht-12345')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText(/page not found/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /browse projects/i })).toBeVisible()
  })
})
