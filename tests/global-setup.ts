import { chromium, FullConfig } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.test' })

async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch()
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000'

  // Authenticate as User A and save session
  const pageA = await browser.newPage()
  await pageA.goto(`${baseURL}/login`)
  await pageA.locator('input[type="email"]').fill(process.env.TEST_USER_A_EMAIL!)
  await pageA.locator('input[type="password"]').fill(process.env.TEST_USER_A_PASSWORD!)
  await pageA.getByRole('button', { name: /Log in/i }).click()
  await pageA.waitForURL('**/dashboard', { timeout: 10000 })
  await pageA.context().storageState({ path: 'tests/.auth/user-a.json' })
  await pageA.close()

  await browser.close()
}

export default globalSetup
