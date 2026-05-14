'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const NICHES = [
  { code: 'REN', label: 'Hartanah / Ejen Hartanah' },
  { code: 'KERETA', label: 'Automotif / Jualan Kereta' },
  { code: 'PAKAIAN', label: 'Fesyen / Pakaian' },
  { code: 'SKINCARE', label: 'Skincare / Kecantikan' },
  { code: 'HEALTH', label: 'Kesihatan / Suplemen' },
  { code: 'FNB', label: 'Makanan & Minuman' },
  { code: 'EDU', label: 'Pendidikan / Kursus' },
  { code: 'TAKAFUL', label: 'Takaful / Insurans' },
  { code: 'TRAVEL', label: 'Travel / Pelancongan' },
  { code: 'SERVIS', label: 'Perkhidmatan / Servis' },
] as const

type Status = 'idle' | 'loading' | 'error'

export default function OnboardingPage() {
  const [niche, setNiche] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!niche) {
      setStatus('error')
      setMessage('Sila pilih bidang anda.')
      return
    }
    setStatus('loading')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Ralat menyimpan maklumat. Cuba lagi.')
        return
      }
    } catch {
      setStatus('error')
      setMessage('Tiada sambungan. Sila cuba lagi.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="SideKick" width={140} height={56} style={{ objectFit: 'contain' }} priority />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1 font-syne">
          Selamat Datang!
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-2)' }}>
          Anda seller dalam bidang apa?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="niche" className="block text-sm font-medium mb-1">
              Pilih bidang anda
            </label>
            <select
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--glass-border2)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
            >
              <option value="">-- Pilih bidang --</option>
              {NICHES.map((n) => (
                <option key={n.code} value={n.code}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {status === 'error' && (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>{message}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {status === 'loading' ? 'Menyimpan...' : 'Teruskan ke Dashboard'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full text-center text-sm py-2"
            style={{ color: 'var(--text-3)' }}
          >
            Langkau buat masa ini
          </button>
        </form>
      </div>
    </main>
  )
}
