'use client'

import { useState } from 'react'
import type { VaultFile } from '@/types'
import FlowBanner from '@/components/ui/FlowBanner'
import PromptCard from '@/components/ui/PromptCard'
import PromptModal from '@/components/ui/PromptModal'

const NICHES = [
  { code: 'ALL',      label: 'Semua Niche' },
  { code: 'REN',      label: 'Hartanah / Ejen Hartanah' },
  { code: 'KERETA',   label: 'Automotif / Jualan Kereta' },
  { code: 'PAKAIAN',  label: 'Fesyen / Pakaian' },
  { code: 'SKINCARE', label: 'Skincare / Kecantikan' },
  { code: 'HEALTH',   label: 'Kesihatan / Suplemen' },
  { code: 'FNB',      label: 'Makanan & Minuman' },
  { code: 'EDU',      label: 'Pendidikan / Kursus' },
  { code: 'TAKAFUL',  label: 'Takaful / Insurans' },
  { code: 'TRAVEL',   label: 'Travel / Pelancongan' },
  { code: 'SERVIS',   label: 'Perkhidmatan / Servis' },
]

const MODULES = [
  { id: 'ALL',         label: 'Semua Modul' },
  { id: 'AVATAR',      label: 'Avatar Pelanggan' },
  { id: 'ATTRACT',     label: 'Buat Konten' },
  { id: 'CAPTURE',     label: 'Balas Komen & Lead' },
  { id: 'CONVERT',     label: 'Mesej WhatsApp' },
  { id: 'CLOSE',       label: 'Closing & Follow Up' },
  { id: 'DEFEND',      label: 'Retain & Handle' },
  { id: 'AD-CREATOR',  label: 'Buat Iklan' },
]

type SearchStatus = 'idle' | 'loading' | 'done' | 'error'

type Props = {
  files: VaultFile[]
  userName: string
}

export default function BrowseClient({ files, userName }: Props) {
  const [query,         setQuery]         = useState('')
  const [searchResults, setSearchResults] = useState<VaultFile[] | null>(null)
  const [searchStatus,  setSearchStatus]  = useState<SearchStatus>('idle')
  const [activeNiche,   setActiveNiche]   = useState('ALL')
  const [activeModule,  setActiveModule]  = useState('ALL')
  const [selectedFile,  setSelectedFile]  = useState<VaultFile | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearchStatus('loading')
    try {
      const res = await fetch('/api/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSearchResults(data.files ?? [])
      setSearchStatus('done')
    } catch {
      setSearchStatus('error')
    }
  }

  function clearSearch() {
    setQuery('')
    setSearchResults(null)
    setSearchStatus('idle')
  }

  // Base: search results (if searched) or full list
  const base = searchResults !== null ? searchResults : files

  // Apply niche + module filters on top
  const filtered = base.filter(f => {
    const nicheOk  = activeNiche  === 'ALL' || f.niche_code === activeNiche
    const moduleOk = activeModule === 'ALL' || f.module     === activeModule
    return nicheOk && moduleOk
  })

  const isSearchMode = searchResults !== null

  return (
    <div className="px-[15px] pt-[18px] pb-[108px]">

      {/* Greeting */}
      <div className="mb-[18px]">
        <p className="text-[12px] font-medium mb-[2px]" style={{ color: 'var(--text-3)' }}>
          Selamat datang semula,
        </p>
        <h1 className="font-syne text-[22px] font-bold tracking-[-0.5px]">
          {userName} <em className="not-italic">👋</em>
        </h1>
      </div>

      <FlowBanner />

      {/* ── Search bar ─────────────────────────────── */}
      <form onSubmit={handleSearch} className="relative mb-[14px]">
        <button
          type="submit"
          className="absolute left-[14px] top-1/2 -translate-y-1/2 text-base"
          style={{ color: 'var(--text-3)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 1 }}
          aria-label="Cari"
        >
          ⌕
        </button>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cari prompt… e.g. balas komen negatif"
          className="w-full rounded-[14px] pl-[42px] pr-[44px] py-[12px] text-[13px] outline-none"
          style={{
            background:          'var(--card)',
            border:              '1px solid var(--card-border)',
            boxShadow:           'var(--shadow-xs)',
            color:               'var(--text)',
          }}
        />
        {/* Clear / Submit */}
        {query ? (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            ×
          </button>
        ) : null}
      </form>

      {/* Search status feedback */}
      {searchStatus === 'loading' && (
        <p className="text-center text-[12px] py-2 mb-2" style={{ color: 'var(--text-3)' }}>
          Mencari…
        </p>
      )}
      {searchStatus === 'error' && (
        <p className="text-center text-[12px] py-2 mb-2" style={{ color: 'var(--danger)' }}>
          Ralat semasa mencari. Cuba lagi.
        </p>
      )}

      {/* ── Niche dropdown ─────────────────────────── */}
      <div className="mb-[10px]">
        <label className="text-[10px] font-semibold uppercase tracking-[0.6px] mb-[6px] block pl-[2px]" style={{ color: 'var(--text-3)' }}>
          Niche
        </label>
        <div className="relative">
          <select
            value={activeNiche}
            onChange={e => setActiveNiche(e.target.value)}
            className="w-full rounded-[12px] px-[14px] py-[11px] text-[13px] font-medium appearance-none pr-[36px] outline-none cursor-pointer"
            style={{
              background: 'var(--card)',
              border:     '1px solid var(--card-border)',
              boxShadow:  'var(--shadow-xs)',
              color:      'var(--text)',
            }}
          >
            {NICHES.map(n => (
              <option key={n.code} value={n.code}>{n.label}</option>
            ))}
          </select>
          <span className="absolute right-[13px] top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'var(--text-3)' }}>
            ▾
          </span>
        </div>
      </div>

      {/* ── Module dropdown ────────────────────────── */}
      <div className="mb-[16px]">
        <label className="text-[10px] font-semibold uppercase tracking-[0.6px] mb-[6px] block pl-[2px]" style={{ color: 'var(--text-3)' }}>
          Modul
        </label>
        <div className="relative">
          <select
            value={activeModule}
            onChange={e => setActiveModule(e.target.value)}
            className="w-full rounded-[12px] px-[14px] py-[11px] text-[13px] font-medium appearance-none pr-[36px] outline-none cursor-pointer"
            style={{
              background: 'var(--card)',
              border:     '1px solid var(--card-border)',
              boxShadow:  'var(--shadow-xs)',
              color:      'var(--text)',
            }}
          >
            {MODULES.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <span className="absolute right-[13px] top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'var(--text-3)' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Count */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.6px] mb-[12px] pl-[2px]" style={{ color: 'var(--text-3)' }}>
        {isSearchMode
          ? `${filtered.length} keputusan untuk "${query}"`
          : `${filtered.length} prompt tersedia`}
      </p>

      {/* No results */}
      {filtered.length === 0 && searchStatus !== 'loading' && (
        <p className="text-center text-[13px] py-10" style={{ color: 'var(--text-3)' }}>
          Tiada prompt dijumpai.{' '}
          {isSearchMode && (
            <button onClick={clearSearch} className="underline" style={{ color: 'var(--accent)' }}>
              Semak semula
            </button>
          )}
        </p>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-[10px]">
        {filtered.map((file, idx) => (
          <PromptCard
            key={file.filename}
            file={file}
            featured={idx === 0}
            onClick={() => setSelectedFile(file)}
          />
        ))}
      </div>

      {selectedFile && (
        <PromptModal
          file={selectedFile}
          isOpen={true}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}
