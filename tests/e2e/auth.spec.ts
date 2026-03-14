import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {

  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Realize Together/)
    await expect(page.getByText(/REALIZE TOGETHER/i).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Join free/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Log in/i }).first()).toBeVisible()
  })

  test('Register page loads and shows form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByPlaceholder(/Full name/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Password/i)).toBeVisible()
  })

  test('Login page loads and shows form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder(/Email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Password/i)).toBeVisible()
  })

  test('Login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/Email/i).fill(process.env.TEST_USER_A_EMAIL!)
    await page.getByPlaceholder(/Password/i).fill(process.env.TEST_USER_A_PASSWORD!)
    await page.getByRole('button', { name: /Log in/i }).click()
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    await expect(page).toHaveURL(/dashboard/)
  })

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder(/Email/i).fill('wrong@example.com')
    await page.getByPlaceholder(/Password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /Log in/i }).click()
    await page.waitForTimeout(2000)
    await expect(page).not.toHaveURL(/dashboard/)
  })

  test('Unauthenticated user is redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login', { timeout: 5000 })
    await expect(page).toHaveURL(/login/)
  })

})
