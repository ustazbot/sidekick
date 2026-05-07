'use client'

import { useState } from 'react'
import type { VaultFile } from '@/types'

type Platform = 'chatgpt' | 'claude' | 'gemini'

const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
  { id: 'claude', label: 'Claude', icon: '✦' },
  { id: 'gemini', label: 'Gemini', icon: '♊' },
]

const AI_URLS: Record<Platform, string> = {
  chatgpt: 'https://chat.openai.com/?q=',
  claude: 'https://claude.ai/new?q=',
  gemini: 'https://gemini.google.com/app?q=',
}

type Props = {
  file: VaultFile
  isOpen: boolean
  onClose: () => void
}

export default function PromptModal({ file, isOpen, onClose }: Props) {
  const [platform, setPlatform] = useState<Platform>('chatgpt')
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  async function handleSendToAI() {
    setSending(true)
    try {
      const res = await fetch(`/${file.filepath}`)
      const text = await res.text()
      window.open(AI_URLS[platform] + encodeURIComponent(text), '_blank')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-[200] flex items-end"
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] mx-auto rounded-t-[24px] overflow-y-auto"
        style={{
          background: 'rgba(246,246,250,0.97)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.95)',
          borderBottom: 'none',
          maxHeight: '88vh',
          boxShadow: '0 -6px 32px rgba(0,0,0,0.10)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-[34px] h-[4px] bg-black/10 rounded-sm mx-auto mt-3 mb-4" />

        {/* Header */}
        <div className="px-[18px] pb-[14px]" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <p className="text-[9px] font-bold font-syne tracking-[1.2px] uppercase mb-[5px]" style={{ color: 'var(--accent)' }}>
            {file.module}
          </p>
          <h2 className="font-syne text-[17px] font-bold tracking-[-0.3px] leading-snug text-text mb-[3px]">
            {file.niche}
          </h2>
          <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
            {file.module_desc}
          </p>
        </div>

        {/* Body */}
        <div className="p-[18px] space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-[6px]">
            {file.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-[3px] rounded-full"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Platform picker */}
          <div>
            <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-2)' }}>
              Hantar ke AI
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className="rounded-xl py-[10px] px-[6px] text-center transition-all"
                  style={{
                    background: platform === p.id ? 'var(--accent-light)' : '#fff',
                    border: platform === p.id ? '1.5px solid var(--accent)' : '1.5px solid rgba(0,0,0,0.07)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <span className="text-xl block mb-1">{p.icon}</span>
                  <span className="text-[11px] font-medium" style={{ color: platform === p.id ? 'var(--accent)' : 'var(--text-2)' }}>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(0,0,0,0.05)' }} />

          {/* Download link */}
          <a
            href={`/${file.filepath}`}
            download={file.filename}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-[14px] text-sm font-bold font-syne"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }}
          >
            📥 Muat Turun Prompt
          </a>

          {/* Send to AI button */}
          <button
            onClick={handleSendToAI}
            disabled={sending}
            className="w-full rounded-xl py-[11px] text-sm font-medium disabled:opacity-50"
            style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', color: 'var(--text-2)', boxShadow: 'var(--shadow-xs)' }}
          >
            {sending ? 'Membuka...' : `✈️ Buka dalam ${PLATFORMS.find((p) => p.id === platform)?.label}`}
          </button>
        </div>
      </div>
    </div>
  )
}
