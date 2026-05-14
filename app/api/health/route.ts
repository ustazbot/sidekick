import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabase_url_set:      !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon_set:     !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service_role_set:      !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    toyyibpay_secret_set:  !!process.env.TOYYIBPAY_USER_SECRET_KEY,
    toyyibpay_cat_set:     !!process.env.TOYYIBPAY_CATEGORY_CODE,
    app_url:               process.env.NEXT_PUBLIC_APP_URL ?? 'NOT SET',
    node_env:              process.env.NODE_ENV,
  })
}
