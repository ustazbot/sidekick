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

  let body: { email: string; password: string; full_name?: string; niche?: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { email, password, full_name, niche } = body
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'email_and_password_required' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'password_too_short' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Create auth user (email pre-confirmed — no verification email needed)
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  })

  if (authErr) {
    const msg = authErr.message.toLowerCase()
    if (msg.includes('already') || msg.includes('duplicate') || msg.includes('exist')) {
      return NextResponse.json({ error: 'email_taken' }, { status: 409 })
    }
    console.error('[admin/add-user] auth error:', authErr.message)
    return NextResponse.json({ error: 'auth_failed', detail: authErr.message }, { status: 500 })
  }

  const newUserId = created.user.id

  // Upsert into users table — must succeed before purchase (FK constraint)
  const userRow: Record<string, string> = { id: newUserId, email: email.trim().toLowerCase() }
  if (full_name?.trim()) userRow.name = full_name.trim()
  if (niche?.trim())     userRow.niche     = niche.trim().toUpperCase()

  const { error: userErr } = await admin
    .from('users')
    .upsert(userRow, { onConflict: 'id' })

  if (userErr) {
    console.error('[admin/add-user] users upsert error:', userErr.message)
    // Try minimal upsert without optional fields
    await admin.from('users').upsert(
      { id: newUserId, email: email.trim().toLowerCase() },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }

  // Grant full access — admin-added users are beta testers
  const { error: purchaseErr } = await admin.from('purchases').insert({
    user_id: newUserId,
    email: email.trim().toLowerCase(),
    amount: 0,
    status: 'success',
    payment_ref: `admin-grant-${Date.now()}`,
  })

  if (purchaseErr) {
    console.error('[admin/add-user] purchase insert error:', purchaseErr.code, purchaseErr.message)
    return NextResponse.json(
      { success: true, user_id: newUserId, warning: 'access_not_granted', detail: purchaseErr.message },
      { status: 201 }
    )
  }

  return NextResponse.json({ success: true, user_id: newUserId }, { status: 201 })
}
