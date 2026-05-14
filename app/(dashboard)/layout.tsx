import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/ui/BottomNav'
import SidebarNav from '@/components/ui/SidebarNav'
import HelpDesk from '@/components/ui/HelpDesk'
import Image from 'next/image'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const initials = (user.email ?? 'U').slice(0, 1).toUpperCase()

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Desktop Sidebar (md+) ─────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-[220px] flex-col z-40"
        style={{
          background:   'var(--sidebar)',
          borderRight:  '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="px-5 pt-8 pb-6">
          <Link href="/dashboard">
            <Image
              src="/logo.png"
              alt="SideKick"
              width={120}
              height={48}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>
        <SidebarNav initials={initials} />
      </aside>

      {/* ── Mobile Header ─────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-50 px-[18px] py-[13px] flex items-center justify-center relative"
        style={{
          background:          'rgba(250,249,246,0.90)',
          backdropFilter:      'blur(24px)',
          WebkitBackdropFilter:'blur(24px)',
          borderBottom:        '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Link href="/dashboard">
          <Image
            src="/logo.png"
            alt="SideKick"
            width={140}
            height={56}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
        <Link
          href="/dashboard/profile"
          className="absolute right-[18px] w-[33px] h-[33px] rounded-full flex items-center justify-center text-[11px] font-bold font-syne"
          style={{
            background: 'var(--accent-light)',
            border:     '1.5px solid var(--accent-border)',
            color:      'var(--accent)',
            boxShadow:  'var(--shadow-sm)',
          }}
        >
          {initials}
        </Link>
      </header>

      {/* ── Main content ──────────────────────────── */}
      <main className="relative z-10 md:ml-[220px]">
        {children}
      </main>

      {/* ── Mobile Bottom Nav ─────────────────────── */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      <HelpDesk />
    </div>
  )
}
