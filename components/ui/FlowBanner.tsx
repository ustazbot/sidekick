'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  { num: 1, lines: ['Pilih niche', '& modul'],     tag: 'Browse'   },
  { num: 2, lines: ['Isi form &', 'Jana Prompt'],  tag: 'Generate' },
  { num: 3, lines: ['Salin atau', 'Muat Turun'],   tag: 'Download' },
  { num: 4, lines: ['Paste',      'ke AI'],        tag: 'GPT · Claude & more' },
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
      className="relative rounded-[18px] mb-[18px] overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #141820 0%, #1A1F2C 100%)',
        border: '1px solid rgba(245,193,0,0.13)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Gold shimmer along top edge */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(245,193,0,0.45) 35%, rgba(245,193,0,0.45) 65%, transparent 100%)',
        }}
      />

      <div style={{ padding: '13px 16px 15px' }}>

        {/* ── Header ─────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              aria-hidden="true"
              style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#F5C100',
                boxShadow: '0 0 7px rgba(245,193,0,0.9)',
              }}
            />
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.9px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.38)',
              fontFamily: 'inherit',
            }}>
              Cara Guna SIDEKICK
            </span>
          </div>
          <button
            onClick={dismiss}
            aria-label="Tutup panduan"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
              color: 'rgba(255,255,255,0.22)', fontSize: 11, lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Steps row ──────────────────────────── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>

          {/* Timeline connector line */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 11,               /* half of 22px badge */
              left: '11%',           /* center of first badge */
              right: '11%',          /* center of last badge */
              height: 1,
              background:
                'linear-gradient(90deg, #F5C100 0%, rgba(245,193,0,0.5) 50%, rgba(245,193,0,0.12) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Arrow ticks on the line */}
          {[33, 66].map(pct => (
            <div
              key={pct}
              aria-hidden="true"
              style={{
                position: 'absolute', top: 7,
                left: `${pct}%`, transform: 'translateX(-50%)',
                fontSize: 9, lineHeight: 1,
                color: 'rgba(245,193,0,0.45)',
                pointerEvents: 'none',
              }}
            >
              ›
            </div>
          ))}

          {STEPS.map((step, i) => (
            <div
              key={step.num}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 5, textAlign: 'center',
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  position: 'relative', zIndex: 1,
                  width: 22, height: 22, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                  background: i === 0
                    ? '#F5C100'
                    : 'rgba(245,193,0,0.09)',
                  border: i === 0
                    ? 'none'
                    : '1px solid rgba(245,193,0,0.28)',
                  color: i === 0 ? '#0C1117' : 'rgba(245,193,0,0.85)',
                  boxShadow: i === 0 ? '0 0 10px rgba(245,193,0,0.5)' : 'none',
                }}
              >
                {step.num}
              </div>

              {/* Label */}
              <div style={{ minHeight: 26 }}>
                {step.lines.map((line, li) => (
                  <div
                    key={li}
                    style={{
                      fontSize: 9.5, fontWeight: 500,
                      color: 'rgba(255,255,255,0.72)',
                      lineHeight: 1.35,
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Context tag */}
              <div
                style={{
                  fontSize: 7.5, fontWeight: 600,
                  color: 'rgba(245,193,0,0.85)',
                  background: 'rgba(245,193,0,0.08)',
                  border: '1px solid rgba(245,193,0,0.18)',
                  borderRadius: 4,
                  padding: '2px 5px',
                  letterSpacing: '0.2px',
                  lineHeight: 1.4,
                  wordBreak: 'break-word' as const,
                }}
              >
                {step.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
