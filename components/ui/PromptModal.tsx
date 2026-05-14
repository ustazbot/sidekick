'use client'

import { useState } from 'react'
import type { VaultFile } from '@/types'

type Platform = 'chatgpt' | 'claude' | 'gemini'
type GenStatus = 'idle' | 'loading' | 'done' | 'error'

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'claude',  label: 'Claude'  },
  { id: 'gemini',  label: 'Gemini'  },
]

function openAI(platform: Platform, text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
  const urls: Record<Platform, string> = {
    chatgpt: 'https://chatgpt.com/',
    claude:  `https://claude.ai/new?q=${encodeURIComponent(text)}`,
    gemini:  'https://gemini.google.com/app',
  }
  window.open(urls[platform], '_blank')
}

type ModuleConfig = {
  productLabel: string
  productPlaceholder: string
  showAvatar: boolean
  showPain: boolean
  showMessage: boolean
  messageLabel: string
  messagePlaceholder: string
}

function getConfig(module: string, nicheCode: string): ModuleConfig {
  const isRen = nicheCode === 'REN'
  const productLabel = isRen ? 'Listing Hartanah anda?' : 'Nama produk / servis anda?'
  const productPlaceholder = isRen
    ? 'Contoh: Condo The Vyne Sri Petaling, Rumah Teres…'
    : 'Contoh: Serum Vitamin C, Kereta Myvi, Kursus Online…'

  if (module === 'AVATAR') {
    return {
      productLabel: 'Nama produk / perniagaan anda?',
      productPlaceholder: 'Contoh: Serum Vitamin C, Kursus Online, Kedai Makan…',
      showAvatar: false, showPain: false,
      showMessage: false, messageLabel: '', messagePlaceholder: '',
    }
  }

  if (module === 'ATTRACT') {
    if (nicheCode === 'HOOKMSL') {
      return {
        productLabel, productPlaceholder,
        showAvatar: false, showPain: false,
        showMessage: true,
        messageLabel: 'Pain point pelanggan (dalam bahasa mereka sendiri)',
        messagePlaceholder: 'Contoh: "Dah cuba banyak serum tapi muka still kusam", "Penat follow up lead tak reply"…',
      }
    }
    return {
      productLabel, productPlaceholder,
      showAvatar: true, showPain: true,
      showMessage: false, messageLabel: '', messagePlaceholder: '',
    }
  }

  if (module === 'AD-CREATOR') {
    if (nicheCode === 'TESTIMONI') {
      return {
        productLabel, productPlaceholder,
        showAvatar: false, showPain: false,
        showMessage: true,
        messageLabel: 'Tampal testimoni pelanggan anda',
        messagePlaceholder: 'Contoh: "Alhamdulillah dah guna 2 minggu, kulit dah nampak cerah sikit…"',
      }
    }
    return {
      productLabel, productPlaceholder,
      showAvatar: true, showPain: true,
      showMessage: false, messageLabel: '', messagePlaceholder: '',
    }
  }

  if (module === 'CAPTURE') {
    if (nicheCode === 'LEADMAGNET') {
      return {
        productLabel, productPlaceholder,
        showAvatar: false, showPain: false,
        showMessage: false, messageLabel: '', messagePlaceholder: '',
      }
    }
    return {
      productLabel, productPlaceholder,
      showAvatar: false, showPain: false,
      showMessage: true,
      messageLabel: 'Komen untuk dibalas',
      messagePlaceholder: 'Tampal komen sebenar dari post anda…\nContoh: "Berapa harga? Boleh COD tak?"',
    }
  }

  if (module === 'CONVERT') {
    if (nicheCode === 'OBJECTION') {
      return {
        productLabel, productPlaceholder,
        showAvatar: false, showPain: false,
        showMessage: true,
        messageLabel: '3 objection paling kerap dari pelanggan',
        messagePlaceholder: 'Contoh:\n1. "Mahal sangat"\n2. "Nanti-nantilah"\n3. "Nak tanya suami dulu"',
      }
    }
    return {
      productLabel, productPlaceholder,
      showAvatar: false, showPain: false,
      showMessage: true,
      messageLabel: 'Ayat dari DM / WhatsApp',
      messagePlaceholder: 'Tampal mesej sebenar dari DM atau WA…\nContoh: "Hai, saya berminat dengan produk ni…"',
    }
  }

  if (module === 'CLOSE') {
    if (nicheCode === 'WASCLOSING') {
      return {
        productLabel, productPlaceholder,
        showAvatar: false, showPain: false,
        showMessage: true,
        messageLabel: 'Objection utama pelanggan sebelum close',
        messagePlaceholder: 'Contoh: "Mahal la", "Nak fikir dulu", "Nanti-nanti"…',
      }
    }
    if (nicheCode === 'FOLLOWUP') {
      return {
        productLabel, productPlaceholder,
        showAvatar: false, showPain: false,
        showMessage: true,
        messageLabel: 'Kenapa prospek jadi sejuk / berhenti reply?',
        messagePlaceholder: 'Contoh: "Tiba-tiba tak reply lepas tanya harga", "Kata nak fikir, 3 hari takde kabar"…',
      }
    }
    return {
      productLabel, productPlaceholder,
      showAvatar: false, showPain: false,
      showMessage: false, messageLabel: '', messagePlaceholder: '',
    }
  }

  if (module === 'DEFEND') {
    if (nicheCode === 'PEMINAT') {
      return {
        productLabel, productPlaceholder,
        showAvatar: false, showPain: false,
        showMessage: true,
        messageLabel: 'Pengalaman semasa pelanggan selepas beli',
        messagePlaceholder: 'Contoh: "Lepas beli hantar je, takde follow up", "Customer service slow reply"…',
      }
    }
    if (nicheCode === 'COMPLAINT') {
      return {
        productLabel, productPlaceholder,
        showAvatar: false, showPain: false,
        showMessage: true,
        messageLabel: 'Jenis aduan / complaint yang diterima',
        messagePlaceholder: 'Contoh: "Produk lambat sampai", "Tak sesuai macam dalam gambar", "Nak refund"…',
      }
    }
    return {
      productLabel, productPlaceholder,
      showAvatar: false, showPain: false,
      showMessage: true,
      messageLabel: 'Ayat bantahan pelanggan',
      messagePlaceholder: 'Tampal ayat bantahan sebenar…\nContoh: "Harga mahal sangat, ada tempat lain murah je"',
    }
  }

  return {
    productLabel, productPlaceholder,
    showAvatar: false, showPain: false,
    showMessage: false, messageLabel: '', messagePlaceholder: '',
  }
}

function buildStandardBlock(product: string, target: string, niche: string): string {
  const p = product.trim() || '[NAMA PRODUK]'
  const t = target.trim() || '[TARGET PELANGGAN]'
  return [
    '---SIDEKICK PROMPT STANDARD---',
    `Produk    : ${p}`,
    `Target    : ${t}`,
    `Niche     : ${niche}`,
    '',
    'Arahan untuk AI:',
    '- Tulis dalam Bahasa Melayu + Inggeris natural (macam seller Malaysia bercakap)',
    '- Elakkan bahasa formal atau gaya artikel — output mesti boleh guna terus',
    '- Setiap point: situasi sebenar + emosi pelanggan + ayat sebenar mereka',
    `- Spesifik kepada "${t}" dan "${p}" — jangan generik`,
    '------------------------------',
    '',
  ].join('\n')
}

function injectFields(
  content: string,
  productName: string,
  targetCustomer: string,
  avatar: string,
  pain: string,
  message: string,
  module: string,
  nicheCode: string,
): string {
  let out = content

  if (productName.trim()) {
    out = out
      .replace(/\[NAMA PRODUK \/ PRODUCT NAME\]/gi, productName)
      .replace(/\[NAMA PRODUK\/PRODUCT NAME\]/gi,   productName)
      .replace(/\[NAMA PRODUK\]/gi,                  productName)
      .replace(/\[PRODUCT NAME\]/gi,                 productName)
  }

  if (targetCustomer.trim()) {
    out = out
      .replace(/\[TARGET PELANGGAN \/ TARGET CUSTOMER\]/gi, targetCustomer)
      .replace(/\[TARGET PELANGGAN\]/gi,                     targetCustomer)
      .replace(/\[TARGET CUSTOMER\]/gi,                      targetCustomer)
      .replace(/\[TARGET_CUSTOMER\]/gi,                      targetCustomer)
  }

  if (avatar.trim()) {
    out = out.replace(/\[PROFIL PEMBELI \+ USIA \/ BUYER PROFILE \+ AGE\]/gi, avatar)
  }

  if (pain.trim()) {
    out = out.replace(/\[ISI JIKA ADA \/ FILL IF AVAILABLE — KOSONGKAN JIKA TIADA\]/i, pain)
  }

  if (message.trim()) {
    if (module === 'CAPTURE') {
      out = out.replace(/\[TAMPAL KOMEN DI SINI \/ PASTE COMMENT HERE\]/gi, message)
    } else if (module === 'CONVERT') {
      out = out
        .replace(/\[TERANGKAN APA YANG DAH BERLAKU \/ DESCRIBE WHAT HAPPENED\]/gi, message)
        .replace(/\[BANTAHAN \/ OBJECTION\]/gi, message)
        .replace(/\[SENARAI BANTAHAN \/ LIST OF OBJECTIONS\]/gi, message)
    } else if (module === 'DEFEND') {
      out = out
        .replace(/\[TULIS AYAT BANTAHAN SEBENAR \/ WRITE ACTUAL OBJECTION\]/gi, message)
        .replace(/\[JENIS ADUAN \/ TYPE OF COMPLAINT\]/gi, message)
        .replace(/\[PENGALAMAN SELEPAS BELI \/ POST PURCHASE EXPERIENCE\]/gi, message)
    } else if (module === 'ATTRACT') {
      out = out.replace(/\[PAIN POINT SEBENAR \/ REAL PAIN POINT\]/gi, message)
    } else if (module === 'CLOSE') {
      out = out
        .replace(/\[OBJECTION UTAMA \/ MAIN OBJECTION\]/gi, message)
        .replace(/\[SEBAB PROSPEK SEJUK \/ REASON PROSPECT WENT COLD\]/gi, message)
    } else if (module === 'AD-CREATOR') {
      out = out.replace(/\[TAMPAL TESTIMONI \/ PASTE TESTIMONIAL\]/gi, message)
    }
  }

  // Strip header metadata — keep only the prompt body
  const startMarker = '--- MULA PROMPT / START PROMPT ---'
  const endMarker   = '--- TAMAT PROMPT / END PROMPT ---'
  if (out.includes(startMarker)) {
    out = out.split(startMarker)[1] ?? out
  }
  const endIdx = out.indexOf(endMarker)
  if (endIdx !== -1) {
    out = out.slice(0, endIdx)
  }
  out = out.trim()

  // Prepend standard block
  const block = buildStandardBlock(productName, targetCustomer, nicheCode)
  out = block + out

  return out
}

type Props = {
  file: VaultFile
  isOpen: boolean
  onClose: () => void
}

export default function PromptModal({ file, isOpen, onClose }: Props) {
  const [productName,   setProductName]   = useState('')
  const [targetCustomer,setTargetCustomer]= useState('')
  const [avatar,        setAvatar]        = useState('')
  const [pain,          setPain]          = useState('')
  const [message,       setMessage]       = useState('')
  const [output,        setOutput]        = useState('')
  const [genStatus,     setGenStatus]     = useState<GenStatus>('idle')
  const [errorMsg,      setErrorMsg]      = useState('')
  const [copied,        setCopied]        = useState(false)
  const [showAIPicker,  setShowAIPicker]  = useState(false)

  if (!isOpen) return null

  const cfg = getConfig(file.module, file.niche_code)

  async function handleGenerate() {
    setGenStatus('loading')
    setOutput('')
    setErrorMsg('')
    try {
      const res = await fetch(`/api/download?file=${encodeURIComponent(file.filename)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const code = body?.error ?? res.status
        if (code === 'no_purchase' || res.status === 403) {
          setErrorMsg('Akaun anda belum aktif. Sila hubungi admin.')
        } else if (res.status === 401) {
          setErrorMsg('Sesi tamat. Sila log masuk semula.')
        } else {
          setErrorMsg(`Gagal memuatkan prompt. (${code})`)
        }
        setGenStatus('error')
        return
      }
      const content = await res.text()
      setOutput(injectFields(content, productName, targetCustomer, avatar, pain, message, file.module, file.niche_code))
      setGenStatus('done')
    } catch {
      setErrorMsg('Gagal memuatkan prompt. Periksa sambungan internet anda.')
      setGenStatus('error')
    }
  }

  function handleCopy() {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const hasDone = genStatus === 'done' && output

  const inputStyle = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    color: 'var(--text)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  } as const

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-[200] flex items-end pb-[68px]"
      style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] mx-auto rounded-t-[24px] flex flex-col"
        style={{
          background: 'rgba(248,248,252,0.97)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.95)',
          borderBottom: 'none',
          maxHeight: 'calc(88vh - 68px)',
          boxShadow: '0 -6px 32px rgba(0,0,0,0.10)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 w-[34px] h-[4px] bg-black/10 rounded-sm mx-auto mt-3 mb-4" />

        {/* Header */}
        <div className="flex-shrink-0 px-[18px] pb-[14px]" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <p className="text-[9px] font-bold tracking-[1.2px] uppercase mb-[5px]" style={{ color: 'var(--accent)' }}>
            {file.module} · {file.niche_code}
          </p>
          <h2 className="text-[17px] font-bold tracking-[-0.3px] leading-snug text-text">
            {file.niche}
          </h2>
          <p className="text-[11px] mt-[3px]" style={{ color: 'var(--text-3)' }}>
            {file.module_desc}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0, overscrollBehavior: 'contain' }}>
          <div className="p-[18px] space-y-[13px] pb-8">

            {/* Product name */}
            <div>
              <label className="block text-[11px] font-semibold mb-[6px]" style={{ color: 'var(--text-2)' }}>
                {cfg.productLabel}
              </label>
              <input
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder={cfg.productPlaceholder}
                className="w-full rounded-[12px] px-[14px] py-[11px] text-[13px] outline-none"
                style={inputStyle}
                onKeyDown={e => { if (e.key === 'Enter') handleGenerate() }}
              />
              {!productName && (
                <p className="text-[11px] mt-[5px]" style={{ color: 'var(--accent)', opacity: 0.6 }}>
                  ↑ Isi nama produk untuk prompt yang lebih tepat
                </p>
              )}
            </div>

            {/* Target Pelanggan — global field for all modules */}
            <div>
              <label className="block text-[11px] font-semibold mb-[6px]" style={{ color: 'var(--text-2)' }}>
                Target Pelanggan Spesifik
                <span className="ml-1 font-normal" style={{ color: 'var(--text-3)' }}>(penting untuk hasil tepat)</span>
              </label>
              <input
                type="text"
                value={targetCustomer}
                onChange={e => setTargetCustomer(e.target.value)}
                placeholder="Contoh: ibu muda 25-35, pekerja office lelaki, seller online baru…"
                className="w-full rounded-[12px] px-[14px] py-[11px] text-[13px] outline-none"
                style={inputStyle}
              />
            </div>

            {/* Avatar / Pesona — ATTRACT, AD-CREATOR only */}
            {cfg.showAvatar && (
              <div>
                <label className="block text-[11px] font-semibold mb-[6px]" style={{ color: 'var(--text-2)' }}>
                  Pesona / Avatar Pelanggan
                  <span className="ml-1 font-normal" style={{ color: 'var(--text-3)' }}>(pilihan)</span>
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  placeholder="Contoh: Ibu rumah 30-45 tahun, sensitif kulit, suka review YouTube…"
                  className="w-full rounded-[12px] px-[14px] py-[11px] text-[13px] outline-none"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Pain / Masalah — ATTRACT, AD-CREATOR only */}
            {cfg.showPain && (
              <div>
                <label className="block text-[11px] font-semibold mb-[6px]" style={{ color: 'var(--text-2)' }}>
                  Emotional Pain / Masalah Utama
                  <span className="ml-1 font-normal" style={{ color: 'var(--text-3)' }}>(pilihan)</span>
                </label>
                <input
                  type="text"
                  value={pain}
                  onChange={e => setPain(e.target.value)}
                  placeholder="Contoh: kulit kusam tak confident, tak tahu nak mulakan bisnes…"
                  className="w-full rounded-[12px] px-[14px] py-[11px] text-[13px] outline-none"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Module-specific message field */}
            {cfg.showMessage && (
              <div>
                <label className="block text-[11px] font-semibold mb-[6px]" style={{ color: 'var(--text-2)' }}>
                  {cfg.messageLabel}
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={cfg.messagePlaceholder}
                  rows={3}
                  className="w-full rounded-[12px] px-[14px] py-[11px] text-[13px] outline-none resize-none"
                  style={{ ...inputStyle, lineHeight: 1.5 }}
                />
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={genStatus === 'loading'}
              className="w-full rounded-[12px] py-[14px] text-[14px] font-bold disabled:opacity-50 transition-all active:scale-[0.98]"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                boxShadow: productName.trim() ? 'var(--shadow-accent)' : 'none',
                opacity: productName.trim() || genStatus === 'loading' ? 1 : 0.72,
              }}
            >
              {genStatus === 'loading' ? 'Menjana…' : '✦ Jana Prompt Saya'}
            </button>

            {genStatus === 'error' && (
              <p className="text-[12px] text-center" style={{ color: 'var(--danger)' }}>
                {errorMsg}
              </p>
            )}

            {/* Output */}
            {hasDone && (
              <>
                <div
                  className="rounded-[12px] p-[14px] overflow-y-auto"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)', maxHeight: 220 }}
                >
                  <span className="text-[9px] font-bold tracking-[1.2px] uppercase block mb-[10px]" style={{ color: 'var(--accent)' }}>
                    Prompt Anda
                  </span>
                  <pre className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-2)', fontFamily: 'inherit' }}>
                    {output}
                  </pre>
                </div>

                {/* Action row */}
                <div className="grid grid-cols-2 gap-[8px]">
                  <button
                    onClick={handleCopy}
                    className="rounded-[10px] py-[12px] text-[12px] font-semibold transition-all active:scale-95"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: 'var(--shadow-xs)', color: 'var(--text-2)' }}
                  >
                    {copied ? 'Disalin!' : 'Salin Prompt'}
                  </button>
                  <a
                    href={`/api/download?file=${encodeURIComponent(file.filename)}`}
                    download={file.filename}
                    className="rounded-[10px] py-[12px] text-[12px] font-semibold text-center transition-all active:scale-95 flex items-center justify-center"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: 'var(--shadow-xs)', color: 'var(--text-2)', textDecoration: 'none' }}
                  >
                    Muat Turun
                  </a>
                </div>

                {/* Send to AI */}
                <button
                  onClick={() => setShowAIPicker(v => !v)}
                  className="w-full rounded-[10px] py-[12px] text-[13px] font-bold transition-all active:scale-[0.98]"
                  style={{
                    background: showAIPicker ? 'var(--accent)' : 'var(--accent-light)',
                    color: showAIPicker ? '#fff' : 'var(--accent)',
                    border: '1.5px solid var(--accent)',
                  }}
                >
                  {showAIPicker ? 'Pilih AI di bawah ↓' : 'Hantar ke AI →'}
                </button>

                {showAIPicker && (
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { openAI(p.id, output); setShowAIPicker(false) }}
                        className="rounded-xl py-[10px] px-[6px] text-center text-[12px] font-semibold transition-all active:scale-95"
                        style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.07)', boxShadow: 'var(--shadow-xs)', color: 'var(--text-2)' }}
                      >
                        {p.label}
                      </button>
                    ))}
                    <p className="col-span-3 text-[10px] text-center mt-[-4px]" style={{ color: 'var(--text-3)' }}>
                      Prompt disalin automatik — Copy-Paste dalam AI.
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
