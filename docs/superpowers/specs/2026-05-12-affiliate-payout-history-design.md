# Design: Sejarah Bayaran Komisyen Affiliate

**Tarikh:** 2026-05-12
**Skop:** Tambah segmen sejarah bayaran komisyen (dibuat oleh admin) pada halaman affiliate user.

---

## Masalah

Halaman affiliate user kini hanya menunjukkan jumlah agregat (total_withdrawn). Tiada senarai bayaran individu yang pernah dibuat oleh admin, dan tiada tarikh bayaran direkodkan. User tidak dapat tahu bila dan berapa banyak komisyen yang telah dibayar kepada mereka.

---

## Penyelesaian

Tambah table `affiliate_payouts` untuk log setiap payout event, kemaskini payout route supaya insert rekod ke table ini, dan paparkan senarai bayaran pada halaman affiliate.

---

## Komponen

### 1. Migration SQL — Table Baru `affiliate_payouts`

```sql
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

create policy "payouts_via_affiliate" on public.affiliate_payouts
  for select using (
    exists (
      select 1 from public.affiliates
      where id = affiliate_id and user_id = auth.uid()
    )
  );
```

Kolum:
- `amount` — jumlah komisyen yang dibayar (RM)
- `method` — 'manual' atau 'toyyibpay'
- `note` — nota pilihan dari admin
- `paid_at` — timestamp bayaran (default now())

### 2. Update Payout Route — `/api/admin/affiliate/payout`

Selepas berjaya update affiliates dan mark conversions sebagai paid, tambah:

```ts
await admin
  .from('affiliate_payouts')
  .insert({
    affiliate_id,
    amount: pending,
    method,
    note,
  })
```

Kegagalan insert log payout tidak patut batalkan payout yang berjaya — log error sahaja.

### 3. Update Server Page — `app/(dashboard)/dashboard/affiliate/page.tsx`

Fetch senarai payouts untuk affiliate semasa:

```ts
const { data: payouts } = await supabase
  .from('affiliate_payouts')
  .select('id, amount, method, note, paid_at')
  .eq('affiliate_id', affiliate.id)
  .order('paid_at', { ascending: false })
  .limit(20)
```

Pass sebagai props ke `AffiliateClient`:

```tsx
<AffiliateClient
  affiliate={affiliate}
  refUrl={...}
  appUrl={appUrl}
  payouts={payouts ?? []}
/>
```

### 4. Update Client — `components/AffiliateClient.tsx`

Tambah prop baru:

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

Tambah segmen UI baru di bawah bahagian Statistik (hanya papar jika `displayAffiliate` ada):

```
╔══════════════════════════════════╗
║  Sejarah Bayaran Komisyen        ║
╠══════════════════════════════════╣
║  RM76.00  · Manual  12 Mei 2026  ║
║  RM38.00  · Manual  1 Apr 2026   ║
╚══════════════════════════════════╝
```

- Jika `payouts` kosong: "Tiada bayaran komisyen lagi"
- Format tarikh: `dd MMM yyyy` (Bahasa Malaysia / ms-MY locale)
- Method dipapar dengan huruf besar pertama
- Ikut design system sedia ada (glass card, var(--accent), etc.)

---

## Aliran Data

```
Admin klik "Bayar" di admin panel
  → POST /api/admin/affiliate/payout
  → Update affiliates (pending → withdrawn)
  → Mark affiliate_conversions as 'paid'
  → Insert ke affiliate_payouts (baru)

User buka halaman /dashboard/affiliate
  → affiliate/page.tsx fetch affiliate + payouts (SSR)
  → Pass ke AffiliateClient sebagai props
  → Papar segmen "Sejarah Bayaran Komisyen"
```

---

## Had & Keputusan

- **SSR sahaja** — tiada client-side fetch / refresh button. Data segar setiap kali page diload. Cukup untuk MVP.
- **Kegagalan insert log** tidak batalkan payout — payout tetap berjaya, error dilog sahaja.
- **Limit 20 rekod** — cukup untuk MVP, boleh tambah pagination kemudian.
- **RLS** — user hanya boleh baca rekod payout affiliate mereka sendiri.

---

## Fail yang Terlibat

1. `supabase/migrations/002_affiliate_payouts.sql` — migration baru
2. `app/api/admin/affiliate/payout/route.ts` — tambah insert ke affiliate_payouts
3. `app/(dashboard)/dashboard/affiliate/page.tsx` — fetch payouts, pass ke client
4. `components/AffiliateClient.tsx` — tambah prop payouts + segmen UI
