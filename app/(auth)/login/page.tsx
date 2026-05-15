'use client'

import { useState, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

type Status = 'idle' | 'loading' | 'error'

function LoginForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [status,   setStatus]   = useState<Status>('idle')
  const [message,  setMessage]  = useState('')

  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = useMemo(() => createClient(), [])

  const resetSuccess = searchParams.get('reset') === 'success'
  const invalidReset = searchParams.get('error') === 'invalid_reset'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setStatus('error')
      setMessage('Email atau kata laluan tidak sah.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="SideKick" width={140} height={56} style={{ objectFit: 'contain' }} priority />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Log Masuk</h1>
        <p className="text-center text-gray-500 text-sm mb-8">AI Sales Co-Pilot untuk Seller Malaysia</p>

        {resetSuccess && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
            Kata laluan berjaya ditukar. Sila log masuk.
          </p>
        )}
        {invalidReset && (
          <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            Link telah tamat tempoh. Sila minta semula.
          </p>
        )}

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Kata Laluan</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex justify-end mt-1">
              <a href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-700 underline">
                Lupa kata laluan?
              </a>
            </div>
          </div>

          {status === 'error' && (
            <p className="text-red-600 text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {status === 'loading' ? 'Memproses...' : 'Log Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Belum ada akaun?{' '}
          <a href="/checkout" className="underline text-gray-600">Beli SIDEKICK</a>
          {' '}dahulu untuk dapatkan akses.
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  )
}
