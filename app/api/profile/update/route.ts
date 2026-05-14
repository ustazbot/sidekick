import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_NICHES = ['REN','KERETA','PAKAIAN','SKINCARE','HEALTH','FNB','EDU','TAKAFUL','TRAVEL','SERVIS']

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { full_name?: string; niche?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const updates: Record<string, string> = {}

  if (body.full_name !== undefined) {
    const name = body.full_name.trim()
    if (!name) return NextResponse.json({ error: 'name_empty' }, { status: 400 })
    updates.name = name
  }

  if (body.niche !== undefined) {
    const niche = body.niche.trim().toUpperCase()
    if (!VALID_NICHES.includes(niche)) {
      return NextResponse.json({ error: 'niche_invalid' }, { status: 400 })
    }
    updates.niche = niche
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .upsert(
      { id: user.id, email: user.email ?? '', ...updates },
      { onConflict: 'id' }
    )

  if (error) {
    console.error('[profile/update] error:', error.message)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
