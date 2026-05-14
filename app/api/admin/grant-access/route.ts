import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'planetrizq@gmail.com')
  .split(',').map(e => e.trim().toLowerCase())

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { user_id: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { user_id } = body
  if (!user_id) return NextResponse.json({ error: 'user_id_required' }, { status: 400 })

  const admin = createAdminClient()

  // Check if already has active access
  const { data: existing } = await admin
    .from('purchases')
    .select('id')
    .eq('user_id', user_id)
    .eq('status', 'success')
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ already_active: true })
  }

  // Ensure user row exists in public users table before inserting purchase
  // (FK constraint: purchases.user_id references users.id)
  const { data: authUser } = await admin.auth.admin.getUserById(user_id)
  const userEmail = authUser?.user?.email ?? ''

  if (authUser?.user) {
    await admin.from('users').upsert(
      { id: user_id, email: userEmail },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }

  const { error } = await admin.from('purchases').insert({
    user_id,
    email: userEmail,
    amount: 0,
    status: 'success',
    payment_ref: `admin-grant-${Date.now()}`,
  })

  if (error) {
    console.error('[admin/grant-access] error:', error.code, error.message)
    return NextResponse.json({ error: 'grant_failed', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
