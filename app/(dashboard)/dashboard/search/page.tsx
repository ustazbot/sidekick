'use client'

import { useState, useRef } from 'react'
import type { VaultFile } from '@/types'
import PromptCard from '@/components/ui/PromptCard'
import PromptModal from '@/components/ui/PromptModal'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VaultFile[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setResults(data.files ?? [])
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="px-[15px] pt-[18px] pb-[108px]">
      <div className="mb-[18px]">
        <h1 className="font-syne text-[20px] font-bold tracking-[-0.4px] mb-1">Cari Prompt</h1>
        <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
          Cari menggunakan bahasa natural
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-[20px]">
        <span className="absolute left-[15px] top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{ color: 'var(--text-3)' }}>
          ⌕
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Contoh: cara balas komen negatif di Facebook"
          className="w-full rounded-full pl-[44px] pr-[18px] py-[12px] text-sm outline-none"
          style={{
            background: 'var(--glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text)',
          }}
        />
      </form>

      {status === 'loading' && (
        <p className="text-center text-sm py-8" style={{ color: 'var(--text-3)' }}>Mencari...</p>
      )}

      {status === 'error' && (
        <p className="text-center text-sm py-8" style={{ color: 'var(--danger)' }}>Ralat semasa mencari. Cuba lagi.</p>
      )}

      {status === 'done' && results.length === 0 && (
        <p className="text-center text-sm py-8" style={{ color: 'var(--text-3)' }}>Tiada prompt dijumpai untuk &quot;{query}&quot;</p>
      )}

      {status === 'done' && results.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.6px] mb-3 pl-[2px]" style={{ color: 'var(--text-3)' }}>
            {results.length} keputusan ditemui
          </p>
          <div className="grid grid-cols-2 gap-[10px]">
            {results.map((file, idx) => (
              <PromptCard
                key={file.filename}
                file={file}
                featured={idx === 0}
                onClick={() => setSelectedFile(file)}
              />
            ))}
          </div>
        </>
      )}

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
