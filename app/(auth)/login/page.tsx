'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Mode = 'magic-link' | 'password'
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('magic-link')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  async function handleMagicLink() {
    setStatus('loading')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setStatus('error')
      setMessage(`Ralat: ${error.message}`)
      return
    }
    setStatus('success')
    setMessage('Semak email anda — link login telah dihantar.')
  }

  async function handlePassword() {
    setStatus('loading')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setStatus('error')
      setMessage('Email atau kata laluan tidak sah.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setStatus('error')
      setMessage('Sila masukkan alamat email anda.')
      return
    }
    if (mode === 'magic-link') {
      await handleMagicLink()
    } else {
      await handlePassword()
    }
  }

  function switchMode(next: Mode) {
    setMode(next)
    setStatus('idle')
    setMessage('')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="SideKick" width={140} height={56} style={{ objectFit: 'contain' }} priority />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Log Masuk</h1>
        <p className="text-center text-gray-500 text-sm mb-8">AI Sales Co-Pilot untuk Seller Malaysia</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@email.com"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {mode === 'password' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Kata Laluan
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

          {status === 'error' && (
            <p className="text-red-600 text-sm">{message}</p>
          )}
          {status === 'success' && (
            <p className="text-green-600 text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {status === 'loading'
              ? 'Memproses...'
              : mode === 'magic-link'
              ? 'Hantar Magic Link'
              : 'Log Masuk'}
          </button>
        </form>

        <div className="mt-4 text-center">
          {mode === 'magic-link' ? (
            <button
              type="button"
              onClick={() => switchMode('password')}
              className="text-sm text-gray-500 hover:text-black underline"
            >
              Guna kata laluan
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('magic-link')}
              className="text-sm text-gray-500 hover:text-black underline"
            >
              Hantar magic link
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
