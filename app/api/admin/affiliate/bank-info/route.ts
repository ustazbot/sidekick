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

  let body: { affiliate_id: string; bank_info: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('affiliates')
    .update({ bank_info: body.bank_info })
    .eq('id', body.affiliate_id)

  if (error) {
    console.error('[admin/affiliate/bank-info] error:', error.message)
    return NextResponse.json({ error: 'save_failed', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
