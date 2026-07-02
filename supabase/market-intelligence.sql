-- ─────────────────────────────────────────────────────────────────────────────
-- Market Intelligence — run once in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Annonse-visninger (anonym, ingen persondata)
create table if not exists listing_views (
  id           uuid        primary key default gen_random_uuid(),
  listing_id   uuid        references listings(id) on delete cascade,
  viewed_at    timestamptz default now(),
  referrer     text,
  device_type  text        -- 'mobile' | 'desktop' | 'tablet'
);
create index if not exists idx_listing_views_listing on listing_views(listing_id);
create index if not exists idx_listing_views_date    on listing_views(viewed_at);

-- 2. Søkespørringer (anonym, ingen persondata)
create table if not exists search_queries (
  id            uuid        primary key default gen_random_uuid(),
  query         text        not null,
  results_count int         not null,
  filters       jsonb,
  searched_at   timestamptz default now()
);
create index if not exists idx_search_queries_date  on search_queries(searched_at);
create index if not exists idx_search_queries_query on search_queries(query);

-- 3. Prishistorikk
create table if not exists price_history (
  id          uuid        primary key default gen_random_uuid(),
  listing_id  uuid        references listings(id) on delete cascade,
  old_price   numeric,
  new_price   numeric,
  changed_at  timestamptz default now()
);
create index if not exists idx_price_history_listing on price_history(listing_id);
create index if not exists idx_price_history_date    on price_history(changed_at);

-- 4. Legg til markedstid-kolonner på listings
alter table listings add column if not exists first_seen_at timestamptz default now();
alter table listings add column if not exists delisted_at   timestamptz;

-- Backfill: eksisterende rader får first_seen_at = created_at
update listings set first_seen_at = created_at where first_seen_at is null;

-- 5. Legg til 'delisted' i status-enum (safe — ADD VALUE er idempotent i Postgres 12+)
do $$ begin
  alter type listing_status add value if not exists 'delisted';
exception when others then null;
end $$;

-- 6. RLS — service-role key bypasser RLS, men aktiver likevel for fremtidig bruk
alter table listing_views  enable row level security;
alter table search_queries enable row level security;
alter table price_history  enable row level security;
