'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type Status = 'idle' | 'loading' | 'sent'

export default function ForgotPasswordPage() {
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const supabase = useMemo(() => createClient(), [])
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sidekick101.com'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    })
    if (error) console.error('[forgot-password]', error.message)

    // Sentiasa papar "sent" tanpa mengira email wujud atau tidak (security)
    setStatus('sent')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="SideKick" width={140} height={56} style={{ objectFit: 'contain' }} priority />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Lupa Kata Laluan</h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Masukkan email anda untuk menerima link reset
        </p>

        {status === 'sent' ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
              Jika email ini berdaftar, anda akan menerima link dalam masa beberapa minit.
              Semak folder spam jika tiada dalam inbox.
            </p>
            <a href="/login" className="block text-sm text-gray-500 underline">
              Kembali ke Log Masuk
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="nama@email.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {status === 'loading' ? 'Menghantar...' : 'Hantar Link Reset'}
            </button>

            <p className="text-center text-xs text-gray-400">
              <a href="/login" className="underline">Kembali ke Log Masuk</a>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
