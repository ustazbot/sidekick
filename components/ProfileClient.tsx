'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NICHES = [
  { code: 'REN',      label: 'Hartanah / Ejen Hartanah' },
  { code: 'KERETA',   label: 'Automotif / Jualan Kereta' },
  { code: 'PAKAIAN',  label: 'Fesyen / Pakaian' },
  { code: 'SKINCARE', label: 'Skincare / Kecantikan' },
  { code: 'HEALTH',   label: 'Kesihatan / Suplemen' },
  { code: 'FNB',      label: 'Makanan & Minuman' },
  { code: 'EDU',      label: 'Pendidikan / Kursus' },
  { code: 'TAKAFUL',  label: 'Takaful / Insurans' },
  { code: 'TRAVEL',   label: 'Travel / Pelancongan' },
  { code: 'SERVIS',   label: 'Perkhidmatan / Servis' },
]

const MY_BANKS = [
  'Maybank', 'CIMB Bank', 'Public Bank', 'RHB Bank', 'Hong Leong Bank',
  'AmBank', 'Bank Simpanan Nasional (BSN)', 'Bank Rakyat', 'Agrobank',
  'Affin Bank', 'Alliance Bank', 'MBSB Bank', 'Bank Islam', 'Bank Muamalat',
  'Standard Chartered', 'OCBC Bank', 'HSBC Bank', 'UOB Malaysia', 'Citibank',
]

type Props = {
  email: string
  initialName: string
  initialNiche: string
  joined: string
  isAffiliate: boolean
  initialBankInfo: string
}

function parseBankInfo(raw: string) {
  const lines = raw.split('\n')
  const get = (prefix: string) =>
    lines.find(l => l.startsWith(prefix))?.replace(prefix, '').trim() ?? ''
  return {
    bank_name:    get('Bank: '),
    account_no:   get('No. Akaun: '),
    holder_name:  get('Nama: '),
  }
}

export default function ProfileClient({
  email, initialName, initialNiche, joined, isAffiliate, initialBankInfo,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName,  setDisplayName]  = useState(initialName)
  const [displayNiche, setDisplayNiche] = useState(initialNiche)
  const [draftName,    setDraftName]    = useState(initialName)
  const [draftNiche,   setDraftNiche]   = useState(initialNiche)
  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState('')

  const [newPw,      setNewPw]      = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [pwSaving,   setPwSaving]   = useState(false)
  const [pwDone,     setPwDone]     = useState(false)
  const [pwError,    setPwError]    = useState('')

  // Bank info
  const parsed = parseBankInfo(initialBankInfo)
  const [bankName,    setBankName]    = useState(parsed.bank_name)
  const [accountNo,   setAccountNo]   = useState(parsed.account_no)
  const [holderName,  setHolderName]  = useState(parsed.holder_name)
  const [bankSaving,  setBankSaving]  = useState(false)
  const [bankDone,    setBankDone]    = useState(false)
  const [bankError,   setBankError]   = useState('')

  const nicheLabel = NICHES.find(n => n.code === displayNiche)?.label ?? '—'
  const hasBankInfo = !!(bankName && accountNo && holderName)

  const cardStyle = {
    background: 'var(--glass)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-sm)',
  }
  const inputCls = 'w-full rounded-[12px] px-[14px] py-[11px] text-[13px] outline-none'
  const inputStyle = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    color: 'var(--text)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  function startEdit() {
    setDraftName(displayName)
    setDraftNiche(displayNiche)
    setSaveError('')
    setIsEditing(true)
  }

  async function saveProfile() {
    if (!draftName.trim()) { setSaveError('Nama tidak boleh kosong.'); return }
    if (!draftNiche)       { setSaveError('Sila pilih bidang.'); return }
    setSaving(true); setSaveError('')
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: draftName.trim(), niche: draftNiche }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        if (res.status === 401) {
          setSaveError('Sesi tamat — sila log masuk semula.')
        } else {
          setSaveError(d?.error === 'update_failed' ? 'Gagal menyimpan. Sila cuba lagi.' : 'Ralat tidak dijangka.')
        }
        return
      }
      setDisplayName(draftName.trim())
      setDisplayNiche(draftNiche)
      setIsEditing(false)
    } catch { setSaveError('Tiada sambungan. Sila cuba lagi.')
    } finally { setSaving(false) }
  }

  async function savePassword() {
    setPwError(''); setPwDone(false)
    if (!newPw)              { setPwError('Masukkan kata laluan baharu.'); return }
    if (newPw.length < 8)    { setPwError('Kata laluan mesti sekurang-kurangnya 8 aksara.'); return }
    if (newPw !== confirmPw) { setPwError('Kata laluan tidak sepadan.'); return }
    setPwSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) { setPwError(error.message); return }
      setNewPw(''); setConfirmPw('')
      setPwDone(true)
      setTimeout(() => setPwDone(false), 3000)
    } catch { setPwError('Gagal mengemaskini kata laluan.')
    } finally { setPwSaving(false) }
  }

  async function saveBankInfo() {
    if (!bankName)     { setBankError('Sila pilih nama bank.'); return }
    if (!accountNo.trim()) { setBankError('Sila masukkan nombor akaun.'); return }
    if (!holderName.trim()) { setBankError('Sila masukkan nama pemegang akaun.'); return }
    setBankSaving(true); setBankError(''); setBankDone(false)
    try {
      const res = await fetch('/api/affiliate/bank-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank_name: bankName, account_no: accountNo.trim(), holder_name: holderName.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setBankError(d?.detail ?? 'Gagal menyimpan. Sila cuba lagi.')
        return
      }
      setBankDone(true)
      setTimeout(() => setBankDone(false), 3000)
    } catch { setBankError('Tiada sambungan. Sila cuba lagi.')
    } finally { setBankSaving(false) }
  }

  return (
    <div className="px-[15px] pt-[18px] pb-[108px] space-y-[14px]">
      <div className="mb-[4px]">
        <h1 className="text-[20px] font-bold tracking-[-0.4px]">Profil Saya</h1>
        <p className="text-[12px] mt-[2px]" style={{ color: 'var(--text-3)' }}>
          Ahli sejak {joined}
        </p>
      </div>

      {/* ── Maklumat profil ── */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        {!isEditing ? (
          <div className="space-y-[14px]">
            <ProfileRow label="E-mel"  value={email} />
            <ProfileRow label="Nama"   value={displayName || '—'} />
            <ProfileRow label="Bidang" value={displayNiche ? nicheLabel : '—'} />
            <button onClick={startEdit}
              className="w-full rounded-[12px] py-[11px] text-[13px] font-bold mt-[4px]"
              style={{ background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }}>
              Edit Profil
            </button>
          </div>
        ) : (
          <div className="space-y-[12px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: 'var(--text-3)' }}>Nama</p>
            <input type="text" value={draftName} onChange={e => setDraftName(e.target.value)}
              placeholder="Nama penuh anda" className={inputCls} style={inputStyle} />

            <p className="text-[10px] font-semibold uppercase tracking-[0.6px] pt-[2px]" style={{ color: 'var(--text-3)' }}>Bidang / Niche</p>
            <div className="relative">
              <select value={draftNiche} onChange={e => setDraftNiche(e.target.value)}
                className={inputCls + ' appearance-none pr-[36px] cursor-pointer'} style={inputStyle}>
                <option value="">— Pilih bidang anda —</option>
                {NICHES.map(n => <option key={n.code} value={n.code}>{n.label}</option>)}
              </select>
              <span className="absolute right-[13px] top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'var(--text-3)' }}>▾</span>
            </div>

            {saveError && <p className="text-[12px]" style={{ color: 'var(--danger)' }}>{saveError}</p>}

            <div className="flex gap-[10px] pt-[2px]">
              <button onClick={() => setIsEditing(false)} disabled={saving}
                className="flex-1 rounded-[12px] py-[11px] text-[13px] font-semibold disabled:opacity-50"
                style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-2)' }}>
                Batal
              </button>
              <button onClick={saveProfile} disabled={saving}
                className="flex-[2] rounded-[12px] py-[11px] text-[13px] font-bold disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }}>
                {saving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Maklumat Perbankan (affiliate sahaja) ── */}
      {isAffiliate && (
        <div className="rounded-2xl p-4 space-y-[12px]" style={{
          ...cardStyle,
          border: hasBankInfo ? '1px solid rgba(29,158,117,0.2)' : '1px solid var(--glass-border)',
          background: hasBankInfo ? 'rgba(29,158,117,0.04)' : 'var(--glass)',
        }}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: 'var(--text-3)' }}>
                Maklumat Perbankan
              </p>
              <p className="text-[11px] mt-[2px]" style={{ color: 'var(--text-3)' }}>
                Untuk penerimaan komisyen affiliate
              </p>
            </div>
            {hasBankInfo && (
              <span className="text-[10px] font-bold px-[8px] py-[3px] rounded-full" style={{
                background: 'rgba(29,158,117,0.12)', color: 'var(--accent)',
              }}>
                ✓ Lengkap
              </span>
            )}
          </div>

          {/* Nama Bank */}
          <div>
            <p className="text-[10px] font-medium mb-[6px]" style={{ color: 'var(--text-3)' }}>Nama Bank</p>
            <div className="relative">
              <select value={bankName} onChange={e => setBankName(e.target.value)}
                className={inputCls + ' appearance-none pr-[36px] cursor-pointer'} style={inputStyle}>
                <option value="">— Pilih bank —</option>
                {MY_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <span className="absolute right-[13px] top-1/2 -translate-y-1/2 pointer-events-none text-[10px]" style={{ color: 'var(--text-3)' }}>▾</span>
            </div>
          </div>

          {/* Nombor Akaun */}
          <div>
            <p className="text-[10px] font-medium mb-[6px]" style={{ color: 'var(--text-3)' }}>Nombor Akaun</p>
            <input
              type="text"
              inputMode="numeric"
              value={accountNo}
              onChange={e => setAccountNo(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="cth: 1234567890"
              className={inputCls}
              style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.06em' }}
            />
          </div>

          {/* Nama Pemegang Akaun */}
          <div>
            <p className="text-[10px] font-medium mb-[6px]" style={{ color: 'var(--text-3)' }}>Nama Pemegang Akaun</p>
            <input
              type="text"
              value={holderName}
              onChange={e => setHolderName(e.target.value)}
              placeholder="Nama seperti dalam akaun bank"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          {bankError && <p className="text-[12px]" style={{ color: 'var(--danger)' }}>{bankError}</p>}
          {bankDone  && <p className="text-[12px]" style={{ color: 'var(--accent)' }}>✓ Maklumat bank berjaya disimpan!</p>}

          <button onClick={saveBankInfo} disabled={bankSaving}
            className="w-full rounded-[12px] py-[11px] text-[13px] font-bold disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }}>
            {bankSaving ? 'Menyimpan…' : hasBankInfo ? 'Kemaskini Maklumat Bank' : 'Simpan Maklumat Bank'}
          </button>
        </div>
      )}

      {/* ── Tukar Kata Laluan ── */}
      <div className="rounded-2xl p-4 space-y-[10px]" style={cardStyle}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: 'var(--text-3)' }}>
          Tukar Kata Laluan
        </p>
        <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
          placeholder="Kata laluan baharu (min. 8 aksara)" className={inputCls} style={inputStyle} />
        <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
          placeholder="Sahkan kata laluan baharu" className={inputCls} style={inputStyle}
          onKeyDown={e => { if (e.key === 'Enter') savePassword() }} />
        {pwError && <p className="text-[12px]" style={{ color: 'var(--danger)' }}>{pwError}</p>}
        {pwDone  && <p className="text-[12px]" style={{ color: 'var(--accent)' }}>✓ Kata laluan berjaya dikemaskini!</p>}
        <button onClick={savePassword} disabled={pwSaving}
          className="w-full rounded-[12px] py-[11px] text-[13px] font-bold disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-accent)' }}>
          {pwSaving ? 'Menyimpan…' : 'Kemaskini Kata Laluan'}
        </button>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.6px] mb-[3px]" style={{ color: 'var(--text-3)' }}>
        {label}
      </p>
      <p className="text-[13px]" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  )
}
