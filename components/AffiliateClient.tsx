'use client'

import { useState } from 'react'

type AffiliateData = { ref_code: string; is_active: boolean; created_at: string } | null

type Props = {
  affiliate: AffiliateData
  refUrl: string | null
}

export default function AffiliateClient({ affiliate, refUrl }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [registeredRef, setRegisteredRef] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const displayAffiliate = affiliate ?? (registeredRef ? { ref_code: registeredRef, is_active: false } : null)
  const displayUrl = refUrl ?? (registeredRef ? `https://sidekick.my/ref/${registeredRef}` : null)

  async function handleRegister() {
    setStatus('loading')
    const res = await fetch('/api/affiliate/register', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setRegisteredRef(data.ref_code)
      setStatus('done')
    } else {
      setStatus('error')
    }
  }

  async function copyRefUrl() {
    if (!displayUrl) return
    await navigator.clipboard.writeText(displayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-[15px] pt-[18px] pb-[108px]">
      <h1 className="font-syne text-[20px] font-bold tracking-[-0.4px] mb-1">Program Affiliate</h1>
      <p className="text-[12px] mb-[18px]" style={{ color: 'var(--text-3)' }}>
        Komisyen 40% setiap sale yang berjaya
      </p>

      {displayAffiliate ? (
        <div className="space-y-3">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-3)' }}>Link Affiliate Anda</p>
            <p className="text-sm font-mono break-all text-text mb-3">{displayUrl}</p>
            <button
              onClick={copyRefUrl}
              className="w-full rounded-xl py-[11px] text-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }}
            >
              {copied ? '✓ Disalin!' : '📋 Salin Link'}
            </button>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.6px] mb-3" style={{ color: 'var(--text-3)' }}>
              Statistik
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ label: 'Klik', value: '—' }, { label: 'Sales', value: '—' }, { label: 'Komisyen', value: 'RM—' }].map((stat) => (
                <div key={stat.label} className="rounded-xl py-3" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
                  <p className="font-syne font-bold text-base" style={{ color: 'var(--accent)' }}>{stat.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <p className="text-2xl mb-3">◈</p>
          <p className="font-syne font-bold text-base mb-1">Jadi Affiliate SIDEKICK</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>
            Kongsi link anda dan dapat 40% komisyen untuk setiap sale.
          </p>
          {status === 'error' && (
            <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>Ralat mendaftar. Cuba lagi.</p>
          )}
          <button
            onClick={handleRegister}
            disabled={status === 'loading'}
            className="w-full rounded-xl py-[14px] text-sm font-bold font-syne disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }}
          >
            {status === 'loading' ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </div>
      )}
    </div>
  )
}
