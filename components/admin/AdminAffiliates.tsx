'use client'

import { useState } from 'react'

export type AffiliateRow = {
  id: string
  user_id: string
  ref_code: string
  email: string
  full_name: string | null
  total_clicks: number
  total_conversions: number
  total_commission: number
  pending_commission: number
  total_withdrawn: number
  bank_info: string
  created_at: string | null
}

type Props = { affiliates: AffiliateRow[]; appUrl: string }

const PAYOUT_METHODS = [
  { value: 'manual_transfer', label: 'Manual Bank Transfer' },
  { value: 'toyyibpay',       label: 'ToyyibPay Payout' },
  { value: 'ewallet',         label: "e-Wallet (TnG / GrabPay)" },
]

export default function AdminAffiliates({ affiliates: initial, appUrl }: Props) {
  const [affiliates,    setAffiliates]    = useState<AffiliateRow[]>(initial)
  const [tab,           setTab]           = useState<'overview' | 'payout'>('overview')
  const [search,        setSearch]        = useState('')

  // Bank info modal
  const [bankModal,     setBankModal]     = useState<AffiliateRow | null>(null)
  const [bankDraft,     setBankDraft]     = useState('')
  const [bankSaving,    setBankSaving]    = useState(false)
  const [bankMsg,       setBankMsg]       = useState('')

  // Payout
  const [payoutMethod,  setPayoutMethod]  = useState(PAYOUT_METHODS[0].value)
  const [payoutNote,    setPayoutNote]    = useState('')
  const [confirmId,     setConfirmId]     = useState<string | null>(null)
  const [processing,    setProcessing]    = useState<string | null>(null)
  const [payoutMsg,     setPayoutMsg]     = useState<Record<string, { ok: boolean; text: string }>>({})

  /* ── derived ── */
  const totalClicks      = affiliates.reduce((s, a) => s + a.total_clicks, 0)
  const totalConversions = affiliates.reduce((s, a) => s + a.total_conversions, 0)
  const totalCommission  = affiliates.reduce((s, a) => s + a.total_commission, 0)
  const totalPending     = affiliates.reduce((s, a) => s + a.pending_commission, 0)
  const totalWithdrawn   = affiliates.reduce((s, a) => s + a.total_withdrawn, 0)
  const overallCTR       = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0'
  const pendingList      = affiliates.filter(a => a.pending_commission > 0)

  const filtered = affiliates.filter(a => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return a.email.toLowerCase().includes(q) ||
      a.ref_code.toLowerCase().includes(q) ||
      (a.full_name ?? '').toLowerCase().includes(q)
  })

  const fmt     = (n: number) => `RM${n.toFixed(2)}`
  const fmtCTR  = (a: AffiliateRow) =>
    a.total_clicks > 0 ? ((a.total_conversions / a.total_clicks) * 100).toFixed(1) + '%' : '—'
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  /* ── bank info ── */
  function openBankModal(a: AffiliateRow) {
    setBankModal(a)
    setBankDraft(a.bank_info)
    setBankMsg('')
  }

  async function saveBankInfo() {
    if (!bankModal) return
    setBankSaving(true)
    setBankMsg('')
    try {
      const res = await fetch('/api/admin/affiliate/bank-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliate_id: bankModal.id, bank_info: bankDraft }),
      })
      if (res.ok) {
        setAffiliates(prev => prev.map(a => a.id === bankModal.id ? { ...a, bank_info: bankDraft } : a))
        setBankMsg('✓ Tersimpan')
        setTimeout(() => setBankModal(null), 900)
      } else {
        const d = await res.json().catch(() => ({}))
        setBankMsg(`⚠ Gagal: ${d.detail ?? d.error}`)
      }
    } catch {
      setBankMsg('⚠ Tiada sambungan.')
    } finally {
      setBankSaving(false)
    }
  }

  /* ── payout ── */
  async function approvePayout(a: AffiliateRow) {
    setProcessing(a.id)
    setPayoutMsg(prev => { const n = { ...prev }; delete n[a.id]; return n })
    try {
      const res = await fetch('/api/admin/affiliate/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliate_id: a.id, method: payoutMethod, note: payoutNote }),
      })
      const data = await res.json()
      if (res.ok) {
        setAffiliates(prev => prev.map(x =>
          x.id === a.id ? { ...x, total_withdrawn: data.new_withdrawn, pending_commission: 0 } : x
        ))
        setConfirmId(null)
        setPayoutNote('')
        setPayoutMsg(prev => ({ ...prev, [a.id]: { ok: true, text: `${fmt(data.amount_paid)} berjaya ditandakan dibayar.` } }))
      } else {
        setPayoutMsg(prev => ({ ...prev, [a.id]: { ok: false, text: data.detail ?? data.error ?? 'Gagal.' } }))
      }
    } catch {
      setPayoutMsg(prev => ({ ...prev, [a.id]: { ok: false, text: 'Tiada sambungan.' } }))
    } finally {
      setProcessing(null)
    }
  }

  /* ── tab button ── */
  const TabBtn = ({ k, label, count }: { k: typeof tab; label: string; count?: number }) => (
    <button onClick={() => setTab(k)} style={{
      padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
      background: tab === k ? '#1D9E75' : 'transparent',
      color: tab === k ? '#fff' : '#6B7280',
      border: tab === k ? 'none' : '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {label}
      {count !== undefined && (
        <span style={{
          background: tab === k ? 'rgba(255,255,255,0.25)' : (count > 0 ? '#FEF3C7' : '#F3F4F6'),
          color: tab === k ? '#fff' : (count > 0 ? '#92400E' : '#9CA3AF'),
          borderRadius: 50, padding: '1px 7px', fontSize: 10, fontWeight: 800,
        }}>{count}</span>
      )}
    </button>
  )

  return (
    <>
      <div className="ad-card" style={{ marginBottom: 16, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: '#0F1923', margin: 0 }}>
            Pengurusan Affiliate
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <TabBtn k="overview" label="Senarai" count={affiliates.length} />
            <TabBtn k="payout"   label="Komisyen & Payout" count={pendingList.length} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Jumlah Klik',    value: totalClicks,            color: '#3B82F6', icon: '👆' },
            { label: 'Jumlah Sales',   value: totalConversions,       color: '#1D9E75', icon: '🛒' },
            { label: 'CTR Purata',     value: overallCTR + '%',       color: '#8B5CF6', icon: '📊' },
            { label: 'Komisyen Total', value: fmt(totalCommission),   color: '#D97706', icon: '💰' },
            { label: 'Belum Dibayar',  value: fmt(totalPending),      color: '#DC2626', icon: '⏳' },
            { label: 'Telah Dibayar',  value: fmt(totalWithdrawn),    color: '#059669', icon: '✅' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 15, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {affiliates.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Tiada affiliate lagi.</p>
        ) : tab === 'overview' ? (
          /* ── Senarai Tab ── */
          <>
            <input type="text" placeholder="Cari email, nama, ref code…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '8px 12px', fontSize: 12, color: '#374151', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 12 }}
            />
            <div style={{ overflowX: 'auto' }}>
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Affiliate</th>
                    <th>Ref Code</th>
                    <th style={{ textAlign: 'center' }}>Klik</th>
                    <th style={{ textAlign: 'center' }}>Sales</th>
                    <th style={{ textAlign: 'center' }}>CTR</th>
                    <th>Komisyen</th>
                    <th>Pending</th>
                    <th>Dibayar</th>
                    <th>Bank</th>
                    <th>Daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {(search ? filtered : affiliates).map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#374151', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {a.full_name ?? a.email.split('@')[0]}
                        </div>
                        <div style={{ fontSize: 10, color: '#9CA3AF' }}>{a.email}</div>
                      </td>
                      <td>
                        <a href={`${appUrl}/ref/${a.ref_code}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily: 'monospace', fontSize: 11, color: '#1D9E75', textDecoration: 'none' }}>
                          {a.ref_code}
                        </a>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, fontSize: 12 }}>{a.total_clicks}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, fontSize: 12 }}>{a.total_conversions}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: a.total_clicks > 0 ? '#8B5CF6' : '#D1D5DB' }}>{fmtCTR(a)}</span>
                      </td>
                      <td style={{ color: '#D97706', fontWeight: 700, fontSize: 12 }}>{fmt(a.total_commission)}</td>
                      <td>
                        {a.pending_commission > 0
                          ? <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 50, background: '#FEF3C7', color: '#92400E' }}>{fmt(a.pending_commission)}</span>
                          : <span style={{ color: '#D1D5DB', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ color: '#059669', fontSize: 12, fontWeight: 600 }}>
                        {a.total_withdrawn > 0 ? fmt(a.total_withdrawn) : <span style={{ color: '#D1D5DB' }}>—</span>}
                      </td>
                      <td>
                        <button onClick={() => openBankModal(a)} style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
                          background: a.bank_info ? '#EFF6FF' : '#F3F4F6',
                          color: a.bank_info ? '#1D4ED8' : '#6B7280',
                          border: a.bank_info ? '1px solid #BFDBFE' : '1px solid #E5E7EB',
                          whiteSpace: 'nowrap',
                        }}>
                          {a.bank_info ? '✓ Bank' : 'Tambah Bank'}
                        </button>
                      </td>
                      <td style={{ color: '#9CA3AF', fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDate(a.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* ── Komisyen & Payout Tab ── */
          <div>
            {/* Kaedah payout */}
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Kaedah Payout</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PAYOUT_METHODS.map(m => (
                  <button key={m.value} onClick={() => setPayoutMethod(m.value)} style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: payoutMethod === m.value ? '#1D9E75' : '#fff',
                    color: payoutMethod === m.value ? '#fff' : '#374151',
                    border: payoutMethod === m.value ? 'none' : '1px solid #E5E7EB',
                  }}>{m.label}</button>
                ))}
              </div>
            </div>

            {pendingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>Tiada komisyen tertunggak.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingList.map(a => {
                  const msg = payoutMsg[a.id]
                  const isConfirming = confirmId === a.id
                  const isProcessing = processing === a.id

                  return (
                    <div key={a.id} style={{
                      border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px', background: '#fff',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>

                        {/* Info kiri */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#0F1923' }}>
                            {a.full_name ?? a.email.split('@')[0]}
                          </div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1, marginBottom: 10 }}>{a.email}</div>

                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <MiniStat label="Komisyen Pending" value={fmt(a.pending_commission)} accent />
                            <MiniStat label="Total Komisyen"   value={fmt(a.total_commission)} />
                            <MiniStat label="Telah Dibayar"    value={a.total_withdrawn > 0 ? fmt(a.total_withdrawn) : '—'} />
                            <MiniStat label="Sales"            value={String(a.total_conversions)} />
                          </div>

                          {/* Bank info preview */}
                          {a.bank_info && (
                            <div style={{
                              marginTop: 10, padding: '8px 10px', borderRadius: 8,
                              background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: 11, color: '#1E40AF',
                              fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            }}>
                              {a.bank_info}
                            </div>
                          )}
                        </div>

                        {/* Butang kanan */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                          <button onClick={() => openBankModal(a)} style={{
                            padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            background: a.bank_info ? '#EFF6FF' : '#F3F4F6',
                            color: a.bank_info ? '#1D4ED8' : '#6B7280',
                            border: a.bank_info ? '1px solid #BFDBFE' : '1px solid #E5E7EB',
                          }}>
                            {a.bank_info ? '✎ Maklumat Bank' : '+ Maklumat Bank'}
                          </button>

                          {!isConfirming ? (
                            <button onClick={() => { setConfirmId(a.id); setPayoutNote('') }} style={{
                              padding: '7px 14px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              background: '#059669', color: '#fff', border: 'none', whiteSpace: 'nowrap',
                            }}>
                              Tandakan Dibayar
                            </button>
                          ) : (
                            <button onClick={() => setConfirmId(null)} style={{
                              padding: '7px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              background: '#F3F4F6', color: '#374151', border: 'none',
                            }}>
                              Batal
                            </button>
                          )}

                          {msg && (
                            <p style={{ fontSize: 11, color: msg.ok ? '#065F46' : '#DC2626', textAlign: 'right', maxWidth: 200 }}>
                              {msg.text}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Confirm panel */}
                      {isConfirming && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0F0F0' }}>
                          <input type="text" placeholder="Nota / No. rujukan transaksi (pilihan)"
                            value={payoutNote} onChange={e => setPayoutNote(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, color: '#374151', background: '#fff', outline: 'none', marginBottom: 10 }}
                          />
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirmId(null)} style={{
                              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              background: '#F3F4F6', color: '#374151', border: 'none',
                            }}>Batal</button>
                            <button onClick={() => approvePayout(a)} disabled={isProcessing} style={{
                              padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: isProcessing ? 'not-allowed' : 'pointer',
                              background: isProcessing ? '#9CA3AF' : '#059669', color: '#fff', border: 'none',
                            }}>
                              {isProcessing ? 'Memproses…' : `✓ Sahkan Bayaran ${fmt(a.pending_commission)}`}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bank Info Modal ── */}
      {bankModal && (
        <div
          onClick={() => setBankModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 800, color: '#0F1923', margin: 0 }}>
                  Maklumat Bank
                </h3>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>
                  {bankModal.full_name ?? bankModal.email}
                </p>
              </div>
              <button onClick={() => setBankModal(null)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#9CA3AF', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email affiliate: <span style={{ color: '#1D4ED8', fontWeight: 400 }}>{bankModal.email}</span>
              </p>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>
                Masukkan maklumat bank (nama bank, no. akaun, nama pemegang akaun):
              </p>
            </div>

            <textarea
              value={bankDraft}
              onChange={e => setBankDraft(e.target.value)}
              placeholder={'cth:\nBank: Maybank\nNo. Akaun: 1234567890\nNama: Ahmad bin Ali'}
              rows={5}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 12,
                color: '#374151', background: '#FAFAFA', outline: 'none',
                resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6,
              }}
            />

            {bankMsg && (
              <p style={{ fontSize: 12, color: bankMsg.startsWith('✓') ? '#059669' : '#DC2626', marginTop: 8 }}>{bankMsg}</p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setBankModal(null)} style={{
                padding: '9px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: '#F3F4F6', color: '#374151', border: 'none',
              }}>Batal</button>
              <button onClick={saveBankInfo} disabled={bankSaving} style={{
                padding: '9px 20px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: bankSaving ? 'not-allowed' : 'pointer',
                background: bankSaving ? '#9CA3AF' : '#1D9E75', color: '#fff', border: 'none',
              }}>
                {bankSaving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: accent ? '#92400E' : '#374151' }}>{value}</div>
    </div>
  )
}
