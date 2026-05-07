'use client'

import type { VaultFile } from '@/types'

type Props = {
  file: VaultFile
  onClick: () => void
  featured?: boolean
}

export default function PromptCard({ file, onClick, featured = false }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm)',
        gridColumn: featured ? '1 / -1' : undefined,
      }}
    >
      <span
        className="text-[9px] font-bold font-syne tracking-[1.2px] uppercase block mb-2"
        style={{ color: 'var(--accent)' }}
      >
        {file.module}
      </span>
      <p className="text-sm font-semibold leading-snug mb-1 line-clamp-2 text-text">
        {file.niche}
      </p>
      <p className="text-[11px] mb-3 line-clamp-1" style={{ color: 'var(--text-3)' }}>
        {file.module_desc}
      </p>
      <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
        {file.platforms.join(' • ')}
      </p>
      <div className="flex justify-end mt-2">
        <span className="text-sm" style={{ color: 'var(--text-3)' }}>→</span>
      </div>
    </button>
  )
}
