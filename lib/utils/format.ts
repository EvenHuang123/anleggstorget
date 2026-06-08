export function formatPrice(amount: number, type?: string): string {
  const formatted = new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(amount)

  if (type === 'negotiable') return `${formatted} (forhandlingsbar)`
  if (type === 'auction') return `Fra ${formatted}`
  return formatted
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('nb-NO').format(n)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 2) return 'Akkurat nå'
  if (diffMins < 60) return `${diffMins} min siden`
  if (diffHours < 24) return `${diffHours} time${diffHours > 1 ? 'r' : ''} siden`
  if (diffDays === 1) return 'I går'
  if (diffDays < 7) return `${diffDays} dager siden`
  return formatDate(dateStr)
}

export function formatHours(hours: number): string {
  return `${formatNumber(hours)} timer`
}

export const CATEGORIES: Record<string, { label: string; icon: string }> = {
  // New category strings (post-migration)
  'Gravemaskiner':          { label: 'Gravemaskiner',          icon: '🏗️' },
  'Hjullastere':            { label: 'Hjullastere',            icon: '🚛' },
  'Dumpers':                { label: 'Dumpere',                icon: '🚧' },
  'Kompaktmaskiner':        { label: 'Kompaktmaskiner',        icon: '⚙️' },
  'Kraner og løft':         { label: 'Kraner og løft',         icon: '🏗️' },
  'Komprimering og asfalt': { label: 'Komprimering og asfalt', icon: '🛣️' },
  'Annet':                  { label: 'Annet',                  icon: '⚙️' },
  // Legacy enum values — shown correctly until DB migration is run
  gravemaskin:    { label: 'Gravemaskiner',          icon: '🏗️' },
  dumper:         { label: 'Dumpere',                icon: '🚧' },
  hjullaster:     { label: 'Hjullastere',            icon: '🚛' },
  teleskoplaster: { label: 'Hjullastere',            icon: '🚛' },
  kompaktlaster:  { label: 'Kompaktmaskiner',        icon: '⚙️' },
  kompaktmaskin:  { label: 'Kompaktmaskiner',        icon: '⚙️' },
  traktor:        { label: 'Annet',                  icon: '⚙️' },
  kranbil:        { label: 'Kraner og løft',         icon: '🏗️' },
  kran:           { label: 'Kraner og løft',         icon: '🏗️' },
  skogsutstyr:    { label: 'Annet',                  icon: '⚙️' },
  betong:         { label: 'Komprimering og asfalt', icon: '🛣️' },
  annet:          { label: 'Annet',                  icon: '⚙️' },
  // Truck → Annet fallback for stray legacy listings
  'Truck og lager': { label: 'Annet', icon: '⚙️' },
  gaffeltruck:      { label: 'Annet', icon: '⚙️' },
  lagertruck:       { label: 'Annet', icon: '⚙️' },
  trekktruck:       { label: 'Annet', icon: '⚙️' },
}

export interface CategoryNode {
  label: string
  /** DB enum values that belong to this tree node */
  dbValues: string[]
  subcategories: Record<string, string>
}

/** Two-level category tree used in filters and the listing wizard.
 *  Keys are URL slugs (?category=gravemaskiner).
 *  dbValues contains the new TEXT values stored in the DB after migration,
 *  PLUS legacy enum values so filtering works before migration is run. */
export const CATEGORY_TREE: Record<string, CategoryNode> = {
  gravemaskiner: {
    label: 'Gravemaskiner',
    dbValues: ['Gravemaskiner', 'gravemaskin'],
    subcategories: {
      minigraver:   'Minigraver (0–6 tonn)',
      midigraver:   'Middelsstor graver (6–20 tonn)',
      storgraver:   'Stor graver (20+ tonn)',
      hjulgraver:   'Hjulgraver',
      beltegraver:  'Beltegraver',
      langrekke:    'Langrekke-graver',
    },
  },
  hjullastere: {
    label: 'Hjullastere',
    dbValues: ['Hjullastere', 'hjullaster', 'teleskoplaster'],
    subcategories: {
      kompakt:    'Kompakt hjullaster',
      mellomstor: 'Middelsstor hjullaster',
      stor:       'Stor hjullaster',
    },
  },
  dumpers: {
    label: 'Dumpere',
    dbValues: ['Dumpers', 'dumper'],
    subcategories: {
      minidumper:  'Minidumper',
      bandedumper: 'Bandedumper',
      hjuldumper:  'Hjuldumper',
      knekkstyrt:  'Knekkstyrt dumper',
    },
  },
  kompaktmaskiner: {
    label: 'Kompaktmaskiner',
    dbValues: ['Kompaktmaskiner', 'kompaktlaster', 'kompaktmaskin'],
    subcategories: {
      kompaktlaster:   'Kompaktlaster',
      teleskoplaster:  'Teleskoplaster',
      teleskoptrucker: 'Teleskoptrucker',
    },
  },
  kraner: {
    label: 'Kraner og løft',
    dbValues: ['Kraner og løft', 'kranbil', 'kran'],
    subcategories: {
      mobilkran:    'Mobilkran',
      personlofter: 'Personløfter (saks/mast)',
      lastebilkran: 'Lastebilkran',
      tarnkran:     'Tårnkran',
    },
  },
  komprimering: {
    label: 'Komprimering og asfalt',
    dbValues: ['Komprimering og asfalt', 'betong'],
    subcategories: {
      trommel:              'Trommel/vals',
      asfaltlegger:         'Asfaltlegger',
      fresemaskiner:        'Fresemaskiner',
      komprimeringsmaskiner: 'Komprimeringsmaskiner',
    },
  },
  annet: {
    label: 'Annet',
    dbValues: ['Annet', 'annet', 'traktor', 'skogsutstyr'],
    subcategories: {
      doser:       'Doser og Veihøvel',
      palerrigg:   'Pælerigg',
      generator:   'Generatorer',
      utstyr:      'Utstyr og tilbehør',
    },
  },
}

/** Resolve tree keys → flat array of DB category values for Supabase .in() */
export function treeKeysToDbValues(treeKeys: string[]): string[] {
  const out = new Set<string>()
  for (const key of treeKeys) {
    const node = CATEGORY_TREE[key]
    if (node) node.dbValues.forEach(v => out.add(v))
  }
  return [...out]
}

/** Find which CATEGORY_TREE key a DB category value belongs to */
export function dbValueToTreeKey(dbCat: string): string {
  for (const [key, node] of Object.entries(CATEGORY_TREE)) {
    if (node.dbValues.includes(dbCat)) return key
  }
  return 'annet'
}

export const NORWEGIAN_COUNTIES = [
  'Agder',
  'Innlandet',
  'Møre og Romsdal',
  'Nordland',
  'Oslo',
  'Rogaland',
  'Troms og Finnmark',
  'Trøndelag',
  'Vestfold og Telemark',
  'Vestland',
  'Viken',
]

export const WEIGHT_CLASSES = [
  'Under 5 tonn',
  '5–10 tonn',
  '10–20 tonn',
  '20–40 tonn',
  'Over 40 tonn',
]

export const POPULAR_BRANDS = [
  'Volvo', 'Caterpillar', 'Komatsu', 'Liebherr', 'Hitachi',
  'Doosan', 'JCB', 'Mecalac', 'Terex', 'Kobelco',
  'John Deere', 'Case', 'New Holland', 'Claas', 'Fendt',
]

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  // New category strings
  'Gravemaskiner':          'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=75',
  'Hjullastere':            'https://images.unsplash.com/photo-1625231334168-35067f8853ed?w=800&q=75',
  'Dumpers':                'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=75',
  'Kompaktmaskiner':        'https://images.unsplash.com/photo-1625231334168-35067f8853ed?w=800&q=75',
  'Kraner og løft':         'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=75',
  'Komprimering og asfalt': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75',
  'Annet':                  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75',
  // Legacy fallbacks
  gravemaskin: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=75',
  hjullaster:  'https://images.unsplash.com/photo-1625231334168-35067f8853ed?w=800&q=75',
  dumper:      'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=75',
  kranbil:     'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=75',
  betong:      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75',
  annet:       'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75',
}

export function getListingImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/placeholder-machine.svg'
  if (imagePath.startsWith('http')) return imagePath
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${imagePath}`
}

export function getListingFallbackImage(category: string): string {
  return CATEGORY_FALLBACK_IMAGES[category] ?? CATEGORY_FALLBACK_IMAGES.annet
}
