import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { bank_name: string; account_no: string; holder_name: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { bank_name, account_no, holder_name } = body
  if (!bank_name || !account_no || !holder_name) {
    return NextResponse.json({ error: 'all_fields_required' }, { status: 400 })
  }

  const bank_info = `Bank: ${bank_name}\nNo. Akaun: ${account_no.replace(/\s/g, '')}\nNama: ${holder_name.trim()}`

  const admin = createAdminClient()
  const { error } = await admin
    .from('affiliates')
    .update({ bank_info })
    .eq('user_id', user.id)

  if (error) {
    console.error('[affiliate/bank-info] error:', error.message)
    return NextResponse.json({ error: 'save_failed', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, bank_info })
}
