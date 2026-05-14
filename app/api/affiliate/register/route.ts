import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function generateCode(email: string): string {
  const prefix = email.split('@')[0]
  return prefix.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10)
}

function generateFallbackCode(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 10)
}

export async function POST(_request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Check if already registered
  const { data: existing } = await admin
    .from('affiliates')
    .select('id, affiliate_code')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'already_registered', ref_code: existing.affiliate_code },
      { status: 409 }
    )
  }

  let code = generateCode(user.email ?? user.id)

  // Check uniqueness
  const { data: taken } = await admin
    .from('affiliates')
    .select('id')
    .eq('affiliate_code', code)
    .maybeSingle()

  if (taken) {
    code = code.slice(0, 7) + Math.floor(100 + Math.random() * 900)
  }

  const { error } = await admin
    .from('affiliates')
    .insert({ user_id: user.id, affiliate_code: code })

  if (error) {
    console.error('[affiliate/register] insert error:', error.code, error.message)

    if (error.code === '23505') {
      const fallback = generateFallbackCode(user.id)
      const { error: e2 } = await admin
        .from('affiliates')
        .insert({ user_id: user.id, affiliate_code: fallback })
      if (e2) {
        return NextResponse.json({ error: 'registration_failed', detail: e2.message }, { status: 500 })
      }
      return NextResponse.json({ ref_code: fallback }, { status: 201 })
    }

    return NextResponse.json({ error: 'registration_failed', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ ref_code: code }, { status: 201 })
}
