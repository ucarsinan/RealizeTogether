import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const type = searchParams.get('type')
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`)
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role
      if (user && role) {
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', user.id)
        if (roleError) {
          console.error('[auth/callback] profile role update failed:', roleError.message)
        }
      }
      return NextResponse.redirect(`${origin}/dashboard/profile?new=1`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
