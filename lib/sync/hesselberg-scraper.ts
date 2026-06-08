/**
 * Hesselberg Maskin AS listing sync — scrapes brukt.hesselberg.no (Mascus platform)
 * and upserts into Supabase. Same architecture as nasta-scraper.ts.
 *
 * Prerequisites (run once in Supabase SQL Editor if not already done):
 *   ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
 *   ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS source_external_id TEXT;
 *   CREATE UNIQUE INDEX IF NOT EXISTS listings_source_external_id_idx
 *     ON public.listings(source, source_external_id)
 *     WHERE source_external_id IS NOT NULL;
 */

import { createClient } from '@supabase/supabase-js'

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL             = 'https://brukt.hesselberg.no'
const SOURCE               = 'hesselberg'
const DEFAULT_LOCATION     = 'Oslo'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SyncResult {
  created:      number
  updated:      number
  removed:      number
  totalScraped: number
  errors:       number
  durationMs:   number
}

interface ParsedListing {
  title:          string
  brand:          string | null
  model:          string | null
  year:           number | null
  category:       string
  price:          number
  priceType:      'fast_price' | 'negotiable'
  operatingHours: number | null
  weightClass:    string | null
  location:       string
  description:    string | null
  imageUrls:      string[]
  externalId:     string
}

interface DbListing {
  id:                 string
  source_external_id: string
  status:             string
  price:              number
  operating_hours:    number | null
  description:        string | null
  images:             string[]
}

// ── Category map ──────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  // Excavators
  beltegraver:          'gravemaskin',
  hjulgraver:           'gravemaskin',
  hjulgravere:          'gravemaskin',
  gravemaskiner:        'gravemaskin',
  minigravere:          'gravemaskin',
  'minigravere-7t':     'gravemaskin',
  midigravere:          'gravemaskin',
  minigraver:           'gravemaskin',
  midigraver:           'gravemaskin',
  // Wheel loaders
  hjullastere:          'hjullaster',
  hjullaster:           'hjullaster',
  // Dumpers
  dumpere:              'dumper',
  dumper:               'dumper',
  beltedumpere:         'dumper',
  beltedumper:          'dumper',
  // Tractors
  traktorer:            'traktor',
  traktor:              'traktor',
  // Crane trucks
  kranbiler:            'kranbil',
  kranbil:              'kranbil',
  // Forestry
  skogsmaskiner:        'skogsutstyr',
  skogsutstyr:          'skogsutstyr',
  // Trucks (Hesselberg-specific) — map to 'annet' since no truck category in enum
  gaffeltruck:          'annet',
  lagertruck:           'annet',
  trekktruck:           'annet',
  'elektriske-trucker': 'annet',
  'elektrisk-truck':    'annet',
  trucks:               'annet',
  truck:                'annet',
}

function mapCategory(urlSegment: string, gruppeText: string): string {
  const seg = urlSegment.toLowerCase()
  const grp = gruppeText.toLowerCase()
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (seg.includes(key)) return val
  }
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (grp.includes(key)) return val
  }
  return 'annet'
}

function inferWeightClass(totalvektKg: string): string | null {
  const kg = parseInt(totalvektKg.replace(/\D/g, ''), 10)
  if (!kg) return null
  if (kg <  5000) return 'Under 5 tonn'
  if (kg < 10000) return '5–10 tonn'
  if (kg < 20000) return '10–20 tonn'
  if (kg < 40000) return '20–40 tonn'
  return 'Over 40 tonn'
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── HTML helpers (Mascus platform — identical to NASTA) ───────────────────────

function extractH1(html: string): string | null {
  const m = html.match(/<h1[^>]*class="main_header"[^>]*>([^<]+)<\/h1>/)
  return m ? m[1].trim() : null
}

function extractDataPairs(html: string): Record<string, string> {
  const pairs: Record<string, string> = {}
  const rowRe = /<tr[^>]*class="item[^"]*"[^>]*>([\s\S]*?)<\/tr>/g
  let rowMatch: RegExpExecArray | null
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const row   = rowMatch[1]
    const spans = [...row.matchAll(/<span class="data">([\s\S]*?)<\/span>/g)]
    if (spans.length >= 2) {
      const key   = spans[0][1].replace(/<[^>]+>/g, '').trim()
      const value = spans[1][1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      if (key && value) pairs[key] = value
    }
  }
  return pairs
}

function extractImages(html: string): string[] {
  const urls: string[] = []
  const re = /data-src="(https:\/\/st\.mascus\.com\/image\/product\/large\/[^"]+)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    if (!urls.includes(m[1])) urls.push(m[1])
  }
  return urls
}

// ── Network ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

const FETCH_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
}

async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(25_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return await res.text()
    } catch (err) {
      if (i === retries - 1) throw err
      await sleep(2000 * (i + 1))
    }
  }
  throw new Error('unreachable')
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// ── Discovery ─────────────────────────────────────────────────────────────────

// Each source covers one top-level category page (no pagination needed — all
// categories currently have <18 items, which fit on one page).
const DISCOVERY_SOURCES: { startUrl: string; nextPageTemplate: string; re: RegExp }[] = [
  {
    // /hesselberg/anlegg/ aggregates all construction sub-categories (17 items)
    startUrl:        '/hesselberg/anlegg/',
    nextPageTemplate: '/hesselberg/anlegg,{page},createdate_desc,search.html',
    re: /href="(\/hesselberg\/anlegg\/[^"]+\.html)"/g,
  },
  {
    // Gaffeltrucks (forklifts) — 12 items, not shown on /anlegg/
    startUrl:        '/hesselberg/truck/gaffeltruck/',
    nextPageTemplate: '/hesselberg/truck/gaffeltruck,{page},createdate_desc,search.html',
    re: /href="(\/hesselberg\/truck\/[^"]+\.html)"/g,
  },
  {
    // Lagertrucks (warehouse trucks) — 18 items
    startUrl:        '/hesselberg/truck/lagertruck/',
    nextPageTemplate: '/hesselberg/truck/lagertruck,{page},createdate_desc,search.html',
    re: /href="(\/hesselberg\/truck\/[^"]+\.html)"/g,
  },
  {
    // Trekktrucks — 2 items
    startUrl:        '/hesselberg/truck/trekktruck/',
    nextPageTemplate: '/hesselberg/truck/trekktruck,{page},createdate_desc,search.html',
    re: /href="(\/hesselberg\/truck\/[^"]+\.html)"/g,
  },
]

async function discoverListingPaths(): Promise<{ paths: string[]; diagnostics: string }> {
  const paths = new Set<string>()
  const diag: string[] = []

  for (const source of DISCOVERY_SOURCES) {
    for (let page = 1; page <= 20; page++) {
      const urlPath = page === 1
        ? source.startUrl
        : source.nextPageTemplate.replace('{page}', String(page))
      const url = `${BASE_URL}${urlPath}`
      let html: string
      try {
        html = await fetchHtml(url)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        diag.push(`FETCH_FAIL ${urlPath}: ${msg}`)
        if (page === 1) break  // skip this source but continue with others
        break
      }

      const before = paths.size
      const re = new RegExp(source.re.source, 'g')
      let m: RegExpExecArray | null
      while ((m = re.exec(html)) !== null) paths.add(m[1])
      const added = paths.size - before

      diag.push(`${urlPath}: len=${html.length} +${added} (total=${paths.size})`)

      const nextPattern = source.nextPageTemplate.replace('{page}', String(page + 1))
      if (!html.includes(nextPattern)) break
      await sleep(400)
    }
    await sleep(300)
  }

  return { paths: [...paths], diagnostics: diag.join(' | ') }
}

// ── Parsing ───────────────────────────────────────────────────────────────────

function parseListing(html: string, listingPath: string): ParsedListing {
  // URL structure: /hesselberg/{section}/{subcategory}/{name}/{UUID}.html
  // index 3 = subcategory for both anlegg and truck paths
  // e.g. /hesselberg/anlegg/beltegraver/cat-323/UUID.html → 'beltegraver'
  //      /hesselberg/truck/gaffeltruck/linde-e25/UUID.html → 'gaffeltruck'
  const urlSegment = listingPath.split('/')[3] ?? ''
  const title      = extractH1(html) ?? 'Ukjent maskin'
  const data       = extractDataPairs(html)
  const imageUrls  = extractImages(html)

  const priceRaw  = (data['Pris eks. MVA'] ?? '').replace(/\s/g, '').replace(/NOK.*/, '')
  const price     = parseInt(priceRaw, 10) || 0
  const priceType = price === 0 ? 'negotiable' : 'fast_price'

  const year = parseInt(data['Årsmodell'] ?? '', 10) || null

  const hoursRaw = (data['Driftstimer'] ?? '').replace(/\s/g, '').replace(/t$/, '')
  const hours    = parseInt(hoursRaw, 10) || null

  const lagersted = data['Lagersted'] ?? ''
  let location    = lagersted
  const cityMatch = lagersted.match(/([A-ZÆØÅ][a-zæøå]+(?:\s[A-ZÆØÅ][a-zæøå]+)*)\s+\d{4}/)
  if (cityMatch)                  location = cityMatch[1]
  else if (lagersted.includes(',')) location = lagersted.split(',')[0].trim()
  if (!location)                  location = DEFAULT_LOCATION

  const category    = mapCategory(urlSegment, data['Gruppe'] ?? '')
  const weightClass = inferWeightClass(data['Totalvekt'] ?? '')

  const titleParts = title.split(' ')
  const brand = titleParts[0] ?? null
  const model = titleParts.slice(1).join(' ') || null

  // UUID is the last path segment: .../manitou-mt-733-easy/921d5b25-...html → 921d5b25-...
  const externalId = listingPath.split('/').pop()?.replace('.html', '') ?? listingPath

  return {
    title, brand, model, year, category, price, priceType,
    operatingHours: hours, weightClass, location,
    description: data['Beskrivelse'] ?? null,
    imageUrls, externalId,
  }
}

// ── Image upload ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uploadImages(supabase: any, imageUrls: string[], listingId: string): Promise<string[]> {
  const uploaded: string[] = []
  for (let j = 0; j < Math.min(imageUrls.length, 20); j++) {
    const url = imageUrls[j]
    const ext = url.split('.').pop()?.split('?')[0] ?? 'jpg'
    const filePath = `listings/${listingId}/${j}.${ext}`
    try {
      const buf = await fetchBuffer(url)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).storage
        .from('listing-images')
        .upload(filePath, buf, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: true,
        })
      if (!error) uploaded.push(filePath)
    } catch { /* skip failed image */ }
    await sleep(150)
  }
  return uploaded
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function syncHesselbergListings(): Promise<SyncResult> {
  const start    = Date.now()
  const sellerId = process.env.HESSELBERG_SELLER_ID
  if (!sellerId) throw new Error('HESSELBERG_SELLER_ID env var is not set')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const result: SyncResult = { created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0 }

  // 1. Fetch existing Hesselberg listings from DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('listings')
    .select('id, source_external_id, status, price, operating_hours, description, images')
    .eq('source', SOURCE) as { data: DbListing[] | null }

  const dbMap = new Map<string, DbListing>()
  for (const row of existing ?? []) {
    if (row.source_external_id) dbMap.set(row.source_external_id, row)
  }

  // 2. Discover all listing paths
  const { paths, diagnostics } = await discoverListingPaths()
  result.totalScraped = paths.length

  // If nothing was found, throw with diagnostics so it appears in sync_logs.error_message
  if (paths.length === 0) {
    throw new Error(`0 paths found. Per-source results: ${diagnostics}`)
  }

  const seenExternalIds = new Set<string>()

  // 3. Process each listing
  for (const listingPath of paths) {
    let html: string
    try {
      html = await fetchHtml(`${BASE_URL}${listingPath}`)
    } catch {
      result.errors++
      continue
    }

    const parsed = parseListing(html, listingPath)
    seenExternalIds.add(parsed.externalId)

    const existing = dbMap.get(parsed.externalId)

    if (!existing) {
      // INSERT
      const listingId = crypto.randomUUID()
      const images = await uploadImages(supabase, parsed.imageUrls, listingId)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('listings').insert({
        id:                 listingId,
        seller_id:          sellerId,
        source:             SOURCE,
        source_external_id: parsed.externalId,
        title:              parsed.title,
        category:           parsed.category,
        brand:              parsed.brand,
        model:              parsed.model,
        year:               parsed.year,
        operating_hours:    parsed.operatingHours,
        weight_class:       parsed.weightClass,
        price:              parsed.price,
        price_type:         parsed.priceType,
        location:           parsed.location,
        description:        parsed.description,
        images,
        status:             'active',
        views:              0,
        slug:               `${slugify(parsed.title)}-${listingId.slice(0, 6)}`,
      })

      if (error) result.errors++
      else       result.created++
    } else {
      // UPDATE if key fields changed
      const changed =
        existing.price           !== parsed.price ||
        existing.operating_hours !== parsed.operatingHours ||
        existing.description     !== parsed.description

      if (changed) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('listings')
          .update({
            price:           parsed.price,
            price_type:      parsed.priceType,
            operating_hours: parsed.operatingHours,
            description:     parsed.description,
          })
          .eq('id', existing.id)

        if (error) result.errors++
        else       result.updated++
      }

      // Re-activate if previously removed by sync (machine re-appeared on Hesselberg).
      // dbMap only contains source='hesselberg' rows, so this never re-activates user drafts.
      if (existing.status === 'draft') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('listings')
          .update({ status: 'active' })
          .eq('id', existing.id)
      }
    }

    await sleep(300)
  }

  // 4. Mark listings no longer on Hesselberg as draft (hidden via RLS)
  for (const [extId, row] of dbMap.entries()) {
    if (!seenExternalIds.has(extId) && row.status === 'active') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('listings')
        .update({ status: 'draft' })
        .eq('id', row.id)
      result.removed++
    }
  }

  result.durationMs = Date.now() - start
  return result
}

export async function writeHesselbergSyncLog(
  result: SyncResult,
  status: 'success' | 'error',
  errorMessage?: string,
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('sync_logs').insert({
    source:        SOURCE,
    status,
    created_count: result.created,
    updated_count: result.updated,
    removed_count: result.removed,
    total_scraped: result.totalScraped,
    error_message: errorMessage ?? null,
    duration_ms:   result.durationMs,
  })
}
