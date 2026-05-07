'use client'

import { useState } from 'react'
import type { VaultFile } from '@/types'
import FlowBanner from '@/components/ui/FlowBanner'
import ModuleFilter from '@/components/ui/ModuleFilter'
import PromptCard from '@/components/ui/PromptCard'
import PromptModal from '@/components/ui/PromptModal'

type Props = {
  files: VaultFile[]
  userName: string
}

export default function BrowseClient({ files, userName }: Props) {
  const [activeModule, setActiveModule] = useState('ALL')
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null)

  const filtered =
    activeModule === 'ALL' ? files : files.filter((f) => f.module === activeModule)

  return (
    <div className="px-[15px] pt-[18px] pb-[108px]">
      {/* Greeting */}
      <div className="mb-[18px]">
        <p className="text-[12px] font-normal mb-[2px]" style={{ color: 'var(--text-3)' }}>
          Selamat datang semula,
        </p>
        <h1 className="font-syne text-[20px] font-bold tracking-[-0.4px]">
          {userName} <em className="not-italic">👋</em>
        </h1>
      </div>

      <FlowBanner />

      <ModuleFilter activeModule={activeModule} onSelect={setActiveModule} />

      <p className="text-[11px] font-semibold uppercase tracking-[0.6px] mb-[12px] pl-[2px]" style={{ color: 'var(--text-3)' }}>
        {filtered.length} prompt tersedia
      </p>

      {/* Card grid — first card is featured (full-width) */}
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
