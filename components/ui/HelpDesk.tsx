'use client'

import { useState } from 'react'

const FAQ = [
  { q: 'Apa itu SIDEKICK?', a: 'SIDEKICK adalah platform koleksi prompt AI untuk seller Malaysia. Anda download fail .txt dan guna dengan ChatGPT, Claude, atau Gemini.' },
  { q: 'Macam mana nak muat turun prompt?', a: 'Pergi ke halaman Vault, pilih prompt yang sesuai, klik kad dan tekan butang "Muat Turun Prompt".' },
  { q: 'Boleh guna dengan AI apa?', a: 'Anda boleh guna dengan mana-mana AI — ChatGPT, Claude, Gemini, DeepSeek atau lain-lain.' },
  { q: 'Berapa banyak prompt yang ada?', a: 'Terdapat 60 prompt dalam 6 modul dan 10 niche yang berbeza.' },
  { q: 'Apa itu program Affiliate?', a: 'Anda boleh dapat 40% komisyen setiap kali seseorang beli melalui link anda.' },
  { q: 'Macam mana nak jadi Affiliate?', a: 'Pergi ke tab Affiliate dan klik "Daftar Sekarang" untuk dapatkan link unik anda.' },
  { q: 'Prompt boleh guna berapa kali?', a: 'Tidak terhad. Anda boleh guna prompt yang sama berkali-kali dengan produk berbeza.' },
  { q: 'Ada versi percuma?', a: 'Akses penuh kepada semua 60 prompt hanya dengan satu pembayaran sahaja.' },
]

type Tab = 'faq' | 'ai' | 'contact'

export default function HelpDesk() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('faq')
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [asking, setAsking] = useState(false)

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || asking) return
    setAsking(true)
    setReply('')
    try {
      const res = await fetch('/api/helpdesk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      setReply(data.reply ?? 'Tiada jawapan.')
    } catch {
      setReply('Ralat. Cuba lagi.')
    } finally {
      setAsking(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Buka pusat bantuan"
        className="fixed bottom-[90px] right-4 w-[46px] h-[46px] rounded-full flex items-center justify-center text-white font-bold font-syne text-[19px] z-[90]"
        style={{ background: 'var(--accent)', boxShadow: '0 4px 18px rgba(29,158,117,0.32)' }}
      >
        ?
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-end"
          style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[430px] mx-auto rounded-t-[24px] overflow-y-auto"
            style={{
              background: 'rgba(246,246,250,0.97)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.95)',
              borderBottom: 'none',
              maxHeight: '80vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[34px] h-[4px] bg-black/10 rounded-sm mx-auto mt-3 mb-3" />

            <div className="px-[18px] pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <h2 className="font-syne font-bold text-[17px] mb-3">Pusat Bantuan</h2>
              <div className="flex gap-2">
                {(['faq', 'ai', 'contact'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-2 rounded-xl text-[12px] font-medium transition-all"
                    style={{
                      background: tab === t ? 'var(--accent)' : 'var(--accent-light)',
                      color: tab === t ? '#fff' : 'var(--accent)',
                      border: `1px solid ${tab === t ? 'var(--accent)' : 'var(--accent-border)'}`,
                    }}
                  >
                    {t === 'faq' ? 'FAQ' : t === 'ai' ? 'Tanya AI' : 'Hubungi'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-[18px]">
              {tab === 'faq' && (
                <div className="space-y-3">
                  {FAQ.map((item) => (
                    <div key={item.q} className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <p className="text-sm font-semibold mb-1 text-text">{item.q}</p>
                      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-2)' }}>{item.a}</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'ai' && (
                <div>
                  <form onSubmit={handleAsk} className="flex gap-2 mb-3">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tanya soalan tentang SIDEKICK..."
                      className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                    <button
                      type="submit"
                      disabled={asking}
                      className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      {asking ? '...' : 'Hantar'}
                    </button>
                  </form>
                  {reply && (
                    <div className="rounded-xl p-3" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{reply}</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'contact' && (
                <div className="text-center space-y-4">
                  <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                    Hubungi kami melalui WhatsApp untuk bantuan lanjut.
                  </p>
                  <a
                    href={`https://wa.me/60123456789`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold"
                    style={{ background: '#25D366', color: '#fff' }}
                  >
                    💬 WhatsApp Kami
                  </a>
                  <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                    Waktu operasi: Isnin–Jumaat, 9am–6pm
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
