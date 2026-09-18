-- ─────────────────────────────────────────────────────────────────────────────
-- Solgte/avpubliserte annonser som permanente sider (Fase 1)
--
-- Kjør én gang i Supabase SQL Editor. Ingen ALTER TYPE: enumen `listing_status`
-- har allerede 'sold', 'reserved' og 'delisted'. 'withdrawn' brukes ikke.
-- ─────────────────────────────────────────────────────────────────────────────

-- (a) sold_at — TS-typen deklarerer den allerede, og app/selgere/[id]/page.tsx
--     sorterer på den. Kolonnen mangler i DB i dag, så den seksjonen er trolig
--     ødelagt i produksjon inntil denne kjøres.
alter table public.listings
  add column if not exists sold_at timestamptz;

-- (b) Backfill: eksisterende solgte rader får et rimelig salgstidspunkt.
update public.listings
  set sold_at = coalesce(delisted_at, updated_at)
  where status = 'sold' and sold_at is null;

-- (c) Indeks for status-filtrerte spørringer sortert på nyeste.
create index if not exists listings_status_updated_idx
  on public.listings (status, updated_at desc);

-- (d) Offentlig (anon) lesing må dekke fire statuser slik at solgte/avpubliserte
--     sider rendrer 200 i stedet for å 404-e. draft og removed_by_sync forblir
--     skjult for anon.
--
--     ⚠️ VERIFISER POLICY-NAVN FØR KJØRING:
--        select policyname, cmd, qual from pg_policies where tablename = 'listings';
--     Finn den eksisterende SELECT-policyen for anon/public (den som i dag
--     begrenser til status = 'active') og erstatt <POLICY_NAVN> under med det
--     faktiske navnet. Endre KUN offentlig lesing — ikke rør skrivepolicyene
--     (de bruker seller_id, ikke user_id).

drop policy if exists "<POLICY_NAVN>" on public.listings;

create policy "<POLICY_NAVN>"
  on public.listings
  for select
  to anon, authenticated
  using (
    status in ('active', 'sold', 'reserved', 'delisted')
  );

-- Merk: innloggede selgere trenger fortsatt å se sine egne draft/removed_by_sync
-- rader i dashbordet. Hvis en slik eier-policy finnes fra før, beholdes den —
-- denne policyen ADD-er kun offentlig lesetilgang til de fire statusene og
-- erstatter den gamle active-only-policyen. Verifiser at en eier-policy av typen
--   using (auth.uid() = seller_id)
-- fortsatt finnes for selgernes egne skjulte rader; opprett den om nødvendig.
