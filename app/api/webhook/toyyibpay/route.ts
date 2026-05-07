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

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const adminSupabase = createAdminClient()

  const { data: inviteData } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  })

  const userId = inviteData?.user?.id ?? null

  const { error: purchaseError } = await adminSupabase
    .from('purchases')
    .insert({
      user_id: userId,
      email,
      amount: parseFloat(amountStr),
      toyyibpay_ref: billCode,
      status: 'paid',
    })

  if (purchaseError) {
    console.error('[webhook] purchase insert failed:', purchaseError.message)
  }

  return NextResponse.json({ success: true })
}
