# Affiliate Payout History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah segmen "Sejarah Bayaran Komisyen" pada halaman affiliate user yang menunjukkan setiap bayaran yang dibuat oleh admin beserta tarikh.

**Architecture:** Tambah table `affiliate_payouts` untuk log setiap payout event. Route `/api/admin/affiliate/payout` diupdate untuk insert rekod ke table ini selepas payout berjaya. Server page `affiliate/page.tsx` fetch senarai payouts dan pass sebagai props ke `AffiliateClient`, yang akan render segmen baru di bawah bahagian Statistik.

**Tech Stack:** Next.js 14 App Router, Supabase (PostgreSQL + RLS), TypeScript, Jest + @testing-library/react

---

## File Structure

| File | Action | Tanggungjawab |
|------|--------|---------------|
| `supabase/migrations/002_affiliate_payouts.sql` | Create | DDL untuk table baru + index + RLS policy |
| `app/api/admin/affiliate/payout/route.ts` | Modify | Insert rekod ke `affiliate_payouts` selepas payout berjaya |
| `app/(dashboard)/dashboard/affiliate/page.tsx` | Modify | Fetch payouts dari Supabase, pass ke AffiliateClient |
| `components/AffiliateClient.tsx` | Modify | Tambah prop `payouts` + segmen UI sejarah bayaran |
| `__tests__/affiliate-payout-route.test.ts` | Create | Test route payout (401, 404, 400, 200 + insert log) |
| `__tests__/AffiliateClient-payouts.test.tsx` | Create | Test UI: empty state + rekod bayaran dipapar |

---

## Task 1: Cipta Migration SQL untuk `affiliate_payouts`

**Files:**
- Create: `supabase/migrations/002_affiliate_payouts.sql`

- [ ] **Step 1: Cipta fail migration**

Cipta `supabase/migrations/002_affiliate_payouts.sql` dengan kandungan berikut:

```sql
-- ================================================================
-- Migration 002: affiliate_payouts table
-- Log setiap payout event yang dibuat oleh admin
-- ================================================================

create table public.affiliate_payouts (
  id           uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  amount       numeric(10,2) not null,
  method       text not null default 'manual',
  note         text,
  paid_at      timestamptz not null default now()
);

create index affiliate_payouts_affiliate_id_idx
  on public.affiliate_payouts(affiliate_id);

alter table public.affiliate_payouts enable row level security;

-- Affiliate hanya boleh baca rekod payout mereka sendiri
create policy "payouts_via_affiliate" on public.affiliate_payouts
  for select using (
    exists (
      select 1 from public.affiliates
      where id = affiliate_id and user_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Jalankan migration di Supabase**

Buka Supabase dashboard → SQL Editor → paste kandungan fail di atas → Run.

Sahkan table wujud:
```sql
select * from public.affiliate_payouts limit 1;
```
Expected: Query berjaya (0 rows).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_affiliate_payouts.sql
git commit -m "feat: add affiliate_payouts migration"
```

---

## Task 2: Test untuk payout route

**Files:**
- Create: `__tests__/affiliate-payout-route.test.ts`

- [ ] **Step 1: Tulis test fail**

Cipta `__tests__/affiliate-payout-route.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/admin/affiliate/payout/route'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/admin')

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>

function makeAuthSupabase(email: string | null) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: email ? { id: 'uid', email } : null },
      }),
    },
  }
}

function makeAdminDb(opts: {
  affiliate?: { id: string; pending_commission: number; total_withdrawn: number; total_commission: number } | null
  updateError?: boolean
  insertPayoutError?: boolean
}) {
  const insertPayoutMock = jest.fn().mockResolvedValue({
    error: opts.insertPayoutError ? { message: 'insert failed' } : null,
  })
  const updateConvEq2 = jest.fn().mockResolvedValue({ error: null })
  const updateConvEq1 = jest.fn().mockReturnValue({ eq: updateConvEq2 })
  const updateConvMock = jest.fn().mockReturnValue({ eq: updateConvEq1 })
  const updateAffEq = jest.fn().mockResolvedValue({
    error: opts.updateError ? { message: 'update failed' } : null,
  })
  const updateAffMock = jest.fn().mockReturnValue({ eq: updateAffEq })
  const maybeSingleMock = jest.fn().mockResolvedValue({
    data: opts.affiliate !== undefined ? opts.affiliate : null,
    error: opts.affiliate === undefined ? { message: 'not found' } : null,
  })
  const selectEqMock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const selectMock = jest.fn().mockReturnValue({ eq: selectEqMock })

  return {
    from: jest.fn((table: string) => {
      if (table === 'affiliates') return { select: selectMock, update: updateAffMock }
      if (table === 'affiliate_conversions') return { update: updateConvMock }
      if (table === 'affiliate_payouts') return { insert: insertPayoutMock }
      return {}
    }),
    _insertPayoutMock: insertPayoutMock,
  }
}

describe('POST /api/admin/affiliate/payout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 for non-admin user', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('hacker@evil.com') as any)
    mockCreateAdminClient.mockReturnValue(makeAdminDb({}) as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'aff-1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when affiliate_id missing', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    mockCreateAdminClient.mockReturnValue(makeAdminDb({}) as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('affiliate_id_required')
  })

  it('returns 404 when affiliate not found', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    const db = makeAdminDb({ affiliate: null })
    mockCreateAdminClient.mockReturnValue(db as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'nonexistent' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('returns 400 when pending commission is 0', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    const db = makeAdminDb({
      affiliate: { id: 'aff-1', pending_commission: 0, total_withdrawn: 0, total_commission: 0 },
    })
    mockCreateAdminClient.mockReturnValue(db as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'aff-1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('no_pending')
  })

  it('returns 200 and inserts payout log on success', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    const db = makeAdminDb({
      affiliate: { id: 'aff-1', pending_commission: 76, total_withdrawn: 0, total_commission: 76 },
    })
    mockCreateAdminClient.mockReturnValue(db as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'aff-1', method: 'manual', note: 'Bayaran terus' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.amount_paid).toBe(76)
    expect(db._insertPayoutMock).toHaveBeenCalledWith({
      affiliate_id: 'aff-1',
      amount: 76,
      method: 'manual',
      note: 'Bayaran terus',
    })
  })

  it('still returns 200 even when payout log insert fails', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    const db = makeAdminDb({
      affiliate: { id: 'aff-1', pending_commission: 38, total_withdrawn: 0, total_commission: 38 },
      insertPayoutError: true,
    })
    mockCreateAdminClient.mockReturnValue(db as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'aff-1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Jalankan test dan sahkan ia gagal**

```bash
cd /home/astro/claude-project/sidekick && npx jest __tests__/affiliate-payout-route.test.ts --no-coverage
```

Expected: Test "returns 200 and inserts payout log on success" FAIL kerana route belum insert ke `affiliate_payouts`.

---

## Task 3: Update payout route untuk log ke `affiliate_payouts`

**Files:**
- Modify: `app/api/admin/affiliate/payout/route.ts`

- [ ] **Step 1: Tambah insert ke `affiliate_payouts` selepas update berjaya**

Dalam `app/api/admin/affiliate/payout/route.ts`, cari blok selepas `await admin.from('affiliate_conversions').update(...)` dan tambah kod berikut sebelum `console.log(...)`:

```ts
  // Log payout event — kegagalan tidak batalkan payout yang berjaya
  const { error: payoutLogErr } = await admin
    .from('affiliate_payouts')
    .insert({
      affiliate_id,
      amount: pending,
      method,
      note: note || null,
    })

  if (payoutLogErr) {
    console.error('[admin/affiliate/payout] log insert error:', payoutLogErr.message)
  }
```

Fail lengkap selepas perubahan (bahagian dalam fungsi POST, selepas mark conversions as paid):

```ts
  // Log payout event — kegagalan tidak batalkan payout yang berjaya
  const { error: payoutLogErr } = await admin
    .from('affiliate_payouts')
    .insert({
      affiliate_id,
      amount: pending,
      method,
      note: note || null,
    })

  if (payoutLogErr) {
    console.error('[admin/affiliate/payout] log insert error:', payoutLogErr.message)
  }

  console.log(`[admin/affiliate/payout] approved RM${pending.toFixed(2)} for ${affiliate_id} via ${method}. Note: ${note}`)

  return NextResponse.json({
    success: true,
    amount_paid: pending,
    new_withdrawn: (affiliate.total_withdrawn ?? 0) + pending,
  })
```

- [ ] **Step 2: Jalankan test dan sahkan semua lulus**

```bash
npx jest __tests__/affiliate-payout-route.test.ts --no-coverage
```

Expected: 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/affiliate/payout/route.ts __tests__/affiliate-payout-route.test.ts
git commit -m "feat: log payout events to affiliate_payouts table"
```

---

## Task 4: Test untuk AffiliateClient payouts UI

**Files:**
- Create: `__tests__/AffiliateClient-payouts.test.tsx`

- [ ] **Step 1: Tulis test fail**

Cipta `__tests__/AffiliateClient-payouts.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import AffiliateClient from '@/components/AffiliateClient'

// Mock fetch untuk handleRegister (tidak digunakan dalam test ini)
global.fetch = jest.fn()

const mockAffiliate = {
  ref_code: 'testref123',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

const mockPayouts = [
  {
    id: 'pay-1',
    amount: 76,
    method: 'manual',
    note: 'Bayaran terus',
    paid_at: '2026-05-12T10:00:00Z',
  },
  {
    id: 'pay-2',
    amount: 38,
    method: 'manual',
    note: null,
    paid_at: '2026-04-01T08:00:00Z',
  },
]

describe('AffiliateClient — sejarah bayaran', () => {
  it('menunjukkan "Tiada bayaran komisyen lagi" apabila payouts kosong', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
        payouts={[]}
      />
    )
    expect(screen.getByText('Tiada bayaran komisyen lagi')).toBeInTheDocument()
  })

  it('menunjukkan "Tiada bayaran komisyen lagi" apabila payouts tidak dihantar', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
      />
    )
    expect(screen.getByText('Tiada bayaran komisyen lagi')).toBeInTheDocument()
  })

  it('menunjukkan senarai rekod bayaran apabila payouts ada data', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
        payouts={mockPayouts}
      />
    )
    expect(screen.getByText('RM76.00')).toBeInTheDocument()
    expect(screen.getByText('RM38.00')).toBeInTheDocument()
  })

  it('menunjukkan heading "Sejarah Bayaran Komisyen" apabila affiliate ada', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
        payouts={[]}
      />
    )
    expect(screen.getByText('Sejarah Bayaran Komisyen')).toBeInTheDocument()
  })

  it('tidak menunjukkan segmen sejarah apabila tiada affiliate', () => {
    render(
      <AffiliateClient
        affiliate={null}
        refUrl={null}
        payouts={[]}
      />
    )
    expect(screen.queryByText('Sejarah Bayaran Komisyen')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Jalankan test dan sahkan ia gagal**

```bash
npx jest __tests__/AffiliateClient-payouts.test.tsx --no-coverage
```

Expected: FAIL — `payouts` prop belum ada, segmen UI belum dicipta.

---

## Task 5: Update `AffiliateClient.tsx` dengan prop dan UI payouts

**Files:**
- Modify: `components/AffiliateClient.tsx`

- [ ] **Step 1: Tambah type dan prop**

Dalam `components/AffiliateClient.tsx`, tambah type baru dan kemaskini Props (di bahagian atas fail):

```ts
type PayoutRecord = {
  id: string
  amount: number
  method: string
  note: string | null
  paid_at: string
}

type Props = {
  affiliate: AffiliateData
  refUrl: string | null
  appUrl?: string
  payouts?: PayoutRecord[]
}
```

Kemaskini signature fungsi:

```ts
export default function AffiliateClient({ affiliate, refUrl, appUrl = 'https://sidekick.my', payouts = [] }: Props) {
```

- [ ] **Step 2: Tambah segmen Sejarah Bayaran di bawah bahagian Statistik**

Dalam blok `{displayAffiliate ? ( <div className="space-y-3"> ... </div> ) : (...)}`, tambah card baru selepas card Statistik (selepas closing `</div>` bagi card grid 3 kolum):

```tsx
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.6px] mb-3" style={{ color: 'var(--text-3)' }}>
              Sejarah Bayaran Komisyen
            </p>
            {payouts.length === 0 ? (
              <p className="text-sm text-center py-3" style={{ color: 'var(--text-3)' }}>
                Tiada bayaran komisyen lagi
              </p>
            ) : (
              <div className="space-y-2">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl px-3 py-[10px]"
                    style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}
                  >
                    <div>
                      <p className="font-syne font-bold text-sm" style={{ color: 'var(--accent)' }}>
                        RM{p.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                        {p.method.charAt(0).toUpperCase() + p.method.slice(1)}
                        {p.note ? ` · ${p.note}` : ''}
                      </p>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                      {new Date(p.paid_at).toLocaleDateString('ms-MY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
```

- [ ] **Step 3: Jalankan test dan sahkan semua lulus**

```bash
npx jest __tests__/AffiliateClient-payouts.test.tsx --no-coverage
```

Expected: 5 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add components/AffiliateClient.tsx __tests__/AffiliateClient-payouts.test.tsx
git commit -m "feat: add payout history segment to affiliate page"
```

---

## Task 6: Update `affiliate/page.tsx` untuk fetch payouts

**Files:**
- Modify: `app/(dashboard)/dashboard/affiliate/page.tsx`

- [ ] **Step 1: Tambah type PayoutRecord dan fetch payouts**

Kemaskini `app/(dashboard)/dashboard/affiliate/page.tsx`:

```ts
import { createClient } from '@/lib/supabase/server'
import AffiliateClient from '@/components/AffiliateClient'

type PayoutRecord = {
  id: string
  amount: number
  method: string
  note: string | null
  paid_at: string
}

export default async function AffiliatePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: raw } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user!.id)
    .maybeSingle()

  const refCode = raw?.ref_code ?? raw?.affiliate_code ?? null

  const affiliate = raw
    ? { ref_code: refCode as string, is_active: raw.is_active ?? true, created_at: raw.created_at }
    : null

  // Fetch sejarah bayaran komisyen (SSR)
  let payouts: PayoutRecord[] = []
  if (raw?.id) {
    const { data: payoutsData } = await supabase
      .from('affiliate_payouts')
      .select('id, amount, method, note, paid_at')
      .eq('affiliate_id', raw.id)
      .order('paid_at', { ascending: false })
      .limit(20)
    payouts = (payoutsData as PayoutRecord[]) ?? []
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sidekick.my'

  return (
    <AffiliateClient
      affiliate={affiliate}
      refUrl={affiliate ? `${appUrl}/ref/${refCode}` : null}
      appUrl={appUrl}
      payouts={payouts}
    />
  )
}
```

- [ ] **Step 2: Jalankan semua test**

```bash
npx jest --no-coverage
```

Expected: Semua test PASS.

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/dashboard/affiliate/page.tsx
git commit -m "feat: fetch and pass affiliate payout history to client"
```

---

## Task 7: Verify manual dalam browser

- [ ] **Step 1: Jalankan dev server**

```bash
npm run dev
```

- [ ] **Step 2: Buka halaman affiliate**

Pergi ke `http://localhost:3000/dashboard/affiliate`.

Sahkan:
- Segmen "Sejarah Bayaran Komisyen" muncul di bawah Statistik
- Jika tiada bayaran: "Tiada bayaran komisyen lagi" dipapar
- Jika ada bayaran (selepas admin buat payout): rekod dengan amaun dan tarikh dipapar

- [ ] **Step 3: Test aliran penuh (optional)**

1. Login sebagai admin → pergi `/admin`
2. Klik bayar komisyen untuk satu affiliate
3. Login sebagai affiliate tersebut → buka `/dashboard/affiliate`
4. Sahkan rekod bayaran muncul dalam segmen Sejarah Bayaran Komisyen
