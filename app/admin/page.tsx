import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Image from 'next/image'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminAffiliates from '@/components/admin/AdminAffiliates'
import type { AffiliateRow } from '@/components/admin/AdminAffiliates'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'planetrizq@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase())

async function getStats() {
  const db = createAdminClient()

  const PAID_STATUSES = ['success']

  const [
    { count: totalUsers },
    { count: totalDownloads },
    { count: totalAffiliates },
    { data: purchases },
    { data: downloads },
  ] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }),
    db.from('downloads').select('*', { count: 'exact', head: true }),
    db.from('affiliates').select('*', { count: 'exact', head: true }),
    db.from('purchases')
      .select('id, amount, status, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(15),
    db.from('downloads')
      .select('filename')
      .limit(500),
  ])

  // ── Download stats ─────────────────────────────────────────
  const KNOWN_MODULES = ['AD-CREATOR', 'AVATAR', 'ATTRACT', 'CAPTURE', 'CONVERT', 'CLOSE', 'DEFEND']
  function parseFilename(filename: string) {
    const name = (filename ?? '').replace(/-v\d+\.txt$/i, '')
    for (const mod of KNOWN_MODULES) {
      if (name.startsWith(mod + '-')) {
        return { module: mod, niche: name.slice(mod.length + 1) }
      }
    }
    return { module: '—', niche: '—' }
  }

  const fileCounts   = new Map<string, number>()
  const moduleCounts = new Map<string, number>()
  const nicheCounts  = new Map<string, number>()

  for (const d of (downloads ?? []) as { filename?: string }[]) {
    const fn = d.filename ?? ''
    if (!fn) continue
    fileCounts.set(fn, (fileCounts.get(fn) ?? 0) + 1)
    const { module, niche } = parseFilename(fn)
    if (module !== '—') moduleCounts.set(module, (moduleCounts.get(module) ?? 0) + 1)
    if (niche  !== '—') nicheCounts.set(niche,   (nicheCounts.get(niche)   ?? 0) + 1)
  }

  const dlTopFiles    = [...fileCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const dlModuleStats = [...moduleCounts.entries()].sort((a, b) => b[1] - a[1])
  const dlNicheStats  = [...nicheCounts.entries()].sort((a, b) => b[1] - a[1])

  // Fetch all users separately for reliable error surfacing
  const { data: usersRaw, error: usersErr } = await db
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (usersErr) console.error('[admin] users fetch error:', usersErr.message)

  // Fetch all purchases to determine paid status per user
  const { data: allPurchases, error: purchasesErr } = await db
    .from('purchases')
    .select('user_id, status, amount, payment_ref')

  if (purchasesErr) console.error('[admin] purchases fetch error:', purchasesErr.message)

  // Fetch all affiliates
  const { data: affiliatesRaw, error: affiliatesErr } = await db
    .from('affiliates')
    .select('*')
    .order('created_at', { ascending: false })

  if (affiliatesErr) console.error('[admin] affiliates fetch error:', affiliatesErr.message)

  // Build map: user_id → purchase status
  type PurchaseStatus = 'admin' | 'berbayar' | 'tiada'
  const purchaseStatusMap = new Map<string, PurchaseStatus>()
  for (const p of (allPurchases ?? []) as { user_id: string; status: string; payment_ref?: string }[]) {
    if (!PAID_STATUSES.includes(p.status)) continue
    const existing = purchaseStatusMap.get(p.user_id)
    const isAdmin = (p.payment_ref ?? '').startsWith('admin-grant-')
    // Prefer 'berbayar' over 'admin' if user has both
    if (!existing || (existing === 'admin' && !isAdmin)) {
      purchaseStatusMap.set(p.user_id, isAdmin ? 'admin' : 'berbayar')
    }
  }

  const users = (usersRaw ?? []).map((u: Record<string, unknown>) => ({
    id:            u.id         as string,
    email:         u.email      as string,
    full_name:     (u.full_name ?? u.name ?? null) as string | null,
    niche:         (u.niche     ?? null)            as string | null,
    created_at:    (u.created_at ?? null)           as string | null,
    purchase_status: (purchaseStatusMap.get(u.id as string) ?? 'tiada') as PurchaseStatus,
  }))

  const totalPaid = users.filter(u => u.purchase_status !== 'tiada').length

  const totalRevenue = (allPurchases ?? [])
    .filter((r: { status: string }) => PAID_STATUSES.includes(r.status))
    .reduce((sum: number, r: { amount?: number }) => sum + (r.amount ?? 0), 0)

  const userMap = new Map(users.map(u => [u.id, u]))

  const affiliates: AffiliateRow[] = (affiliatesRaw ?? []).map((a: Record<string, unknown>) => {
    const u = userMap.get(a.user_id as string)
    return {
      id:                 a.id                 as string,
      user_id:            a.user_id            as string,
      ref_code:           (a.ref_code ?? a.affiliate_code ?? '') as string,
      email:              u?.email ?? (a.user_id as string).slice(0, 8),
      full_name:          u?.full_name ?? null,
      total_clicks:       ((a.total_clicks       as number) ?? 0),
      total_conversions:  ((a.total_conversions  as number) ?? 0),
      total_commission:   ((a.total_commission   as number) ?? 0),
      pending_commission: ((a.pending_commission as number) ?? 0),
      total_withdrawn:    ((a.total_withdrawn    as number) ?? 0),
      bank_info:          (a.bank_info          as string)  ?? '',
      created_at:         (a.created_at         as string)  ?? null,
    }
  })

  return {
    totalUsers:      totalUsers      ?? 0,
    totalPaid:       totalPaid       ?? 0,
    totalDownloads:  totalDownloads  ?? 0,
    totalAffiliates: totalAffiliates ?? 0,
    totalRevenue,
    purchases: purchases ?? [],
    dlTopFiles,
    dlModuleStats,
    dlNicheStats,
    users,
    affiliates,
  }
}

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
    redirect('/')
  }

  const stats = await getStats()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sidekick101.com'

  const fmt = (n: number) => `RM${n.toFixed(2)}`
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' }) : '—'

  return (
    <>
      <style>{`
        body { background: #F7F8FA !important; }
        .ad-card { background:#fff; border:1px solid #E8EAED; border-radius:14px; padding:20px; }
        .ad-table { width:100%; border-collapse:collapse; font-size:12px; }
        .ad-table th { text-align:left; padding:9px 12px; font-size:10px; font-weight:700;
          letter-spacing:0.8px; text-transform:uppercase; color:#9CA3AF;
          border-bottom:1px solid #F0F0F0; font-family:inherit; }
        .ad-table td { padding:10px 12px; border-bottom:1px solid #F7F8FA; color:#374151; vertical-align:middle; }
        .ad-table tr:last-child td { border-bottom:none; }
        .ad-table tr:hover td { background:#FAFBFC; }
        .badge { display:inline-block; padding:2px 8px; border-radius:50px; font-size:10px; font-weight:700; }
        .badge-paid    { background:#D1FAE5; color:#065F46; }
        .badge-pending { background:#FEF3C7; color:#92400E; }
        .badge-failed  { background:#FEE2E2; color:#991B1B; }
      `}</style>

      <main style={{ minHeight: '100vh', padding: '28px 16px 48px', maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Image src="/logo.png" alt="SideKick" width={100} height={40} style={{ objectFit: 'contain', objectPosition: 'left' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>SIDEKICK · {user.email}</span>
          </div>
          <div style={{ height: 2, background: 'linear-gradient(90deg,#1D9E75,rgba(29,158,117,0.1))', borderRadius: 2 }} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Jumlah Pembeli', value: stats.totalPaid,        icon: '🛒', color: '#1D9E75' },
            { label: 'Hasil Jualan',   value: fmt(stats.totalRevenue), icon: '💰', color: '#D97706' },
            { label: 'Total User',     value: stats.totalUsers,        icon: '👤', color: '#3B82F6' },
            { label: 'Download',       value: stats.totalDownloads,    icon: '📥', color: '#8B5CF6' },
            { label: 'Affiliate',      value: stats.totalAffiliates,   icon: '🤝', color: '#EC4899' },
          ].map(s => (
            <div key={s.label} className="ad-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 22, width: 42, height: 42, borderRadius: 12,
                background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: 'inherit', fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* User list + Add user (client component) */}
        <AdminUsers users={stats.users} />

        {/* Affiliate list */}
        <AdminAffiliates affiliates={stats.affiliates} appUrl={appUrl} />

        {/* Recent Purchases */}
        <div className="ad-card" style={{ marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: '#0F1923' }}>
              Pembelian Terkini
            </h2>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{stats.purchases.length} rekod</span>
          </div>

          {stats.purchases.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Tiada data lagi</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Amaun</th>
                    <th>Status</th>
                    <th>Tarikh</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.purchases.map((p: {
                    id: string; user_id?: string; amount?: number; status?: string; created_at?: string
                  }) => {
                    const userEmail = stats.users.find(u => u.id === p.user_id)?.email ?? p.user_id?.slice(0, 8) ?? '—'
                    const badgeCls = ['paid','success'].includes(p.status ?? '') ? 'paid' : p.status === 'pending' ? 'pending' : 'failed'
                    return (
                      <tr key={p.id}>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {userEmail}
                        </td>
                        <td style={{ fontWeight: 600, color: '#1D9E75' }}>
                          {p.amount != null ? `RM${p.amount.toFixed(2)}` : '—'}
                        </td>
                        <td>
                          <span className={`badge badge-${badgeCls}`}>
                            {p.status ?? '—'}
                          </span>
                        </td>
                        <td style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                          {fmtDate(p.created_at ?? null)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Download — Statistik */}
        <div className="ad-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: '#0F1923' }}>
              Download — Statistik
            </h2>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{stats.totalDownloads} jumlah</span>
          </div>

          {stats.dlTopFiles.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Tiada download lagi</p>
          ) : (
            <>
              {/* Top 5 files */}
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10 }}>
                Top 5 Fail
              </p>
              <div style={{ marginBottom: 20 }}>
                {stats.dlTopFiles.map(([filename, count], i) => {
                  const maxCount = stats.dlTopFiles[0][1]
                  const pct = (count / maxCount) * 100
                  return (
                    <div key={filename} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                      <span style={{ fontSize: 10, color: '#D1D5DB', width: 12, textAlign: 'right', flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#374151' }}>
                            {filename.replace(/-v\d+\.txt$/i, '')}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#1D9E75' }}>{count}</span>
                        </div>
                        <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#1D9E75', borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Module + Niche breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10 }}>
                    Ikut Modul
                  </p>
                  {stats.dlModuleStats.map(([mod, count]) => {
                    const maxCount = stats.dlModuleStats[0]?.[1] ?? 1
                    const pct = (count / maxCount) * 100
                    return (
                      <div key={mod} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: '#374151', fontWeight: 500 }}>{mod}</span>
                          <span style={{ fontSize: 10, color: '#6B7280' }}>{count}</span>
                        </div>
                        <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#3B82F6', borderRadius: 2 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10 }}>
                    Ikut Niche
                  </p>
                  {stats.dlNicheStats.map(([niche, count]) => {
                    const maxCount = stats.dlNicheStats[0]?.[1] ?? 1
                    const pct = (count / maxCount) * 100
                    return (
                      <div key={niche} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: '#374151', fontWeight: 500 }}>{niche}</span>
                          <span style={{ fontSize: 10, color: '#6B7280' }}>{count}</span>
                        </div>
                        <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#8B5CF6', borderRadius: 2 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/dashboard" style={{ fontSize: 12, color: '#1D9E75', textDecoration: 'none' }}>← Dashboard</a>
          <span style={{ fontSize: 12, color: '#E5E7EB' }}>|</span>
          <a href="/" style={{ fontSize: 12, color: '#1D9E75', textDecoration: 'none' }}>Landing Page</a>
        </div>

      </main>
    </>
  )
}
