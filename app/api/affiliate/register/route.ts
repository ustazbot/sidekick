import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function generateRefCode(email: string): string {
  const prefix = email.split('@')[0]
  return prefix.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10)
}

export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: existing } = await supabase
    .from('affiliates')
    .select('id, ref_code')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'already_registered', ref_code: existing.ref_code }, { status: 409 })
  }

  const ref_code = generateRefCode(user.email ?? user.id)

  const { error } = await supabase
    .from('affiliates')
    .insert({ user_id: user.id, ref_code })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'ref_code_conflict' }, { status: 409 })
    }
    return NextResponse.json({ error: 'registration_failed' }, { status: 500 })
  }

  return NextResponse.json({ ref_code }, { status: 201 })
}
