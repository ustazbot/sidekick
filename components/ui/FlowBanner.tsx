'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  { icon: '⊞', num: '01', label: 'Pilih Modul' },
  { icon: '↓', num: '02', label: 'Muat Turun' },
  { icon: '✦', num: '03', label: 'Guna dengan AI' },
]

const STORAGE_KEY = 'sidekick_banner_dismissed'

export default function FlowBanner() {
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    setDismissed(!!localStorage.getItem(STORAGE_KEY))
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  if (dismissed === null || dismissed) return null

  return (
    <div
      className="relative flex items-center rounded-xl mb-[18px] px-4 py-[14px]"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <button
        onClick={dismiss}
        aria-label="Tutup panduan"
        className="absolute top-2 right-2 text-sm leading-none px-1"
        style={{ color: 'var(--text-3)' }}
      >
        ✕
      </button>

      {STEPS.map((step, i) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-[6px] flex-1 text-center">
            <div
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base"
              style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}
            >
              <span aria-hidden="true">{step.icon}</span>
            </div>
            <span className="text-[9px] font-bold font-syne tracking-[0.5px] uppercase" style={{ color: 'var(--accent)' }}>
              {step.num}
            </span>
            <span className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-2)' }}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span aria-hidden="true" className="text-sm pb-3 flex-shrink-0 px-1" style={{ color: 'var(--text-3)' }}>›</span>
          )}
        </div>
      ))}
    </div>
  )
}
