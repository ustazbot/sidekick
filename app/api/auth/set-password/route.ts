import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email    = (body.email    ?? '').trim().toLowerCase()
  const password = (body.password ?? '')

  if (!email || password.length < 8) {
    return NextResponse.json(
      { error: 'email dan password (min 8 aksara) diperlukan' },
      { status: 400 }
    )
  }

  const adminSupabase = createAdminClient()

  const { data: user } = await adminSupabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!user) {
    return NextResponse.json({ error: 'akaun tidak dijumpai' }, { status: 404 })
  }

  const { error } = await adminSupabase.auth.admin.updateUserById(user.id, { password })

  if (error) {
    console.error('[set-password] updateUserById failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
