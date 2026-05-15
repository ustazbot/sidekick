# Forgot Password Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah forgot password flow menggunakan Supabase built-in reset — user boleh reset kata laluan via email dan kembali ke login page.

**Architecture:** Login page dapat link "Lupa kata laluan?" → `/forgot-password` call `resetPasswordForEmail()` → Supabase hantar email → user klik link → `/reset-password?code=xxx` exchange code → `updateUser({ password })` → sign out → redirect ke `/login?reset=success`.

**Tech Stack:** Next.js 14 App Router, Supabase Auth (`resetPasswordForEmail`, `exchangeCodeForSession`, `updateUser`), TypeScript, Tailwind CSS

---

## File Map

| File | Action | Tanggungjawab |
|---|---|---|
| `app/(auth)/login/page.tsx` | Modify | Tambah link + handle `?reset=success` / `?error=invalid_reset` |
| `app/(auth)/forgot-password/page.tsx` | Create | Form email, hantar reset email |
| `app/reset-password/page.tsx` | Create | Exchange code, form kata laluan baru, redirect selepas berjaya |

---

### Task 1: Update login page

**Files:**
- Modify: `app/(auth)/login/page.tsx`

Perubahan:
1. Wrap komponen dalam `Suspense` (diperlukan untuk `useSearchParams` dalam Next.js 14)
2. Detect `?reset=success` → papar mesej hijau
3. Detect `?error=invalid_reset` → papar mesej merah
4. Tambah link "Lupa kata laluan?" di bawah password field

- [ ] **Step 1: Ganti kandungan `app/(auth)/login/page.tsx`**

```tsx
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
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
```

- [ ] **Step 2: Verify build lulus**

```bash
npm run build 2>&1 | tail -20
```

Expected: tiada TypeScript error pada `app/(auth)/login/page.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/login/page.tsx
git commit -m "feat: add forgot password link and reset success messages to login page"
```

---

### Task 2: Bina `/forgot-password` page

**Files:**
- Create: `app/(auth)/forgot-password/page.tsx`

Page ini dalam `(auth)` group — user yang dah login akan auto-redirect ke dashboard (diuruskan oleh `app/(auth)/layout.tsx`).

- [ ] **Step 1: Buat fail `app/(auth)/forgot-password/page.tsx`**

```tsx
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

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    })

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
```

- [ ] **Step 2: Verify build lulus**

```bash
npm run build 2>&1 | tail -20
```

Expected: tiada TypeScript error pada `app/(auth)/forgot-password/page.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/forgot-password/page.tsx
git commit -m "feat: add forgot-password page"
```

---

### Task 3: Bina `/reset-password` page

**Files:**
- Create: `app/reset-password/page.tsx`

Page ini **bukan** dalam `(auth)` group — user belum login semasa proses reset. Middleware sedia ada tidak kawal route ini, jadi tiada perubahan middleware diperlukan.

Flow dalaman:
1. Mount → baca `?code=` dari URL
2. Tiada code → redirect ke `/login?error=invalid_reset`
3. `exchangeCodeForSession(code)` gagal → redirect ke `/login?error=invalid_reset`
4. Berjaya → papar form kata laluan baru
5. Submit → `updateUser({ password })` → `signOut()` → redirect ke `/login?reset=success`

`signOut()` diperlukan supaya session baru daripada reset tidak auto-login user (kita mahu user log masuk semula secara eksplisit — option B).

- [ ] **Step 1: Buat fail `app/reset-password/page.tsx`**

```tsx
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
    return <p className="text-center text-sm text-gray-500">Mengesahkan link...</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Kata Laluan Baru</label>
        <input
          id="password"
          type="password"
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
```

- [ ] **Step 2: Verify build lulus**

```bash
npm run build 2>&1 | tail -20
```

Expected: tiada TypeScript error. Build output menunjukkan route `/reset-password` wujud.

- [ ] **Step 3: Run existing tests**

```bash
npm test 2>&1 | tail -20
```

Expected: semua test lulus (tiada regression pada test sedia ada)

- [ ] **Step 4: Commit**

```bash
git add app/reset-password/page.tsx
git commit -m "feat: add reset-password page with code exchange and password update"
```

---

## Manual Test Checklist (selepas deploy atau local dev)

- [ ] Pergi ke `/login` — ada link "Lupa kata laluan?" di bawah field kata laluan
- [ ] Klik link → redirect ke `/forgot-password`
- [ ] Masuk email yang berdaftar → submit → papar mesej neutral (tiada error/success yang spesifik)
- [ ] Semak inbox → ada email reset dari Supabase
- [ ] Klik link dalam email → redirect ke `/reset-password?code=xxx`
- [ ] Papar "Mengesahkan link..." sebentar kemudian muncul form
- [ ] Cuba submit kata laluan < 8 aksara → papar error inline
- [ ] Cuba submit kata laluan tidak sepadan → papar error inline
- [ ] Submit kata laluan sah → redirect ke `/login?reset=success`
- [ ] Login page papar mesej hijau "Kata laluan berjaya ditukar"
- [ ] Log masuk dengan kata laluan baru → berjaya masuk dashboard
- [ ] Cuba guna link reset yang sama sekali lagi → redirect ke `/login?error=invalid_reset`
- [ ] Login page papar mesej merah "Link telah tamat tempoh"
