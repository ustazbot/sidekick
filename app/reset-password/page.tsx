'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

type Stage = 'loading' | 'form' | 'submitting'

function ResetPasswordForm() {
  const [stage,     setStage]     = useState<Stage>('loading')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [formError, setFormError] = useState('')

  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = useMemo(() => createClient(), [])

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      router.replace('/login?error=invalid_reset')
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        router.replace('/login?error=invalid_reset')
      } else {
        setStage('form')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setFormError('Kata laluan mestilah sekurang-kurangnya 8 aksara.')
      return
    }
    if (password !== confirm) {
      setFormError('Kata laluan tidak sepadan.')
      return
    }
    setStage('submitting')
    setFormError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setFormError('Ralat berlaku. Cuba lagi atau minta link baru.')
      setStage('form')
      return
    }

    await supabase.auth.signOut()
    router.push('/login?reset=success')
  }

  if (stage === 'loading') {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-500">Mengesahkan link...</p>
        <a href="/login" className="text-xs text-gray-400 underline">Kembali ke Log Masuk</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Kata Laluan Baru</label>
        <input
          id="password"
          type="password"
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium mb-1">Sahkan Kata Laluan</label>
        <input
          id="confirm"
          type="password"
          minLength={8}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {formError && (
        <p className="text-red-600 text-sm">{formError}</p>
      )}

      <button
        type="submit"
        disabled={stage === 'submitting'}
        className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {stage === 'submitting' ? 'Menyimpan...' : 'Simpan Kata Laluan Baru'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="SideKick" width={140} height={56} style={{ objectFit: 'contain' }} priority />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Tetapkan Kata Laluan Baru</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Masukkan kata laluan baru anda</p>

        <Suspense fallback={<p className="text-center text-sm text-gray-500">Memuatkan...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  )
}
