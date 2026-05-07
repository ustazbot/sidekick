-- ================================================================
-- SIDEKICK — Initial Schema Migration (Spec v1.0)
-- Run once in Supabase SQL Editor or via Supabase CLI
-- ================================================================

create extension if not exists "uuid-ossp";

-- ================================================================
-- TABLES
-- ================================================================

-- Users — extends auth.users, auto-created via trigger on signup
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  niche      text,
  role       text not null default 'user',   -- 'user' | 'beta' | 'admin'
  onboarded  boolean not null default false,
  created_at timestamptz not null default now()
);

-- Purchases — one record per ToyyibPay transaction
create table public.purchases (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.users(id) on delete set null,
  email          text not null,
  amount         numeric(10,2) not null,
  toyyibpay_ref  text,
  status         text not null default 'pending',   -- 'pending' | 'paid' | 'refunded'
  created_at     timestamptz not null default now()
);

-- Affiliates — one record per eligible user (has paid)
create table public.affiliates (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid unique not null references public.users(id) on delete cascade,
  ref_code     text unique not null,
  bank_name    text,
  bank_account text,
  bank_holder  text,
  is_active    boolean not null default false,   -- active only when bank info complete
  created_at   timestamptz not null default now()
);

-- Affiliate Conversions — commission per successful referral
create table public.affiliate_conversions (
  id           uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  purchase_id  uuid not null references public.purchases(id) on delete cascade,
  commission   numeric(10,2) not null,           -- Commission (40% of purchase amount)
  status       text not null default 'pending',  -- 'pending' | 'paid' | 'clawback'
  paid_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- Affiliate Clicks — track link clicks for analytics
create table public.affiliate_clicks (
  id           uuid primary key default uuid_generate_v4(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  ip_hash      text,                             -- hashed for privacy
  created_at   timestamptz not null default now()
);

-- Prompt Logs — track which prompts users generate (for analytics)
create table public.prompt_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  modul      text not null,    -- 'ATTRACT' | 'CAPTURE' | 'CONVERT' | 'CLOSE' | 'DEFEND' | 'AD-CREATOR'
  kad_id     text not null,    -- e.g. 'ATTRACT-REN-v1'
  platform   text,             -- 'chatgpt' | 'claude' | 'gemini'
  created_at timestamptz not null default now()
);

-- Downloads — track each .txt file download
create table public.downloads (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  kad_id     text not null,
  created_at timestamptz not null default now()
);

-- ================================================================
-- INDEXES
-- ================================================================

create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_email_idx on public.purchases(email);
create index affiliates_ref_code_idx on public.affiliates(ref_code);
create index prompt_logs_user_id_idx on public.prompt_logs(user_id);
create index prompt_logs_modul_idx on public.prompt_logs(modul);
create index prompt_logs_kad_id_idx on public.prompt_logs(kad_id);
create index affiliate_clicks_affiliate_id_idx on public.affiliate_clicks(affiliate_id);
create index affiliate_conversions_purchase_id_idx on public.affiliate_conversions(purchase_id);

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Auto-create public.users profile when auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table public.users enable row level security;
alter table public.purchases enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.prompt_logs enable row level security;
alter table public.downloads enable row level security;

-- Users: read/update own profile only
create policy "users_own_data" on public.users
  for all using (auth.uid() = id);

-- Purchases: read own purchases (insert/update via service_role in API routes)
create policy "purchases_own_data" on public.purchases
  for select using (auth.uid() = user_id);

-- Affiliates: full access to own record
create policy "affiliates_own_data" on public.affiliates
  for all using (auth.uid() = user_id);

-- Affiliate conversions: affiliate sees own conversions only
create policy "conversions_via_affiliate" on public.affiliate_conversions
  for select using (
    exists (
      select 1 from public.affiliates
      where id = affiliate_id and user_id = auth.uid()
    )
  );

-- Affiliate clicks: affiliates can log their own clicks (insert only; reads via service_role)
create policy "affiliate_clicks_insert" on public.affiliate_clicks
  for insert with check (
    exists (
      select 1 from public.affiliates
      where id = affiliate_id and user_id = auth.uid()
    )
  );

-- Prompt logs: own records only
create policy "prompt_logs_own_data" on public.prompt_logs
  for all using (auth.uid() = user_id);

-- Downloads: own records only
create policy "downloads_own_data" on public.downloads
  for all using (auth.uid() = user_id);

-- ================================================================
-- DONE
-- Tables: users, purchases, affiliates, affiliate_conversions,
--         affiliate_clicks, prompt_logs, downloads
-- Triggers: auto-create user profile on auth signup
-- RLS: all tables protected, service_role bypasses for API routes
-- ================================================================
