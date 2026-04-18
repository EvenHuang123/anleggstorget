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
  gravemaskin: { label: 'Gravemaskiner', icon: '🏗️' },
  traktor: { label: 'Traktorer', icon: '🚜' },
  hjullaster: { label: 'Hjullastere', icon: '🚛' },
  dumper: { label: 'Dumpere', icon: '🚧' },
  kranbil: { label: 'Kranbiler', icon: '🏗️' },
  skogsutstyr: { label: 'Skogsutstyr', icon: '🌲' },
  annet: { label: 'Annet', icon: '⚙️' },
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

export function getListingImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/placeholder-machine.svg'
  if (imagePath.startsWith('http')) return imagePath
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${imagePath}`
}
