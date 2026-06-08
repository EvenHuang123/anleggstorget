-- Category migration for Anleggstorget
-- Run once in Supabase SQL Editor (service role or postgres user)
-- Safe to re-run: all statements use IF NOT EXISTS / CASE

-- ── STEG 1: Legg til subcategory-kolonne ──────────────────────────────────────

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- ── STEG 2: Konverter enum → text (hopp over hvis allerede gjort) ─────────────
-- Kjør bare hvis category-kolonnen fortsatt er av enum-type:
--
--   ALTER TABLE public.listings ALTER COLUMN category TYPE TEXT;
--
--   UPDATE public.listings SET category = CASE category
--     WHEN 'gravemaskin'    THEN 'Gravemaskiner'
--     WHEN 'hjullaster'     THEN 'Hjullastere'
--     WHEN 'teleskoplaster' THEN 'Hjullastere'
--     WHEN 'kompaktlaster'  THEN 'Kompaktmaskiner'
--     WHEN 'kompaktmaskin'  THEN 'Kompaktmaskiner'
--     WHEN 'dumper'         THEN 'Dumpers'
--     WHEN 'kranbil'        THEN 'Kraner og løft'
--     WHEN 'kran'           THEN 'Kraner og løft'
--     WHEN 'betong'         THEN 'Komprimering og asfalt'
--     WHEN 'traktor'        THEN 'Annet'
--     WHEN 'skogsutstyr'    THEN 'Annet'
--     ELSE 'Annet'
--   END;
--
--   DROP TYPE IF EXISTS listing_category;

-- ── STEG 3: Oppdater NASTA-listings med riktig kategori ──────────────────────

-- Gravemaskiner
UPDATE public.listings
  SET category = 'Gravemaskiner'
  WHERE source = 'nasta'
    AND category NOT IN ('Gravemaskiner','Hjullastere','Dumpers','Truck og lager',
                         'Kompaktmaskiner','Kraner og løft','Komprimering og asfalt','Annet')
    AND (
      LOWER(title) LIKE '%graver%'
      OR LOWER(title) LIKE '%excavator%'
      OR LOWER(title) LIKE '%gravmaskin%'
    );

-- Hjullastere
UPDATE public.listings
  SET category = 'Hjullastere'
  WHERE source = 'nasta'
    AND category NOT IN ('Gravemaskiner','Hjullastere','Dumpers','Truck og lager',
                         'Kompaktmaskiner','Kraner og løft','Komprimering og asfalt','Annet')
    AND (
      LOWER(title) LIKE '%hjullaster%'
      OR LOWER(title) LIKE '%wheel loader%'
    );

-- Dumpers
UPDATE public.listings
  SET category = 'Dumpers'
  WHERE source = 'nasta'
    AND category NOT IN ('Gravemaskiner','Hjullastere','Dumpers','Truck og lager',
                         'Kompaktmaskiner','Kraner og løft','Komprimering og asfalt','Annet')
    AND (
      LOWER(title) LIKE '%dumper%'
      OR LOWER(title) LIKE '%articulated truck%'
    );

-- Truck og lager
UPDATE public.listings
  SET category = 'Truck og lager'
  WHERE source = 'nasta'
    AND category NOT IN ('Gravemaskiner','Hjullastere','Dumpers','Truck og lager',
                         'Kompaktmaskiner','Kraner og løft','Komprimering og asfalt','Annet')
    AND (
      LOWER(title) LIKE '%gaffeltruck%'
      OR LOWER(title) LIKE '%forklift%'
      OR LOWER(title) LIKE '%lagertruck%'
      OR LOWER(title) LIKE '%trekktruck%'
    );

-- Kompaktmaskiner
UPDATE public.listings
  SET category = 'Kompaktmaskiner'
  WHERE source = 'nasta'
    AND category NOT IN ('Gravemaskiner','Hjullastere','Dumpers','Truck og lager',
                         'Kompaktmaskiner','Kraner og løft','Komprimering og asfalt','Annet')
    AND (
      LOWER(title) LIKE '%kompaktlaster%'
      OR LOWER(title) LIKE '%skidsteer%'
      OR LOWER(title) LIKE '%bobcat%'
      OR LOWER(title) LIKE '%teleskoplaster%'
      OR LOWER(title) LIKE '%telehandler%'
    );

-- Kraner og løft
UPDATE public.listings
  SET category = 'Kraner og løft'
  WHERE source = 'nasta'
    AND category NOT IN ('Gravemaskiner','Hjullastere','Dumpers','Truck og lager',
                         'Kompaktmaskiner','Kraner og løft','Komprimering og asfalt','Annet')
    AND (
      LOWER(title) LIKE '%kran%'
      OR LOWER(title) LIKE '%crane%'
      OR LOWER(title) LIKE '%personløfter%'
      OR LOWER(title) LIKE '%lift%'
    );

-- Komprimering og asfalt
UPDATE public.listings
  SET category = 'Komprimering og asfalt'
  WHERE source = 'nasta'
    AND category NOT IN ('Gravemaskiner','Hjullastere','Dumpers','Truck og lager',
                         'Kompaktmaskiner','Kraner og løft','Komprimering og asfalt','Annet')
    AND (
      LOWER(title) LIKE '%vals%'
      OR LOWER(title) LIKE '%roller%'
      OR LOWER(title) LIKE '%asfalt%'
      OR LOWER(title) LIKE '%compactor%'
      OR LOWER(title) LIKE '%fres%'
    );

-- Annet: fange opp det som gjenstår med gamle enum-verdier
UPDATE public.listings
  SET category = 'Annet'
  WHERE category IN ('traktor','skogsutstyr','skogsmaskiner','betong','annet','');

-- Normalisér alle resterende ukjente verdier til 'Annet'
UPDATE public.listings
  SET category = 'Annet'
  WHERE category NOT IN (
    'Gravemaskiner','Hjullastere','Dumpers',
    'Kompaktmaskiner','Kraner og løft','Komprimering og asfalt','Annet'
  );

-- ── ENDRING 2: Soft-delete eksisterende Hesselberg truck-listings ─────────────
-- Se hvilke som finnes:
SELECT id, title, subcategory, status, created_at
FROM public.listings
WHERE source = 'hesselberg'
  AND subcategory IN ('Gaffeltruck', 'Lagertruck', 'Trekktruck')
ORDER BY created_at DESC;

-- Soft-delete (fjerner fra public, beholdes i DB for audit):
UPDATE public.listings
  SET status = 'draft'
  WHERE source = 'hesselberg'
    AND subcategory IN ('Gaffeltruck', 'Lagertruck', 'Trekktruck');

-- Alternativt: hard-delete (irreversibelt):
-- DELETE FROM public.listings
--   WHERE source = 'hesselberg'
--   AND subcategory IN ('Gaffeltruck', 'Lagertruck', 'Trekktruck');

-- ── Verifiser resultater ───────────────────────────────────────────────────────
SELECT category, COUNT(*) AS antall
FROM public.listings
GROUP BY category
ORDER BY antall DESC;
