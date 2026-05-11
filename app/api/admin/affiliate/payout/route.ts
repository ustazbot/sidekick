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

  let body: { affiliate_id: string; method?: string; note?: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { affiliate_id, method = 'manual', note = '' } = body
  if (!affiliate_id) return NextResponse.json({ error: 'affiliate_id_required' }, { status: 400 })

  const admin = createAdminClient()

  // Fetch current affiliate record
  const { data: affiliate, error: fetchErr } = await admin
    .from('affiliates')
    .select('id, pending_commission, total_withdrawn, total_commission')
    .eq('id', affiliate_id)
    .maybeSingle()

  if (fetchErr || !affiliate) {
    return NextResponse.json({ error: 'affiliate_not_found' }, { status: 404 })
  }

  const pending = affiliate.pending_commission ?? 0

  if (pending <= 0) {
    return NextResponse.json({ error: 'no_pending', pending }, { status: 400 })
  }

  // Approve payout: move pending_commission → total_withdrawn, reset pending
  const { error: updateErr } = await admin
    .from('affiliates')
    .update({
      pending_commission: 0,
      total_withdrawn: (affiliate.total_withdrawn ?? 0) + pending,
    })
    .eq('id', affiliate_id)

  if (updateErr) {
    console.error('[admin/affiliate/payout] update error:', updateErr.message)
    return NextResponse.json({ error: 'update_failed', detail: updateErr.message }, { status: 500 })
  }

  // Mark related affiliate_conversions as paid
  await admin
    .from('affiliate_conversions')
    .update({ status: 'paid' })
    .eq('affiliate_id', affiliate_id)
    .eq('status', 'approved')

  // Log payout event — kegagalan tidak batalkan payout yang berjaya
  const { error: payoutLogErr } = await admin
    .from('affiliate_payouts')
    .insert({
      affiliate_id,
      amount: pending,
      method,
      note: note || null,
    })

  if (payoutLogErr) {
    console.error('[admin/affiliate/payout] log insert error:', payoutLogErr.message)
  }

  console.log(`[admin/affiliate/payout] approved RM${pending.toFixed(2)} for ${affiliate_id} via ${method}. Note: ${note}`)

  return NextResponse.json({
    success: true,
    amount_paid: pending,
    new_withdrawn: (affiliate.total_withdrawn ?? 0) + pending,
  })
}
