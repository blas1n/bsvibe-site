-- BSVibe billing schema
-- Run via: Supabase Dashboard → SQL Editor → paste and execute
-- Or: npx supabase db push (if Supabase CLI configured)

-- ========== products ==========
-- Each BSVibe product (BSGateway, BSNexus, BSupervisor, BSage)
create table if not exists public.products (
  id text primary key,             -- 'bsgateway', 'bsnexus', 'bsupervisor', 'bsage'
  name text not null,              -- 'BSGateway'
  description text,
  accent_color text,               -- '#f59e0b'
  app_url text,
  tagline_ko text,
  tagline_en text,
  detail_ko text,
  detail_en text,
  icon_svg text,                   -- inline SVG markup for the product card
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========== prices ==========
-- Pricing tiers per product
-- Provider-agnostic: stripe_price_id and toss_price_id are nullable
create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete cascade,
  tier text not null,              -- 'free', 'pro', 'enterprise'
  display_name text not null,      -- 'Free', 'Pro', 'Enterprise'
  description text,
  amount_krw int,                  -- 가격 (KRW), null이면 'TBD' 또는 'Contact'
  amount_usd_cents int,            -- 가격 (USD cents)
  currency text default 'KRW',     -- 표시 통화
  billing_period text default 'month',  -- 'month', 'year', 'one_time'
  features jsonb default '[]'::jsonb,    -- ["Feature 1", "Feature 2"]
  features_en jsonb default '[]'::jsonb, -- English features
  is_highlighted boolean default false,
  is_contact_only boolean default false, -- 'Contact us' tier
  display_order int default 0,
  stripe_price_id text,            -- Stripe Price ID (set after creating in Stripe Dashboard)
  toss_billing_key text,           -- Toss billing key reference
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_prices_product_id on public.prices(product_id);
create index if not exists idx_prices_active on public.prices(is_active) where is_active = true;

-- ========== subscriptions ==========
-- User subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,           -- references auth.users(id)
  price_id uuid references public.prices(id),
  provider text not null,          -- 'stripe' or 'toss'
  provider_subscription_id text,   -- Stripe sub_xxx or Toss billing key
  provider_customer_id text,       -- Stripe cus_xxx or Toss customer key
  status text not null,            -- 'active', 'canceled', 'past_due', 'trialing', 'incomplete'
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create unique index if not exists idx_subscriptions_provider_id on public.subscriptions(provider, provider_subscription_id) where provider_subscription_id is not null;

-- ========== payment_history ==========
-- Payment events (succeeded, failed, refunded)
create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null,
  provider_payment_id text,        -- Stripe charge_xxx or Toss paymentKey
  amount int not null,             -- in smallest unit (KRW won, USD cents)
  currency text not null default 'KRW',
  status text not null,            -- 'succeeded', 'failed', 'pending', 'refunded'
  description text,
  metadata jsonb default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_payment_history_user_id on public.payment_history(user_id);
create index if not exists idx_payment_history_subscription_id on public.payment_history(subscription_id);

-- ========== updated_at trigger ==========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists prices_updated_at on public.prices;
create trigger prices_updated_at before update on public.prices
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ========== RLS policies ==========
-- products and prices: public read, no write (managed via service role)
alter table public.products enable row level security;
alter table public.prices enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
  for select using (is_active = true);

drop policy if exists "Public can read active prices" on public.prices;
create policy "Public can read active prices" on public.prices
  for select using (is_active = true);

-- subscriptions and payment_history: only owner can read
alter table public.subscriptions enable row level security;
alter table public.payment_history enable row level security;

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can read own payment history" on public.payment_history;
create policy "Users can read own payment history" on public.payment_history
  for select using (auth.uid() = user_id);

-- ========== seed data ==========
insert into public.products (id, name, accent_color, app_url, tagline_ko, tagline_en, detail_ko, detail_en, icon_svg, display_order) values
  ('bsgateway', 'BSGateway', '#f59e0b', 'https://gateway.bsvibe.dev',
   '어떤 모델이 좋을지, 고민하지 않아도 됩니다.',
   'Stop choosing models. The right one is picked for you.',
   '스마트 라우팅', 'Smart Routing',
   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h4l3-9 3 18 3-9h4"/></svg>',
   1),
  ('bsnexus', 'BSNexus', '#3b82f6', 'https://nexus.bsvibe.dev',
   '아이디어만 던지면, 알아서 만들어집니다.',
   'Throw an idea in, and it builds itself.',
   '프로젝트 매니저', 'Project Manager',
   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4M10 17.5h4M6.5 10v4M17.5 10v4"/></svg>',
   2),
  ('bsupervisor', 'BSupervisor', '#f43f5e', 'https://supervisor.bsvibe.dev',
   '잠든 사이에도, 묵묵히 지켜보고 있습니다.',
   'Watching quietly, even while you sleep.',
   '안전 모니터링', 'Safety Monitoring',
   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
   3),
  ('bsage', 'BSage', '#10b981', 'https://sage.bsvibe.dev',
   '정리하지 않아도, 기억하고 연결해 줍니다.',
   'Remembers and connects — no organizing needed.',
   '당신보다 당신을 잘 아는 비서', 'The assistant that knows you better than you',
   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 2 20 2s-1.7 5.3-4 9.5C14 15 11 20 11 20z"/><path d="M6.7 17.3s2.1-3.1 5.3-7.3"/></svg>',
   4)
on conflict (id) do nothing;

-- Free tier (always available)
insert into public.prices (product_id, tier, display_name, description, amount_krw, amount_usd_cents, billing_period, features, features_en, display_order)
values
  ('bsgateway', 'free', 'Free', '개인 프로젝트에 적합', 0, 0, 'month',
   '["월 10,000 API 호출", "기본 라우팅", "커뮤니티 지원"]'::jsonb,
   '["10,000 API calls/mo", "Basic routing", "Community support"]'::jsonb, 1),
  ('bsnexus', 'free', 'Free', '에이전트 오케스트레이션 체험', 0, 0, 'month',
   '["에이전트 3개", "기본 템플릿", "커뮤니티 지원"]'::jsonb,
   '["3 agents", "Basic templates", "Community support"]'::jsonb, 1),
  ('bsupervisor', 'free', 'Free', '기본 감사 및 안전 모니터링', 0, 0, 'month',
   '["월 1,000 감사 로그", "기본 규칙", "커뮤니티 지원"]'::jsonb,
   '["1,000 audit logs/mo", "Basic rules", "Community support"]'::jsonb, 1),
  ('bsage', 'free', 'Free', '개인 지식 관리', 0, 0, 'month',
   '["노트 500개", "기본 검색", "커뮤니티 지원"]'::jsonb,
   '["500 notes", "Basic search", "Community support"]'::jsonb, 1);

-- Pro tier (TBD pricing — admin will set amounts later)
insert into public.prices (product_id, tier, display_name, description, amount_krw, amount_usd_cents, billing_period, features, features_en, is_highlighted, display_order)
values
  ('bsgateway', 'pro', 'Pro', '성장하는 팀을 위한 플랜', null, null, 'month',
   '["무제한 API 호출", "스마트 라우팅", "비용 최적화", "우선 지원"]'::jsonb,
   '["Unlimited API calls", "Smart routing", "Cost optimization", "Priority support"]'::jsonb, true, 2),
  ('bsnexus', 'pro', 'Pro', '팀 생산성 극대화', null, null, 'month',
   '["무제한 에이전트", "커스텀 워크플로우", "팀 협업", "우선 지원"]'::jsonb,
   '["Unlimited agents", "Custom workflows", "Team collaboration", "Priority support"]'::jsonb, true, 2),
  ('bsupervisor', 'pro', 'Pro', '고급 안전 관리', null, null, 'month',
   '["무제한 감사", "커스텀 규칙", "실시간 알림", "우선 지원"]'::jsonb,
   '["Unlimited audits", "Custom rules", "Real-time alerts", "Priority support"]'::jsonb, true, 2),
  ('bsage', 'pro', 'Pro', '고급 지식 연결', null, null, 'month',
   '["무제한 노트", "온톨로지 연결", "AI 요약", "우선 지원"]'::jsonb,
   '["Unlimited notes", "Ontology linking", "AI summaries", "Priority support"]'::jsonb, true, 2);

-- Enterprise tier (contact only)
insert into public.prices (product_id, tier, display_name, description, billing_period, features, features_en, is_contact_only, display_order)
values
  ('bsgateway', 'enterprise', 'Enterprise', '대규모 조직을 위한 맞춤 플랜', 'month',
   '["전용 인프라", "SLA 보장", "전담 매니저", "커스텀 통합"]'::jsonb,
   '["Dedicated infra", "SLA guarantee", "Dedicated manager", "Custom integrations"]'::jsonb, true, 3),
  ('bsnexus', 'enterprise', 'Enterprise', '조직 전체의 AI 오케스트레이션', 'month',
   '["전용 인프라", "감사 로그", "SSO 연동", "커스텀 통합"]'::jsonb,
   '["Dedicated infra", "Audit logs", "SSO integration", "Custom integrations"]'::jsonb, true, 3),
  ('bsupervisor', 'enterprise', 'Enterprise', '엔터프라이즈급 AI 거버넌스', 'month',
   '["규정 준수 보고", "SOC2 지원", "전담 매니저", "커스텀 정책"]'::jsonb,
   '["Compliance reports", "SOC2 support", "Dedicated manager", "Custom policies"]'::jsonb, true, 3),
  ('bsage', 'enterprise', 'Enterprise', '조직 지식 플랫폼', 'month',
   '["팀 지식 공유", "접근 제어", "전담 매니저", "API 통합"]'::jsonb,
   '["Team sharing", "Access control", "Dedicated manager", "API integration"]'::jsonb, true, 3);
