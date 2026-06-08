/**
 * Master category constants for Anleggstorget.
 *
 * DB migration — run once in Supabase SQL Editor before deploying:
 *
 *   -- 1. Convert enum → text (enum values cast to text automatically)
 *   ALTER TABLE public.listings ALTER COLUMN category TYPE TEXT;
 *
 *   -- 2. Migrate old enum values to new category strings
 *   UPDATE public.listings SET category = CASE category
 *     WHEN 'gravemaskin'    THEN 'Gravemaskiner'
 *     WHEN 'hjullaster'     THEN 'Hjullastere'
 *     WHEN 'teleskoplaster' THEN 'Hjullastere'
 *     WHEN 'kompaktlaster'  THEN 'Kompaktmaskiner'
 *     WHEN 'dumper'         THEN 'Dumpers'
 *     WHEN 'kranbil'        THEN 'Kraner og løft'
 *     WHEN 'betong'         THEN 'Komprimering og asfalt'
 *     WHEN 'traktor'        THEN 'Annet'
 *     WHEN 'skogsutstyr'    THEN 'Annet'
 *     ELSE 'Annet'
 *   END;
 *
 *   -- 3. Drop old type (optional cleanup)
 *   DROP TYPE IF EXISTS listing_category;
 */

export const MAIN_CATEGORIES = [
  'Gravemaskiner',
  'Hjullastere',
  'Dumpers',
  'Kompaktmaskiner',
  'Kraner og løft',
  'Komprimering og asfalt',
  'Annet',
] as const

export type MainCategory = typeof MAIN_CATEGORIES[number]

export const SUBCATEGORIES: Record<MainCategory, readonly string[]> = {
  'Gravemaskiner': [
    'Minigraver (0–6 tonn)',
    'Middelsstor graver (6–20 tonn)',
    'Stor graver (20+ tonn)',
    'Hjulgraver',
    'Beltegraver',
    'Langrekke-graver',
  ],
  'Hjullastere': [
    'Kompakt hjullaster',
    'Middelsstor hjullaster',
    'Stor hjullaster',
  ],
  'Dumpers': [
    'Minidumper',
    'Bandedumper',
    'Hjuldumper',
    'Knekkstyrt dumper',
  ],
  'Kompaktmaskiner': [
    'Kompaktlaster',
    'Teleskoplaster',
    'Teleskoptrucker',
  ],
  'Kraner og løft': [
    'Mobilkran',
    'Personløfter (saks/mast)',
    'Lastebilkran',
    'Tårnkran',
  ],
  'Komprimering og asfalt': [
    'Trommel/vals',
    'Asfaltlegger',
    'Fresemaskiner',
    'Komprimeringsmaskiner',
  ],
  'Annet': [
    'Doser og Veihøvel',
    'Pælerigg',
    'Generatorer',
    'Utstyr og tilbehør',
  ],
}

/** URL slug keys → used for ?category= param, breadcrumbs, and filter state */
export const CATEGORY_SLUGS: Record<MainCategory, string> = {
  'Gravemaskiner':           'gravemaskiner',
  'Hjullastere':             'hjullastere',
  'Dumpers':                 'dumpers',
  'Kompaktmaskiner':         'kompaktmaskiner',
  'Kraner og løft':          'kraner',
  'Komprimering og asfalt':  'komprimering',
  'Annet':                   'annet',
}

/** Reverse: slug → category name */
export const SLUG_TO_CATEGORY: Record<string, MainCategory> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([cat, slug]) => [slug, cat as MainCategory])
) as Record<string, MainCategory>

/** Legacy enum values → new category name (for unmigrated listings) */
export const LEGACY_CATEGORY_MAP: Record<string, MainCategory> = {
  gravemaskin:    'Gravemaskiner',
  hjullaster:     'Hjullastere',
  teleskoplaster: 'Hjullastere',
  kompaktlaster:  'Kompaktmaskiner',
  kompaktmaskin:  'Kompaktmaskiner',
  dumper:         'Dumpers',
  kranbil:        'Kraner og løft',
  kran:           'Kraner og løft',
  betong:         'Komprimering og asfalt',
  traktor:        'Annet',
  skogsutstyr:    'Annet',
  annet:          'Annet',
  // Truck → Annet (legacy, for any stray listings already in DB)
  'Truck og lager': 'Annet',
  gaffeltruck:    'Annet',
  lagertruck:     'Annet',
  trekktruck:     'Annet',
}

/** Resolve a raw DB category value (old or new) to a display label */
export function resolveCategory(raw: string): string {
  if (MAIN_CATEGORIES.includes(raw as MainCategory)) return raw
  return LEGACY_CATEGORY_MAP[raw] ?? 'Annet'
}
