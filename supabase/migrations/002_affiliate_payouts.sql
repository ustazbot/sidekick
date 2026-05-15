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

grant select on public.affiliate_payouts to authenticated;
grant select, insert, update, delete on public.affiliate_payouts to service_role;

-- Affiliate hanya boleh baca rekod payout mereka sendiri
create policy "payouts_via_affiliate" on public.affiliate_payouts
  for select using (
    exists (
      select 1 from public.affiliates
      where id = affiliate_id and user_id = auth.uid()
    )
  );
