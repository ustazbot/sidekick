'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/dashboard',           label: 'Vault',     icon: '⊞' },
  { href: '/dashboard/search',    label: 'Cari',      icon: '⌕' },
  { href: '/dashboard/affiliate', label: 'Affiliate', icon: '◈' },
  { href: '/dashboard/profile',   label: 'Profil',    icon: '◎' },
]

export default function SidebarNav({ initials }: { initials: string }) {
  const pathname = usePathname()

  return (
    <>
      <nav className="flex-1 px-3 flex flex-col gap-[2px]">
        {TABS.map(tab => {
          const active =
            tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center gap-3 px-4 py-[11px] rounded-[12px] text-[14px] font-medium transition-all"
              style={{
                color:      active ? 'var(--accent-neon)'         : 'rgba(255,255,255,0.52)',
                background: active ? 'var(--accent-neon-light)'   : 'transparent',
              }}
            >
              <span className="text-base leading-none" aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      <div
        className="px-3 pb-8 pt-3 mt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-[10px] rounded-[12px] transition-all"
          style={{ color: 'rgba(255,255,255,0.52)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ background: 'rgba(0,255,136,0.12)', color: 'var(--accent-neon)' }}
          >
            {initials}
          </div>
          <span className="text-[14px] font-medium">Akaun Saya</span>
        </Link>
      </div>
    </>
  )
}
