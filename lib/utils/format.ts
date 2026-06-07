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
  gravemaskin:    { label: 'Gravemaskiner',    icon: '🏗️' },
  dumper:         { label: 'Dumpere',          icon: '🚧' },
  hjullaster:     { label: 'Hjullastere',      icon: '🚛' },
  teleskoplaster: { label: 'Teleskoplastere',  icon: '🚜' },
  kompaktlaster:  { label: 'Kompaktlastere',   icon: '🚛' },
  kompaktmaskin:  { label: 'Kompaktmaskiner',  icon: '⚙️' },
  traktor:        { label: 'Traktorer',        icon: '🚜' },
  kranbil:        { label: 'Kranbiler',        icon: '🏗️' },
  kran:           { label: 'Kraner og løft',   icon: '🏗️' },
  skogsutstyr:    { label: 'Skogsutstyr',      icon: '🌲' },
  betong:         { label: 'Betongmaskiner',   icon: '🏗️' },
  annet:          { label: 'Annet',            icon: '⚙️' },
}

export interface CategoryNode {
  label: string
  /** DB enum values that belong to this tree node */
  dbValues: string[]
  subcategories: Record<string, string>
}

/** Two-level category tree used in filters and the wizard */
export const CATEGORY_TREE: Record<string, CategoryNode> = {
  gravemaskin: {
    label: 'Gravemaskiner',
    dbValues: ['gravemaskin'],
    subcategories: {
      minigraver:  'Minigraver (0–6 tonn)',
      midigraver:  'Middelsstor graver (6–20 tonn)',
      storgraver:  'Stor graver (20+ tonn)',
      langrekke:   'Langrekke-graver',
      sumpgraver:  'Sumpgraver',
    },
  },
  hjullaster: {
    label: 'Hjullastere',
    dbValues: ['hjullaster', 'teleskoplaster'],
    subcategories: {
      kompakt:     'Kompakt hjullaster',
      mellomstor:  'Middelsstor hjullaster',
      stor:        'Stor hjullaster',
      teleskop:    'Teleskophjullaster',
      gaffeltruck: 'Gaffeltruck (utendørs)',
    },
  },
  dumper: {
    label: 'Dumpere',
    dbValues: ['dumper'],
    subcategories: {
      minidumper:  'Minidumper (under 3 tonn)',
      bandedumper: 'Bandedumper',
      hjuldumper:  'Hjuldumper',
      knekkstyrt:  'Knekkstyrt dumper',
    },
  },
  kompaktmaskin: {
    label: 'Kompaktmaskiner',
    dbValues: ['kompaktlaster', 'kompaktmaskin', 'betong'],
    subcategories: {
      kompaktlaster:   'Kompaktlaster (bobcat-type)',
      teleskoplaster2: 'Teleskoplaster',
      trommel:         'Trommel/vals',
      groftegravet:    'Grøftegraver',
    },
  },
  kran: {
    label: 'Kraner og løft',
    dbValues: ['kranbil', 'kran'],
    subcategories: {
      mobilkran:    'Mobilkran',
      tarnkran:     'Tårnkran',
      personlofter: 'Personløfter (saks/mast)',
      lastebilkran: 'Lastebilkran (fastkran)',
    },
  },
  annet: {
    label: 'Annet utstyr',
    dbValues: ['annet', 'traktor', 'skogsutstyr'],
    subcategories: {
      asfaltlegger:  'Asfaltlegger',
      fresemaskiner: 'Fresemaskiner',
      palerrigg:     'Pælerigg',
      generator:     'Generatorer',
      annet_utstyr:  'Annet utstyr',
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
  gravemaskin: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=75',
  traktor: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=75',
  hjullaster: 'https://images.unsplash.com/photo-1625231334168-35067f8853ed?w=800&q=75',
  dumper: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=75',
  kranbil: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=75',
  skogsutstyr: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=75',
  betong: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75',
  annet: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=75',
}

export function getListingImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/placeholder-machine.svg'
  if (imagePath.startsWith('http')) return imagePath
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${imagePath}`
}

export function getListingFallbackImage(category: string): string {
  return CATEGORY_FALLBACK_IMAGES[category] ?? CATEGORY_FALLBACK_IMAGES.annet
}
