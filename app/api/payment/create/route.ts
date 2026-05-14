import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TOYYIBPAY_URL = 'https://toyyibpay.com'
const PRICE_CENTS   = 7500  // RM75.00

export async function POST(request: Request) {
  let body: { name?: string; email?: string; phone?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const name  = (body.name  ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const phone = (body.phone ?? '').trim()

  if (!name || !email || !phone) {
    return NextResponse.json({ error: 'name, email, dan phone wajib diisi' }, { status: 400 })
  }

  const secretKey    = process.env.TOYYIBPAY_USER_SECRET_KEY ?? ''
  const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE  ?? ''
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL       ?? 'http://localhost:3000'

  if (!secretKey || !categoryCode) {
    console.error('[payment/create] ToyyibPay env vars missing')
    return NextResponse.json({ error: 'payment_config_error' }, { status: 500 })
  }

  // Create Supabase auth account now so user can set password on success page
  const adminSupabase = createAdminClient()

  const { data: existingUser } = await adminSupabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!existingUser) {
    const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      email_confirm: true,
    })
    if (createError) {
      console.error('[payment/create] createUser failed:', createError.message)
    } else if (newUser?.user) {
      await adminSupabase.from('users').insert({
        id: newUser.user.id,
        email,
        onboarded: false,
      })
    }
  }

  const params = new URLSearchParams({
    userSecretKey:           secretKey,
    categoryCode:            categoryCode,
    billName:                'SIDEKICK Vault',
    billDescription:         '74 Prompt AI untuk Seller Malaysia – Akses Seumur Hidup',
    billPriceSetting:        '1',
    billPayorInfo:           '1',
    billAmount:              String(PRICE_CENTS),
    billReturnUrl:           `${appUrl}/payment/success?email=${encodeURIComponent(email)}`,
    billCallbackUrl:         `${appUrl}/api/webhook/toyyibpay`,
    billExternalReferenceNo: email,
    billTo:                  name,
    billEmail:               email,
    billPhone:               phone,
    billSplitPayment:        '0',
    billSplitPaymentArgs:    '',
    billPaymentChannel:      '0',
    billContentEmail:        'Terima kasih kerana membeli SIDEKICK!',
    billChargeToCustomer:    '1',
  })

  let billCode: string
  try {
    const res = await fetch(`${TOYYIBPAY_URL}/index.php/api/createBill`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    })

    if (!res.ok) {
      console.error('[payment/create] ToyyibPay HTTP error:', res.status)
      return NextResponse.json({ error: 'toyyibpay_unavailable' }, { status: 502 })
    }

    const json = await res.json()

    if (!Array.isArray(json) || !json[0]?.BillCode) {
      console.error('[payment/create] unexpected ToyyibPay response:', JSON.stringify(json))
      return NextResponse.json({ error: json[0]?.Error ?? 'bill_creation_failed' }, { status: 502 })
    }

    billCode = json[0].BillCode
  } catch (err) {
    console.error('[payment/create] fetch error:', err)
    return NextResponse.json({ error: 'network_error' }, { status: 502 })
  }

  return NextResponse.json({ redirectUrl: `${TOYYIBPAY_URL}/${billCode}` })
}
