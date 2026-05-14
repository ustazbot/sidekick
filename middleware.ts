import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'planetrizq@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase())

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = await createClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const loginUrl = new URL('/login', request.url)

  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(loginUrl)
    if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) && !user) {
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
