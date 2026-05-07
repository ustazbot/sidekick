'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/dashboard', label: 'Vault', icon: '⊞' },
  { href: '/dashboard/search', label: 'Cari', icon: '⌕' },
  { href: '/dashboard/affiliate', label: 'Affiliate', icon: '◈' },
  { href: '/dashboard/profile', label: 'Profil', icon: '◎' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex justify-around px-2 pt-2 pb-6 z-50"
      style={{
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.05)',
      }}
    >
      {TABS.map((tab) => {
        const active =
          tab.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className="flex flex-col items-center gap-1 px-5 py-1 rounded-md"
          >
            <span
              aria-hidden="true"
              className="text-lg leading-none"
              style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}
            >
              {tab.icon}
            </span>
            <span
              className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}
              style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
