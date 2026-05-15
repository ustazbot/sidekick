'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function VaultIcon({ active }: { active: boolean }) {
  const c = active ? '#0C1117' : '#5A5A6E'
  return (
    <svg viewBox="0 0 20 20" width="19" height="19" fill="none" aria-hidden="true">
      <rect x="2"    y="2"    width="6.5" height="6.5" rx="1.8" fill={c} />
      <rect x="11.5" y="2"    width="6.5" height="6.5" rx="1.8" fill={c} />
      <rect x="2"    y="11.5" width="6.5" height="6.5" rx="1.8" fill={c} />
      <rect x="11.5" y="11.5" width="6.5" height="6.5" rx="1.8" fill={c} opacity="0.45" />
    </svg>
  )
}

function SearchIcon({ active }: { active: boolean }) {
  const c = active ? '#0C1117' : '#5A5A6E'
  return (
    <svg viewBox="0 0 20 20" width="19" height="19" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5" />
      <path d="M13 13L17.2 17.2" />
    </svg>
  )
}

function AffiliateIcon({ active }: { active: boolean }) {
  const c = active ? '#0C1117' : '#5A5A6E'
  return (
    <svg viewBox="0 0 20 20" width="19" height="19" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="4.5"  cy="10"   r="2.5" />
      <circle cx="15.5" cy="4.5"  r="2.5" />
      <circle cx="15.5" cy="15.5" r="2.5" />
      <path d="M6.8 9L13.2 6M6.8 11L13.2 14" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? '#0C1117' : '#5A5A6E'
  return (
    <svg viewBox="0 0 20 20" width="19" height="19" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3" />
      <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7" />
    </svg>
  )
}

const TABS = [
  { href: '/dashboard',           label: 'Vault',     Icon: VaultIcon     },
  { href: '/dashboard/search',    label: 'Cari',      Icon: SearchIcon    },
  { href: '/dashboard/affiliate', label: 'Affiliate', Icon: AffiliateIcon },
  { href: '/dashboard/profile',   label: 'Profil',    Icon: ProfileIcon   },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{
        background: '#161616',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '8px 12px 28px',
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
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                textDecoration: 'none',
              }}
            >
              {/* Icon pill */}
              <div
                style={{
                  width: 50, height: 28, borderRadius: 14,
                  background: active ? '#F5C100' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.18s ease',
                }}
              >
                <tab.Icon active={active} />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#F5C100' : '#5A5A6E',
                  letterSpacing: '0.15px',
                  transition: 'color 0.18s ease',
                }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
