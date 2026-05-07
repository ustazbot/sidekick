'use client'

type Props = {
  activeModule: string
  onSelect: (moduleId: string) => void
}

const MODULES = [
  { id: 'ALL', label: 'Semua', sub: '' },
  { id: 'ATTRACT', label: 'Buat Konten', sub: 'Post, caption, hook, reel' },
  { id: 'CAPTURE', label: 'Balas Komen', sub: 'Facebook, Instagram, TikTok' },
  { id: 'CONVERT', label: 'Mesej WhatsApp', sub: 'Follow-up, DM, broadcast' },
  { id: 'CLOSE', label: 'Skrip Closing', sub: 'Convince, close, bayar' },
  { id: 'DEFEND', label: 'Handle Bantahan', sub: 'Mahal, nak fikir, tak berminat' },
  { id: 'AD-CREATOR', label: 'Buat Iklan', sub: 'Gambar, caption, ChatGPT' },
]

export default function ModuleFilter({ activeModule, onSelect }: Props) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.6px] mb-[10px] pl-[2px]"
        style={{ color: 'var(--text-3)' }}
      >
        Modul
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-1 mb-5"
        style={{ scrollbarWidth: 'none' }}
      >
        {MODULES.map((mod) => {
          const active = activeModule === mod.id
          return (
            <button
              key={mod.id}
              onClick={() => onSelect(mod.id)}
              className="flex-shrink-0 rounded-[14px] overflow-hidden"
              style={{
                background: active ? 'var(--accent)' : 'var(--glass)',
                border: active ? '1px solid var(--accent)' : '1px solid var(--glass-border2)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all 0.18s',
              }}
            >
              <div className="px-[14px] py-2">
                <span
                  className="text-[12px] font-semibold whitespace-nowrap block leading-none mb-[2px]"
                  style={{ color: active ? '#fff' : 'var(--text-2)' }}
                >
                  {mod.label}
                </span>
                {mod.sub && (
                  <span
                    className="text-[9px] font-normal whitespace-nowrap block leading-none"
                    style={{ color: active ? 'rgba(255,255,255,0.75)' : 'var(--text-3)' }}
                  >
                    {mod.sub}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
