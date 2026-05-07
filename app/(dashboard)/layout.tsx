import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/ui/BottomNav'
import HelpDesk from '@/components/ui/HelpDesk'

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
    <div className="relative min-h-screen bg-bg">
      {/* Ambient blobs */}
      <div
        aria-hidden="true"
        className="fixed rounded-full pointer-events-none z-0"
        style={{
          width: 320,
          height: 320,
          top: -80,
          right: -80,
          background: 'radial-gradient(circle, rgba(29,158,117,0.10), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed rounded-full pointer-events-none z-0"
        style={{
          width: 260,
          height: 260,
          bottom: 120,
          left: -80,
          background: 'radial-gradient(circle, rgba(29,158,117,0.07), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Sticky header */}
      <header
        className="sticky top-0 z-50 px-[18px] py-[13px] flex items-center justify-between"
        style={{
          background: 'rgba(242,242,247,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <span className="font-syne font-extrabold text-[17px] tracking-[-0.3px] text-text">
          SIDE<span style={{ color: 'var(--accent)' }}>KICK</span>
        </span>
        <div
          className="w-[33px] h-[33px] rounded-full flex items-center justify-center text-[11px] font-bold font-syne"
          style={{
            background: 'var(--accent-light)',
            border: '1.5px solid var(--accent-border)',
            color: 'var(--accent)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {initials}
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <BottomNav />
      <HelpDesk />
    </div>
  )
}
