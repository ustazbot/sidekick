'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

function SetPasswordForm({ email }: { email: string }) {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message,  setMessage]  = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setStatus('error')
      setMessage('Kata laluan mestilah sekurang-kurangnya 8 aksara.')
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage('Kata laluan tidak sepadan.')
      return
    }
    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/auth/set-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setStatus('error')
      setMessage(data.error ?? 'Ralat berlaku. Cuba lagi.')
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setStatus('error')
      setMessage('Kata laluan ditetapkan. Sila log masuk di halaman login.')
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    setStatus('success')
    setMessage('Berjaya! Mengalihkan ke dashboard...')
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-1 text-center">Tetapkan Kata Laluan</h2>
      <p className="text-sm text-gray-500 text-center mb-5">
        Cipta kata laluan untuk akaun <strong>{email}</strong>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kata Laluan Baru</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 8 aksara"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sahkan Kata Laluan</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Taip semula kata laluan"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {status === 'error'   && <p className="text-red-600 text-sm">{message}</p>}
        {status === 'success' && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="w-full bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {status === 'loading' ? 'Memproses...' : 'Masuk ke Dashboard →'}
        </button>
      </form>
    </div>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="SideKick" width={140} height={56} style={{ objectFit: 'contain' }} priority />
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Pembayaran Berjaya!</h1>
          <p className="text-gray-600 text-sm">Terima kasih kerana menyertai SIDEKICK.</p>
        </div>

        {email ? (
          <SetPasswordForm email={email} />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800 font-semibold mb-1">Langkah seterusnya:</p>
            <p className="text-sm text-blue-700">
              Pergi ke <a href="/login" className="underline font-medium">halaman Log Masuk</a> dan masukkan email anda.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Memuatkan...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
