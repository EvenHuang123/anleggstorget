-- ============================================================
-- Anleggstorget — retroaktiv kategoriopprydding
-- Kjør i Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- STEG 1: Flytt alle "Komprimering og asfalt" til "Annet"
UPDATE public.listings
SET category = 'Annet',
    updated_at = NOW()
WHERE category = 'Komprimering og asfalt';

-- STEG 2: Flytt legacy "betong" til "Annet"
UPDATE public.listings
SET category = 'Annet',
    updated_at = NOW()
WHERE category = 'betong';

-- STEG 3: Re-kategoriser feil-klassifiserte "Annet"-maskiner basert på tittel
-- Volvo hjullastere (L-serien) — word-boundary bug i gammel scraper
UPDATE public.listings
SET category = 'Hjullastere',
    updated_at = NOW()
WHERE category = 'Annet'
  AND (
    title ILIKE 'Volvo L[6-9]%'
    OR title ILIKE 'Volvo L1[0-9][0-9]%'
    OR title ILIKE 'Volvo L2[0-9][0-9]%'
    OR title ILIKE '%hjullaster%'
    OR title ILIKE '%wheel loader%'
    OR title ~* '\mwa[0-9]'
  );

-- Kobelco gravemaskiner (SK-serien)
UPDATE public.listings
SET category = 'Gravemaskiner',
    updated_at = NOW()
WHERE category = 'Annet'
  AND (
    title ILIKE '%kobelco%'
    OR title ~* '\msk[0-9]{2,3}'
  );

-- JCB gravemaskiner
UPDATE public.listings
SET category = 'Gravemaskiner',
    updated_at = NOW()
WHERE category = 'Annet'
  AND title ILIKE '%jcb%'
  AND title NOT ILIKE '%loadall%'
  AND title NOT ILIKE '%telehandler%';

-- Eurocomach gravemaskiner (mini-gravere)
UPDATE public.listings
SET category = 'Gravemaskiner',
    updated_at = NOW()
WHERE category = 'Annet'
  AND title ILIKE '%eurocomach%';

-- Cat skid steers (216, 226, 236, 246, 256, 272, 287)
UPDATE public.listings
SET category = 'Kompaktmaskiner',
    updated_at = NOW()
WHERE category = 'Annet'
  AND (
    title ~* '\bcat\s*2[12678][0-9]\b'
    OR title ~* '\bcat\s*289\b'
    OR title ILIKE '%bobcat%'
    OR title ILIKE '%skid steer%'
    OR title ILIKE '%skidsteer%'
  );

-- ============================================================
-- Kontroll: vis antall per kategori etter opprydding
-- ============================================================
SELECT category, COUNT(*) AS antall
FROM public.listings
WHERE status = 'active'
GROUP BY category
ORDER BY antall DESC;
