import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000 // 2 hours

function verifyToken(email: string, token: string, ts: string): boolean {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!secret || !token || !ts) return false

  const age = Date.now() - Number(ts)
  if (isNaN(age) || age < 0 || age > TOKEN_TTL_MS) return false

  const expected = createHmac('sha256', secret).update(`${email}:${ts}`).digest('hex')
  try {
    const eBuf = Buffer.from(expected, 'hex')
    const tBuf = Buffer.from(token.padEnd(expected.length, '0').slice(0, expected.length * 2), 'hex')
    return eBuf.length === tBuf.length && timingSafeEqual(eBuf, tBuf)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string; token?: string; ts?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email    = (body.email    ?? '').trim().toLowerCase()
  const password = (body.password ?? '')
  const token    = (body.token    ?? '')
  const ts       = (body.ts       ?? '')

  if (!email || password.length < 8) {
    return NextResponse.json(
      { error: 'email dan password (min 8 aksara) diperlukan' },
      { status: 400 }
    )
  }

  if (!verifyToken(email, token, ts)) {
    return NextResponse.json({ error: 'token_tidak_sah_atau_tamat' }, { status: 401 })
  }

  const adminSupabase = createAdminClient()

  const { data: user } = await adminSupabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (!user) {
    return NextResponse.json({ error: 'akaun tidak dijumpai' }, { status: 404 })
  }

  const { error } = await adminSupabase.auth.admin.updateUserById(user.id, { password })

  if (error) {
    console.error('[set-password] updateUserById failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
