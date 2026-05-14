import { NextResponse } from 'next/server'

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY     ?? ''
  const tpy  = process.env.TOYYIBPAY_USER_SECRET_KEY     ?? ''
  const app  = process.env.NEXT_PUBLIC_APP_URL           ?? ''

  return NextResponse.json({
    supabase_url:        url  ? `SET (${url.length} chars, starts: ${url.slice(0, 20)})` : 'MISSING',
    supabase_anon_key:   anon ? `SET (${anon.length} chars)`                             : 'MISSING',
    service_role_key:    svc  ? `SET (${svc.length} chars)`                              : 'MISSING',
    toyyibpay_secret:    tpy  ? `SET (${tpy.length} chars)`                              : 'MISSING',
    app_url:             app  || 'MISSING',
    node_env:            process.env.NODE_ENV,
  })
}
