import { createClient } from '@/lib/supabase/server'

const NICHE_LABELS: Record<string, string> = {
  REN: 'Hartanah / Ejen Hartanah',
  KERETA: 'Automotif / Jualan Kereta',
  PAKAIAN: 'Fesyen / Pakaian',
  SKINCARE: 'Skincare / Kecantikan',
  HEALTH: 'Kesihatan / Suplemen',
  FNB: 'Makanan & Minuman',
  EDU: 'Pendidikan / Kursus',
  TAKAFUL: 'Takaful / Insurans',
  TRAVEL: 'Travel / Pelancongan',
  SERVIS: 'Perkhidmatan / Servis',
}

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, niche, created_at')
    .eq('id', user!.id)
    .single()

  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  const rows = [
    { label: 'Nama', value: profile?.full_name ?? '—' },
    { label: 'E-mel', value: user?.email ?? '—' },
    { label: 'Bidang', value: profile?.niche ? (NICHE_LABELS[profile.niche] ?? profile.niche) : '—' },
    { label: 'Ahli sejak', value: joined },
  ]

  return (
    <div className="px-[15px] pt-[18px] pb-[108px]">
      <h1 className="font-syne text-[20px] font-bold tracking-[-0.4px] mb-[18px]">Profil Saya</h1>

      <div
        className="rounded-2xl overflow-hidden mb-4"
        style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            className="px-4 py-3"
            style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : undefined }}
          >
            <p className="text-[11px] font-medium mb-[2px]" style={{ color: 'var(--text-3)' }}>
              {row.label}
            </p>
            <p className="text-sm text-text">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
