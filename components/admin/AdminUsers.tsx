'use client'

import { useState } from 'react'

const NICHES = [
  { code: 'REN', label: 'Hartanah' }, { code: 'KERETA', label: 'Automotif' },
  { code: 'PAKAIAN', label: 'Fesyen' }, { code: 'SKINCARE', label: 'Skincare' },
  { code: 'HEALTH', label: 'Kesihatan' }, { code: 'FNB', label: 'F&B' },
  { code: 'EDU', label: 'Pendidikan' }, { code: 'TAKAFUL', label: 'Takaful' },
  { code: 'TRAVEL', label: 'Travel' }, { code: 'SERVIS', label: 'Servis' },
]

type PurchaseStatus = 'admin' | 'berbayar' | 'tiada'

type UserRow = {
  id: string
  email: string
  full_name?: string | null
  niche?: string | null
  created_at?: string | null
  purchase_status: PurchaseStatus
}

type Props = { users: UserRow[] }

export default function AdminUsers({ users: initialUsers }: Props) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [search, setSearch] = useState('')

  // Add-user form state
  const [showForm, setShowForm] = useState(false)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [niche,    setNiche]    = useState('')
  const [saving,      setSaving]      = useState(false)
  const [formMsg,     setFormMsg]     = useState<{ ok: boolean; text: string } | null>(null)
  const [grantingId,  setGrantingId]  = useState<string | null>(null)
  const [grantErrors, setGrantErrors] = useState<Record<string, string>>({})

  const filtered = users.filter(u => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.niche ?? '').toLowerCase().includes(q)
    )
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormMsg(null)
    if (!email.trim() || !password) { setFormMsg({ ok: false, text: 'Email dan kata laluan diperlukan.' }); return }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, full_name: name.trim() || undefined, niche: niche || undefined }),
      })
      const data = await res.json()

      if (res.ok) {
        const accessGranted = !data.warning
        const newUser: UserRow = {
          id: data.user_id,
          email: email.trim().toLowerCase(),
          full_name: name.trim() || null,
          niche: niche || null,
          created_at: new Date().toISOString(),
          purchase_status: accessGranted ? 'admin' : 'tiada',
        }
        setUsers(prev => [newUser, ...prev])
        setEmail(''); setPassword(''); setName(''); setNiche('')
        if (accessGranted) {
          setFormMsg({ ok: true, text: `User ${newUser.email} berjaya ditambah dan diaktifkan.` })
          setTimeout(() => setShowForm(false), 1800)
        } else {
          setFormMsg({ ok: false, text: `Akaun dicipta tapi akses gagal diberikan: ${data.detail ?? ''}. Klik "Aktifkan" dalam senarai.` })
        }
      } else {
        const errMap: Record<string, string> = {
          email_taken: 'Email sudah didaftarkan.',
          password_too_short: 'Kata laluan mesti sekurang-kurangnya 8 aksara.',
          email_and_password_required: 'Email dan kata laluan diperlukan.',
          auth_failed: 'Gagal mencipta akaun: ' + (data.detail ?? ''),
        }
        setFormMsg({ ok: false, text: errMap[data.error] ?? 'Ralat tidak dijangka.' })
      }
    } catch {
      setFormMsg({ ok: false, text: 'Tiada sambungan. Sila cuba lagi.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleGrantAccess(userId: string) {
    setGrantingId(userId)
    setGrantErrors(prev => { const n = { ...prev }; delete n[userId]; return n })
    try {
      const res = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, purchase_status: 'admin' as PurchaseStatus } : u
        ))
      } else {
        const msg = data?.detail ?? data?.error ?? 'Gagal mengaktifkan.'
        setGrantErrors(prev => ({ ...prev, [userId]: msg }))
      }
    } catch {
      setGrantErrors(prev => ({ ...prev, [userId]: 'Tiada sambungan.' }))
    } finally {
      setGrantingId(null)
    }
  }

  const fmtDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="ad-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: '#0F1923', margin: 0 }}>
          Senarai User
          <span style={{ marginLeft: 8, fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>{users.length} ahli</span>
        </h2>
        <button
          onClick={() => { setShowForm(v => !v); setFormMsg(null) }}
          style={{
            background: showForm ? '#F3F4F6' : '#1D9E75', color: showForm ? '#374151' : '#fff',
            border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {showForm ? '✕ Tutup' : '+ Tambah User'}
        </button>
      </div>

      {/* Add-user form */}
      {showForm && (
        <form onSubmit={handleAdd} style={{
          background: '#F9FAFB', border: '1px solid #E8EAED', borderRadius: 12,
          padding: '16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>Tambah User Baharu</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)}
              required style={inputSt}
            />
            <input
              type="password" placeholder="Kata laluan * (min 8)" value={password} onChange={e => setPassword(e.target.value)}
              required style={inputSt}
            />
            <input
              type="text" placeholder="Nama penuh (pilihan)" value={name} onChange={e => setName(e.target.value)}
              style={inputSt}
            />
            <select value={niche} onChange={e => setNiche(e.target.value)} style={inputSt}>
              <option value="">— Niche (pilihan) —</option>
              {NICHES.map(n => <option key={n.code} value={n.code}>{n.label}</option>)}
            </select>
          </div>

          <p style={{ fontSize: 11, color: '#6B7280', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '7px 10px', margin: 0 }}>
            Akaun beta tester — akses penuh diberikan secara automatik tanpa bayaran.
          </p>

          {formMsg && (
            <p style={{ fontSize: 12, margin: 0, color: formMsg.ok ? '#065F46' : '#991B1B' }}>
              {formMsg.ok ? '✓ ' : '⚠ '}{formMsg.text}
            </p>
          )}

          <button
            type="submit" disabled={saving}
            style={{
              background: saving ? '#9CA3AF' : '#1D9E75', color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Mencipta akaun…' : 'Tambah User'}
          </button>
        </form>
      )}

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="text" placeholder="Cari email, nama, atau niche…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputSt, width: '100%', boxSizing: 'border-box', fontSize: 12 }}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>
          {search ? 'Tiada user sepadan.' : 'Tiada user lagi.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="ad-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nama</th>
                <th>Niche</th>
                <th>Status</th>
                <th>Daftar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </td>
                  <td style={{ color: u.full_name ? '#374151' : '#D1D5DB' }}>
                    {u.full_name ?? '—'}
                  </td>
                  <td>
                    {u.niche
                      ? <span style={{ fontSize: 10, fontWeight: 700, background: '#EFF6FF', color: '#1D4ED8', padding: '2px 7px', borderRadius: 50 }}>{u.niche}</span>
                      : <span style={{ color: '#D1D5DB', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    {u.purchase_status === 'berbayar' && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: '#D1FAE5', color: '#065F46' }}>
                        Berbayar
                      </span>
                    )}
                    {u.purchase_status === 'admin' && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: '#EDE9FE', color: '#5B21B6' }}>
                        Admin Tambah
                      </span>
                    )}
                    {u.purchase_status === 'tiada' && (
                      <div>
                        <button
                          onClick={() => handleGrantAccess(u.id)}
                          disabled={grantingId === u.id}
                          style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 50,
                            background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D',
                            cursor: 'pointer', opacity: grantingId === u.id ? 0.6 : 1,
                          }}
                        >
                          {grantingId === u.id ? '…' : 'Aktifkan'}
                        </button>
                        {grantErrors[u.id] && (
                          <div style={{ fontSize: 9, color: '#DC2626', marginTop: 3, maxWidth: 120 }}>
                            {grantErrors[u.id]}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ color: '#9CA3AF', whiteSpace: 'nowrap', fontSize: 11 }}>
                    {fmtDate(u.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const inputSt: React.CSSProperties = {
  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9,
  padding: '9px 12px', fontSize: 13, color: '#374151', outline: 'none', width: '100%', boxSizing: 'border-box',
}
