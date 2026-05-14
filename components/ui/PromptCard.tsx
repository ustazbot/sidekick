'use client'

import type { VaultFile } from '@/types'

const MODULE_EMOJI: Record<string, string> = {
  'ATTRACT':    '✍️',
  'CAPTURE':    '💬',
  'CONVERT':    '📱',
  'CLOSE':      '🤝',
  'DEFEND':     '🛡️',
  'AD-CREATOR': '🎨',
  'AVATAR':     '👤',
}

type Props = {
  file: VaultFile
  onClick: () => void
  featured?: boolean
}

export default function PromptCard({ file, onClick, featured = false }: Props) {
  const emoji = MODULE_EMOJI[file.module] ?? '✦'

  if (featured) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-2xl p-[16px] transition-all active:scale-[0.98] flex items-center gap-[14px]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.62))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow)',
          gridColumn: '1 / -1',
        }}
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-[14px] text-[22px]"
          style={{
            width: 46, height: 46,
            background: 'var(--accent-light)',
            border: '1px solid var(--accent-border)',
            boxShadow: '0 2px 8px var(--accent-mid)',
          }}
        >
          {emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span
            className="text-[9px] font-bold tracking-[1.1px] uppercase block mb-[3px]"
            style={{ color: 'var(--gold)' }}
          >
            ⭑ Popular
          </span>
          <span
            className="text-[9px] font-bold tracking-[1px] uppercase block mb-[5px]"
            style={{ color: 'var(--accent)' }}
          >
            {file.module}
          </span>
          <p className="text-[13px] font-semibold leading-snug text-text line-clamp-2">
            {file.niche}
          </p>
        </div>

        <span className="text-[18px] flex-shrink-0" style={{ color: 'var(--text-3)' }}>›</span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-[14px] transition-all active:scale-[0.96]"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Avatar */}
      <div
        className="flex items-center justify-center rounded-[10px] text-[18px] mb-[10px]"
        style={{
          width: 36, height: 36,
          background: 'var(--accent-light)',
          border: '1px solid var(--accent-border)',
        }}
      >
        {emoji}
      </div>

      {/* Module label */}
      <span
        className="text-[9px] font-bold tracking-[1.2px] uppercase block mb-[6px]"
        style={{ color: 'var(--accent)' }}
      >
        {file.module}
      </span>

      {/* Title */}
      <p className="text-[12px] font-semibold leading-snug line-clamp-2 text-text mb-[10px]">
        {file.niche}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold px-[7px] py-[2px] rounded-full"
          style={{
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
          }}
        >
          {file.niche_code}
        </span>
        <span className="text-[14px]" style={{ color: 'var(--text-3)' }}>›</span>
      </div>
    </button>
  )
}
