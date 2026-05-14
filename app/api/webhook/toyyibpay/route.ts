import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const text = await request.text()
  const params = new URLSearchParams(text)

  const status = params.get('billpaymentStatus')
  const email = params.get('billExternalReferenceNo') ?? ''
  const amountStr = params.get('billpaymentAmount') ?? ''
  const billCode = params.get('billCode') ?? ''

  if (status !== '1') {
    return NextResponse.json({ received: true })
  }

  if (!email || !amountStr) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  // Look up user by email (created during checkout)
  const { data: user } = await adminSupabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  const { error: purchaseError } = await adminSupabase
    .from('purchases')
    .insert({
      user_id: user?.id ?? null,
      email,
      amount: parseFloat(amountStr),
      toyyibpay_ref: billCode,
      status: 'success',
    })

  if (purchaseError) {
    console.error('[webhook] purchase insert failed:', purchaseError.message)
  }

  return NextResponse.json({ success: true })
}
