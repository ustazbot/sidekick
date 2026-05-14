import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { niche?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const niche = (body.niche ?? '').trim().toUpperCase()
  const VALID = ['REN','KERETA','PAKAIAN','SKINCARE','HEALTH','FNB','EDU','TAKAFUL','TRAVEL','SERVIS']

  if (!VALID.includes(niche)) {
    return NextResponse.json({ error: 'niche_invalid' }, { status: 400 })
  }

  // Upsert via admin client — bypasses RLS, handles row-not-exist case
  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .upsert(
      { id: user.id, email: user.email ?? '', niche, onboarded: true },
      { onConflict: 'id' }
    )

  if (error) {
    console.error('[onboarding] upsert error:', error.message, error.details)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
