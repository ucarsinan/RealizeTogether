import { chromium, FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.test' })

async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch()
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000'

  // Authenticate User A
  const pageA = await browser.newPage()
  await pageA.goto(`${baseURL}/login`)
  await pageA.locator('input[type="email"]').fill(process.env.TEST_USER_A_EMAIL!)
  await pageA.locator('input[type="password"]').fill(process.env.TEST_USER_A_PASSWORD!)
  await pageA.getByRole('button', { name: /Log in/i }).click()
  await pageA.waitForURL('**/dashboard', { timeout: 10000 })
  await pageA.context().storageState({ path: 'tests/.auth/user-a.json' })
  await pageA.close()

  // Authenticate User B
  const pageB = await browser.newPage()
  await pageB.goto(`${baseURL}/login`)
  await pageB.locator('input[type="email"]').fill(process.env.TEST_USER_B_EMAIL!)
  await pageB.locator('input[type="password"]').fill(process.env.TEST_USER_B_PASSWORD!)
  await pageB.getByRole('button', { name: /Log in/i }).click()
  await pageB.waitForURL('**/dashboard', { timeout: 10000 })
  await pageB.context().storageState({ path: 'tests/.auth/user-b.json' })
  await pageB.close()

  await browser.close()

  // Supabase Admin Client — Seed-Daten anlegen
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // User A ID aus Auth ermitteln
  const { data: userListData } = await supabase.auth.admin.listUsers()
  const userA = userListData?.users?.find(
    (u) => u.email === process.env.TEST_USER_A_EMAIL,
  )
  const userAId = userA?.id
  if (!userAId) throw new Error('Could not find User A in Supabase Auth')

  // Testprojekt anlegen (User A als Creator)
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      title: '[E2E Test] Playwright Test Project',
      description: 'Automatisch angelegtes Testprojekt — wird nach dem Run gelöscht.',
      stage: 'idea',
      commitment_type: 'hobby',
      collab_type: 'passion',
      status: 'open',
      creator_id: userAId,
    })
    .select('id')
    .single()

  if (projectError || !project) throw new Error(`Seed project failed: ${projectError?.message}`)
  process.env.TEST_PROJECT_ID = project.id

  // Bewerbung anlegen (User B → Testprojekt)
  const { data: application, error: appError } = await supabase
    .from('project_applications')
    .insert({
      project_id: project.id,
      applicant_id: process.env.TEST_USER_B_ID!,
      message: 'E2E Testbewerbung — automatisch angelegt und wird nach dem Run gelöscht.',
      status: 'pending',
      role_id: null,
    })
    .select('id')
    .single()

  if (appError || !application) throw new Error(`Seed application failed: ${appError?.message}`)
  process.env.TEST_APPLICATION_ID = application.id
}

export default globalSetup
