import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=missing_code`)
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_error`)
  }

  return NextResponse.redirect(`${siteUrl}/dashboard`)
}
