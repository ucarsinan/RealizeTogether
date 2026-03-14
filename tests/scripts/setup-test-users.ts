import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env.test' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Add SUPABASE_SERVICE_ROLE_KEY to .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setupTestUsers() {
  const users = [
    { email: 'test-user-a@realize-together.dev', password: 'TestPassword123!' },
    { email: 'test-user-b@realize-together.dev', password: 'TestPassword123!' },
  ]

  for (const user of users) {
    const { error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    })
    if (error && error.message !== 'A user with this email address has already been registered') {
      console.error(`❌ ${user.email}:`, error.message)
    } else {
      console.log(`✅ ${user.email} — bereit`)
    }
  }
}

setupTestUsers()
