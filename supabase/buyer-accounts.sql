-- ─────────────────────────────────────────────────────────────────────────────
-- Åpne for privatkjøpere: kjøpere (buyer) kan kjøpe, kun selgere (seller) kan selge.
-- Kjør én gang i Supabase SQL Editor.
--
-- Tabellen heter `profiles` (ikke users/sellers). profiles.id === auth.users.id.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. account_type: 'buyer' | 'seller' | 'admin'. Default 'seller' bevarer eksisterende
--    oppførsel — alle nåværende brukere er bedrifter/selgere.
alter table public.profiles
  add column if not exists account_type text
  default 'seller'
  check (account_type in ('buyer', 'seller', 'admin'));

-- 2. org_number må kunne være NULL — privatkjøpere har ikke org.nr.
--    (Selgere får fortsatt org.nr verifisert mot Brønnøysund i registreringsflyten.)
alter table public.profiles
  alter column org_number drop not null;

-- 3. Backfill: alle eksisterende profiler er selgere.
update public.profiles set account_type = 'seller' where account_type is null;

-- 4. Server-side håndhevelse (defense-in-depth): kun selgere kan opprette annonser.
--    Annonseinnsetting skjer klient-direkte via supabase-js, så RLS er den reelle
--    server-vakten. Klient-UI skjuler i tillegg knappene.
--
--    NB: Kjør kun hvis listings har RLS aktivert. Sjekk eksisterende policies først
--    (Dashboard → Authentication → Policies) så du ikke overskriver en fungerende
--    insert-policy for selgere.
--
-- alter table public.listings enable row level security;
--
-- drop policy if exists "Kun selgere kan opprette annonser" on public.listings;
-- create policy "Kun selgere kan opprette annonser"
--   on public.listings for insert to authenticated
--   with check (
--     exists (
--       select 1 from public.profiles p
--       where p.id = auth.uid() and p.account_type in ('seller', 'admin')
--     )
--   );
