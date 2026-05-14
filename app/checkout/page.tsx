'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Status = 'idle' | 'loading' | 'error'

export default function CheckoutPage() {
  const router = useRouter()
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    try {
      const res = await fetch('/api/payment/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, phone }),
      })

      const data = await res.json()

      if (!res.ok || !data.redirectUrl) {
        setErrMsg(data.error ?? 'Ralat berlaku. Cuba lagi.')
        setStatus('error')
        return
      }

      // Hard-redirect to ToyyibPay payment page
      window.location.href = data.redirectUrl
    } catch {
      setErrMsg('Tiada sambungan. Sila semak internet anda.')
      setStatus('error')
    }
  }

  const busy = status === 'loading'

  return (
    <>
      <style>{`
        body { background: #fff !important; }

        .ck-input {
          width: 100%; padding: 13px 14px;
          border: 1.5px solid #E5EAE8; border-radius: 12px;
          font-size: 15px; color: #0F1923; background: #fff;
          outline: none; transition: border-color 0.18s;
          font-family: inherit;
        }
        .ck-input:focus { border-color: #1D9E75; }
        .ck-input::placeholder { color: #9CA3AF; }

        .ck-btn {
          width: 100%; padding: 17px;
          background: linear-gradient(135deg, #FF5722, #FF7043);
          color: #fff; border: none; border-radius: 14px;
          font-family: inherit; font-size: 16px; font-weight: 800;
          cursor: pointer; letter-spacing: 0.2px;
          box-shadow: 0 6px 24px rgba(255,87,34,0.28);
          transition: all 0.18s;
        }
        .ck-btn:active { opacity: 0.88; transform: scale(0.98); }
        .ck-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
      `}</style>

      <main style={{ background: '#fff', minHeight: '100vh', padding: '48px 22px 64px' }}>

        {/* Back */}
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#6B7280', textDecoration: 'none', marginBottom: 28 }}>
          ← Kembali
        </a>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ marginBottom: 12 }}>
            <Image src="/logo.png" alt="SideKick" width={140} height={56} style={{ objectFit: 'contain' }} priority />
          </div>
          <h1 style={{ fontFamily: 'inherit', fontSize: 22, fontWeight: 800, color: '#0F1923', marginBottom: 6 }}>
            Dapatkan SIDEKICK
          </h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.55 }}>
            Isi maklumat di bawah untuk diarahkan ke halaman pembayaran selamat.
          </p>
        </div>

        {/* Price summary */}
        <div style={{
          background: '#F7FFFE', border: '1.5px solid rgba(29,158,117,0.2)',
          borderRadius: 14, padding: '16px 18px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#0F1923' }}>SIDEKICK Vault</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>74 prompt · Sekali bayar · Akses selamanya</div>
          </div>
          <div style={{ fontFamily: 'inherit', fontSize: 22, fontWeight: 800, color: '#1D9E75' }}>RM75</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Nama Penuh
            </label>
            <input
              className="ck-input"
              type="text"
              placeholder="Contoh: Ahmad bin Ali"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={busy}
              autoComplete="name"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Alamat Email
            </label>
            <input
              className="ck-input"
              type="email"
              placeholder="email@contoh.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={busy}
              autoComplete="email"
            />
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
              Akses dashboard akan dihantar ke email ini selepas bayar.
            </p>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Nombor Telefon
            </label>
            <input
              className="ck-input"
              type="tel"
              placeholder="0123456789"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              disabled={busy}
              autoComplete="tel"
            />
          </div>

          {errMsg && (
            <div style={{
              background: '#FFF5F5', border: '1px solid #FED7D7',
              borderRadius: 10, padding: '12px 14px',
              fontSize: 13, color: '#C53030', lineHeight: 1.5,
            }}>
              {errMsg}
            </div>
          )}

          <button type="submit" className="ck-btn" disabled={busy} style={{ marginTop: 4 }}>
            {busy ? 'Sedang diproses...' : 'Teruskan ke Pembayaran →'}
          </button>
        </form>

        {/* Trust signals */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          {['Pembayaran selamat melalui ToyyibPay', 'Tiada bayaran berulang', 'Akses segera selepas bayar'].map(t => (
            <span key={t} style={{ fontSize: 11.5, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#1D9E75', fontWeight: 700, fontSize: 13 }}>✓</span> {t}
            </span>
          ))}
        </div>

      </main>
    </>
  )
}
