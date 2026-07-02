/**
 * NASTA AS listing sync — scrapes bruktmarked.nasta.no and upserts into Supabase.
 *
 * SQL migration — run once in Supabase SQL Editor before first sync:
 *
 *   ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
 *   ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS source_external_id TEXT;
 *   CREATE UNIQUE INDEX IF NOT EXISTS listings_source_external_id_idx
 *     ON public.listings(source, source_external_id)
 *     WHERE source_external_id IS NOT NULL;
 *
 *   CREATE TABLE IF NOT EXISTS public.sync_logs (
 *     id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *     source        TEXT NOT NULL,
 *     status        TEXT NOT NULL,
 *     created_count INTEGER DEFAULT 0,
 *     updated_count INTEGER DEFAULT 0,
 *     removed_count INTEGER DEFAULT 0,
 *     total_scraped INTEGER DEFAULT 0,
 *     error_message TEXT,
 *     duration_ms   INTEGER,
 *     created_at    TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Service role manages sync_logs"
 *     ON public.sync_logs USING (true) WITH CHECK (true);
 */

import { createClient } from '@supabase/supabase-js'

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL        = 'https://bruktmarked.nasta.no'
const NASTA_SELLER_ID = 'fc88b0fc-ef94-4199-876c-72d97424055d'
const SOURCE          = 'nasta_as'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SyncResult {
  created:           number
  updated:           number
  removed:           number
  totalScraped:      number
  errors:            number
  durationMs:        number
  duplicatesRemoved?: number
  categoryBreakdown?: Record<string, number>
}

interface ParsedListing {
  title:           string
  brand:           string | null
  model:           string | null
  year:            number | null
  category:        string
  price:           number
  priceType:       'fast_price' | 'negotiable'
  operatingHours:  number | null
  weightClass:     string | null
  location:        string
  description:     string | null
  imageUrls:       string[]
  externalId:      string
}

interface DbListing {
  id:                 string
  source_external_id: string
  status:             string
  price:              number
  operating_hours:    number | null
  description:        string | null
  images:             string[]
  created_at:         string
}

// ── Category map ──────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  // Excavators → Gravemaskiner
  beltegraver:         'Gravemaskiner',
  'midigravere-7-12t': 'Gravemaskiner',
  midigravere:         'Gravemaskiner',
  minigravere:         'Gravemaskiner',
  hjulgravere:         'Gravemaskiner',
  gravemaskiner:       'Gravemaskiner',
  hjulgraver:          'Gravemaskiner',
  minigraver:          'Gravemaskiner',
  midigraver:          'Gravemaskiner',
  // Wheel loaders → Hjullastere
  hjullastere:         'Hjullastere',
  hjullaster:          'Hjullastere',
  // Dumpers → Dumpers
  beltedumpere:        'Dumpers',
  dumpere:             'Dumpers',
  dumper:              'Dumpers',
  beltedumper:         'Dumpers',
  // Crane trucks → Kraner og løft
  kranbiler:           'Kraner og løft',
  kranbil:             'Kraner og løft',
  // Forestry/tractors → Annet
  traktorer:           'Annet',
  traktor:             'Annet',
  skogsmaskiner:       'Annet',
  skogsutstyr:         'Annet',
  // Concrete/compaction → Annet
  betongutstyr:        'Annet',
  betong:              'Annet',
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
  return 'Annet'
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

// ── HTML helpers ──────────────────────────────────────────────────────────────

function extractH1(html: string): string | null {
  const m = html.match(/<h1[^>]*class="main_header"[^>]*>([^<]+)<\/h1>/)
  return m ? m[1].trim() : null
}

function extractDataPairs(html: string): Record<string, string> {
  const pairs: Record<string, string> = {}
  const rowRe = /<tr[^>]*class="item[^"]*"[^>]*>([\s\S]*?)<\/tr>/g
  let rowMatch: RegExpExecArray | null
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const row = rowMatch[1]
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

async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)', Accept: 'text/html' },
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err) {
      if (i === retries - 1) throw err
      await sleep(1500 * (i + 1))
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

async function discoverListingPaths(): Promise<string[]> {
  const paths = new Set<string>()
  for (let page = 1; page <= 20; page++) {
    const url = `${BASE_URL}/nastaas/search.aspx?q=&sf_categorypath=construction&Page=${page}&PageSize=12&SortBy=createdate_desc`
    let html: string
    try {
      html = await fetchHtml(url)
    } catch {
      break
    }
    const re = /href="(\/nastaas\/anlegg\/[^"]+\.html)"/g
    let m: RegExpExecArray | null
    while ((m = re.exec(html)) !== null) paths.add(m[1])
    if (!html.includes(`Page=${page + 1}`)) break
    await sleep(400)
  }
  return [...paths]
}

// ── Parsing ───────────────────────────────────────────────────────────────────

function parseListing(html: string, listingPath: string): ParsedListing {
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
  if (cityMatch)              location = cityMatch[1]
  else if (lagersted.includes(',')) location = lagersted.split(',')[0].trim()
  if (!location)              location = 'Kristiansand'

  const category    = mapCategory(urlSegment, data['Gruppe'] ?? '')
  const weightClass = inferWeightClass(data['Totalvekt'] ?? '')

  const titleParts = title.split(' ')
  const brand = titleParts[0] ?? null
  const model = titleParts.slice(1).join(' ') || null

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

export async function syncNASTAListings(): Promise<SyncResult> {
  const start = Date.now()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const result: SyncResult = { created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0 }
  const categoryBreakdown: Record<string, number> = {}

  // 1. Fetch existing NASTA listings from DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('listings')
    .select('id, source_external_id, status, price, operating_hours, description, images, created_at')
    .eq('source', SOURCE) as { data: DbListing[] | null }

  // Group by source_external_id — detect and soft-delete in-DB duplicates (keep newest)
  const rowsByExtId = new Map<string, DbListing[]>()
  for (const row of existing ?? []) {
    if (!row.source_external_id) continue
    const arr = rowsByExtId.get(row.source_external_id) ?? []
    arr.push(row)
    rowsByExtId.set(row.source_external_id, arr)
  }
  let duplicatesRemoved = 0
  const dbMap = new Map<string, DbListing>()
  for (const [extId, rows] of rowsByExtId.entries()) {
    rows.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    dbMap.set(extId, rows[0])
    for (const dup of rows.slice(1)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('listings').update({ status: 'removed_by_sync' }).eq('id', dup.id)
      duplicatesRemoved++
    }
  }

  // 2. Discover all listing paths on NASTA site
  const paths = await discoverListingPaths()
  result.totalScraped = paths.length

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
    categoryBreakdown[parsed.category] = (categoryBreakdown[parsed.category] ?? 0) + 1

    const existing = dbMap.get(parsed.externalId)

    if (!existing) {
      // INSERT
      const listingId = crypto.randomUUID()
      const images = await uploadImages(supabase, parsed.imageUrls, listingId)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('listings').insert({
        id:                 listingId,
        seller_id:          NASTA_SELLER_ID,
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
        existing.price            !== parsed.price ||
        existing.operating_hours  !== parsed.operatingHours ||
        existing.description      !== parsed.description

      if (changed) {
        // Log price change before overwriting
        if (existing.price !== parsed.price) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('price_history').insert({
            listing_id: existing.id,
            old_price:  existing.price,
            new_price:  parsed.price,
          })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('listings')
          .update({
            title:           parsed.title,
            category:        parsed.category,
            brand:           parsed.brand,
            model:           parsed.model,
            year:            parsed.year,
            price:           parsed.price,
            price_type:      parsed.priceType,
            operating_hours: parsed.operatingHours,
            description:     parsed.description,
          })
          .eq('id', existing.id)

        if (error) result.errors++
        else       result.updated++
      }

      // Re-activate if previously delisted (machine re-appeared on NASTA).
      if (existing.status === 'removed_by_sync' || existing.status === 'delisted') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('listings')
          .update({ status: 'active', delisted_at: null })
          .eq('id', existing.id)
      }
    }

    await sleep(300)
  }

  // 4. Soft-delete listings no longer on NASTA
  for (const [extId, row] of dbMap.entries()) {
    if (!seenExternalIds.has(extId) && row.status === 'active') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('listings')
        .update({ status: 'delisted', delisted_at: new Date(), updated_at: new Date() })
        .eq('id', row.id)
      result.removed++
    }
  }

  result.durationMs        = Date.now() - start
  result.duplicatesRemoved = duplicatesRemoved
  result.categoryBreakdown = categoryBreakdown
  return result
}

export async function writeSyncLog(
  result: SyncResult,
  status: 'success' | 'failed' | 'partial',
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
