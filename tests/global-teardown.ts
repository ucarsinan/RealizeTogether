import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.test' })

async function globalTeardown() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  if (process.env.TEST_APPLICATION_ID) {
    await supabase
      .from('project_applications')
      .delete()
      .eq('id', process.env.TEST_APPLICATION_ID)
  }

  if (process.env.TEST_PROJECT_ID) {
    await supabase
      .from('projects')
      .delete()
      .eq('id', process.env.TEST_PROJECT_ID)
  }
}

export default globalTeardown
