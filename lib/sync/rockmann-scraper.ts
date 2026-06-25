/**
 * Rockmann AS listing sync — scrapes finn.no/pw/search/construction?orgId=764747174
 *
 * Prerequisites (run once in Supabase SQL Editor):
 *
 *   INSERT INTO public.profiles (id, company_name, org_number, verified)
 *   VALUES (gen_random_uuid(), 'Rockmann AS', '916778947', true)
 *   RETURNING id;
 *
 *   -- Then add to Vercel env vars and .env.local:
 *   ROCKMANN_SELLER_ID=<uuid from above>
 */

import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL = 'https://www.finn.no/pw/search/construction?orgId=764747174'
const SOURCE   = 'rockmann'
const UA       = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ListingDetail {
  externalId:  string
  title:       string
  hours:       number | null
  weightClass: string | null
  status:      'created' | 'updated' | 'unchanged'
}

export interface SyncResult {
  created:           number
  updated:           number
  removed:           number
  totalScraped:      number
  errors:            number
  durationMs:        number
  details:           ListingDetail[]
  duplicatesRemoved?: number
  categoryBreakdown?: Record<string, number>
}

interface ScrapedListing {
  title:          string
  brand:          string | null
  model:          string | null
  year:           number | null
  price:          number | null
  priceType:      'fast_price' | 'negotiable'
  category:       string
  subcategory:    string
  images:         string[]
  operatingHours: number | null
  weightClass:    string | null
  externalId:     string
  location:       string
  slug:           string
}

const EXCLUDED_KEYWORDS = [
  'lastbærer', 'lastebil', 'henger', 'trailer',
  'semitrailer', 'trekkvogn', 'logset', 'skogsmaskin',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function inferWeightClass(kg: number): string {
  if (kg < 5000)  return 'Under 5 tonn'
  if (kg < 10000) return '5–10 tonn'
  if (kg < 20000) return '10–20 tonn'
  if (kg < 40000) return '20–40 tonn'
  return 'Over 40 tonn'
}

// Title-based weight inference — Finn.no /pw/ construction listings never include
// a structured weight field, so this is the only source of weight class data.
function inferWeightClassFromTitle(title: string): string | null {
  const t = title.toLowerCase()

  // Excavators whose model number × 100 ≈ operating weight in kg:
  // Komatsu PC, Hitachi ZX, Volvo EC/EW, Hyundai HX/R, Doosan DX,
  // JCB JS, Kobelco SK, Case CX/CK, Sumitomo SH
  const excMatch = t.match(/\b(?:pc|zx|ec|ew|hx|dx|js|sk|cx|sh)\s*(\d{2,3})/)
  if (excMatch) {
    const n = parseInt(excMatch[1])
    if (n >= 15 && n <= 500) return inferWeightClass(n * 100)
  }

  // Cat excavators: Cat 308/315/320/323/330/340/349 — last 2 digits = tonnes
  // Use (?!\d) instead of \b so "Cat 323D", "Cat 320G" also match
  const catExcMatch = t.match(/\bcat\s*3(\d{2})(?!\d)/)
  if (catExcMatch) {
    const tonnes = parseInt(catExcMatch[1])
    if (tonnes > 0) return inferWeightClass(tonnes * 1000)
  }

  // Cat dozers: D3–D11 (e.g. Cat D6T LGP ≈ 23 000 kg)
  const CAT_DOZER_KG: Record<number, number> = {
    3: 8500, 4: 9000, 5: 13000, 6: 22000,
    7: 27000, 8: 38000, 9: 50000, 10: 70000, 11: 105000,
  }
  const catDozerMatch = t.match(/\bcat\s*d(\d{1,2})/)
  if (catDozerMatch) {
    const kg = CAT_DOZER_KG[parseInt(catDozerMatch[1])]
    if (kg) return inferWeightClass(kg)
  }

  // Liebherr mining excavators: R920, R930, R940 — last 2 digits = tonnes
  const liebMatch = t.match(/\br9(\d{2})/)
  if (liebMatch) {
    const tonnes = parseInt(liebMatch[1])
    if (tonnes > 0) return inferWeightClass(tonnes * 1000)
  }

  // Volvo wheel loaders: L35=5t, L60=13t, L90=17t, L110=22t, L150=29t, L220=42t
  const volvoLMatch = t.match(/\bvolvo\s*l(\d+)/)
  if (volvoLMatch) {
    const n = parseInt(volvoLMatch[1])
    if (n < 55)  return '5–10 tonn'
    if (n < 100) return '10–20 tonn'
    if (n < 200) return '20–40 tonn'
    return 'Over 40 tonn'
  }

  // Komatsu wheel loaders: WA200=15t, WA320=21t, WA400=24t, WA600=41t
  const waMatch = t.match(/\bwa(\d{2,3})/)
  if (waMatch) {
    const n = parseInt(waMatch[1])
    if (n < 280) return '10–20 tonn'
    if (n < 580) return '20–40 tonn'
    return 'Over 40 tonn'
  }

  return null
}

async function fetchHtml(url: string): Promise<string> {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':      UA,
          'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8',
        },
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err) {
      if (i === 2) throw err
      await sleep(2000 * (i + 1))
    }
  }
  throw new Error('unreachable')
}

// ── Detail page ───────────────────────────────────────────────────────────────

export async function fetchRockmannDetail(finnId: string): Promise<{
  images:      string[]
  hours:       number | null
  weightClass: string | null
}> {
  const url = `https://www.finn.no/pw/ad/construction/${finnId}?orgId=764747174`
  try {
    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const images: string[] = []
    $('div[data-carousel-container] img.centered-image').each((_i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || ''
      if (src.includes('finncdn.no') && !images.includes(src)) {
        images.push(src.replace('/default/', '/1280w/'))
      }
    })

    let hours: number | null = null
    let weightKg: number | null = null
    const HOURS_LABELS  = new Set(['arbeidstimer', 'driftstimer', 'maskintimer', 'timer'])
    const WEIGHT_LABELS = new Set(['vekt', 'driftsvekt', 'driftvekt', 'totalvekt', 'driftssvekt'])
    $('dl dt').each((_i, el) => {
      const label = $(el).text().trim().toLowerCase()
      const value = $(el).next('dd').text().trim()
      if (HOURS_LABELS.has(label)) {
        const n = parseInt(value.replace(/\D/g, ''), 10)
        if (!isNaN(n) && n > 0) hours = n
      }
      if (WEIGHT_LABELS.has(label)) {
        const n = parseInt(value.replace(/[^\d]/g, ''), 10)
        if (n > 0) weightKg = n < 200 ? n * 1000 : n
      }
    })

    // Finn.no /pw/ listings rarely include weight — infer from page title as fallback
    let weightClass: string | null = weightKg !== null ? inferWeightClass(weightKg) : null
    let weightSource = weightKg !== null ? 'dl' : null
    if (!weightClass) {
      const title = $('h1').first().text().trim()
      if (title) {
        weightClass = inferWeightClassFromTitle(title)
        if (weightClass) weightSource = 'title'
      }
    }

    console.log(
      `[rockmann] ${finnId}: timer=${hours ?? 'mangler'} vekt=${weightClass ?? 'mangler'}` +
      (weightSource ? ` (kilde: ${weightSource})` : ''),
    )

    await sleep(300)
    return { images, hours, weightClass }
  } catch {
    return { images: [], hours: null, weightClass: null }
  }
}

// ── Category mapping ──────────────────────────────────────────────────────────

function mapCategory(title: string): { category: string; subcategory: string } {
  const t = title.toLowerCase()

  // Komatsu HD dump trucks — check before general komatsu/graver rule
  if (t.match(/\bkomatsu\s*hd\d/) || t.match(/\bhd\d{3}/))
    return { category: 'Dumpers', subcategory: 'Knekkstyrt dumper' }

  // Hjulgraver (wheeled excavator) — before general beltegraver check
  if (
    t.includes('hjulgraver')        ||
    t.match(/\bew\d/)               || // Volvo EW-series wheeled excavators
    t.match(/\bpw\d/)               || // Komatsu PW-series wheeled
    t.match(/\bmh\d/)               || // Liebherr MH wheeled
    t.includes('wheeled excavator')
  )
    return { category: 'Gravemaskiner', subcategory: 'Hjulgraver' }

  // Beltegraver — broadened with Kobelco SK, JCB JS, Eurocomach, Doosan DX/DL
  if (
    t.match(/\br9\d{2}/)         || t.includes('liebherr r')   ||
    t.match(/\bec\d/)            || t.match(/\bpc\d/)           ||
    t.match(/\bzx\d/)            || t.match(/\bzaxis\d/)        ||
    t.includes('hitachi')        || t.includes('graver')        ||
    t.includes('excavator')      || t.includes('kobelco')       ||
    t.includes('eurocomach')     || t.includes('jcb')           ||
    t.match(/\bsk\d{2,3}/)       || // Kobelco SK-series
    t.match(/\bdx\d{2,3}/)       || // Doosan DX-series
    t.match(/\bdl\d{2,3}/)       || // Doosan DL-series (excavator)
    t.match(/\bjs\d{2,3}/)       || // JCB JS-series excavators
    t.match(/\bcat\s*3[0-9]{2}/) || // Cat 300-series excavators
    t.match(/\bcat\s*m\d{3}/)    || // Cat M-series wheeled excavators
    (t.includes('komatsu') && !t.match(/\bhd\d/) && !t.match(/\bwa\d/)) ||
    t.match(/\b32[0-9]\b/)
  )
    return { category: 'Gravemaskiner', subcategory: 'Beltegraver' }

  // Hjullastere — fixed word-boundary: L70H, L90H2, L150G all now match
  if (
    t.match(/\bl[6-9]\d/)        || // Volvo L60–L99 (no end boundary → catches L70H, L90H2)
    t.match(/\bl[12]\d{2}/)      || // Volvo L100–L299 (catches L150G, L150H, L180)
    t.match(/\bwa\d/)            || // Komatsu WA-series
    t.includes('hjullaster')     ||
    t.includes('wheel loader')   ||
    t.match(/\b908m\b/)          || // Cat 908M
    t.match(/\b9[23][0-9][km]?\b/) || // Cat 910–939 compact wheel loaders
    t.match(/\b9[5-9][0-9][k]?\b/)  // Cat 950–990 large wheel loaders
  )
    return { category: 'Hjullastere', subcategory: 'Hjullaster' }

  // Kompaktmaskiner (skid steers, compact track loaders, telehandlers)
  if (
    t.includes('teleskoptrucker') || t.includes('telehandler')   ||
    t.includes('teleskoplaster')  || t.includes('kompaktlaster') ||
    t.includes('skidsteer')       || t.includes('skid steer')    ||
    t.includes('bobcat')          ||
    t.match(/\bcat\s*2[12678]\d/) || // Cat 216, 226, 236, 246, 256, 272, 287
    t.match(/\bcat\s*2[89]\d\b/)  || // Cat 289, 299
    t.match(/\bjcb\s*(t[0-9]|loadall)/i)
  )
    return { category: 'Kompaktmaskiner', subcategory: 'Kompaktlaster' }

  // Dumpers / articulated haulers
  if (
    t.match(/\ba[2-5][05]\b/)    || t.includes('bell b')      ||
    t.includes('dumper')          || t.includes('articulated')  ||
    t.match(/\bcat\s*7[34]\d\b/) || // Cat 730, 735, 740
    t.match(/\bta[12]\d\b/)         // Terex TA articulated
  )
    return { category: 'Dumpers', subcategory: 'Knekkstyrt dumper' }

  // Kraner og løft
  if (
    t.includes('kran')      || t.includes('crane')    ||
    t.includes('personlift')|| t.includes('boom lift') ||
    t.includes('scissor')   || t.match(/\bmpk\d/)
  )
    return { category: 'Kraner og løft', subcategory: 'Personløfter (saks/mast)' }

  // Crushing/screening/compaction/asphalt → Annet
  if (
    t.includes('metso')     || t.includes('keestrack')  ||
    t.includes('portafill') || t.includes('finlay')     ||
    t.match(/\blt[0-9]/)    || t.includes('vals')       ||
    t.includes('kompaktor') || t.includes('asfalt')     ||
    t.includes('compactor') || t.includes('fresing')
  )
    return { category: 'Annet', subcategory: 'Utstyr og tilbehør' }

  console.warn(`[KATEGORI UKJENT] Tittel: "${title}" | Kilde: "rockmann"`)
  return { category: 'Annet', subcategory: 'Utstyr og tilbehør' }
}

// ── Page parsing ──────────────────────────────────────────────────────────────

function parsePage(html: string): { listings: ScrapedListing[]; hasNext: boolean } {
  const $ = cheerio.load(html)
  const listings: ScrapedListing[] = []

  $('div.result-item').each((_i, el) => {
    const $el = $(el)

    // Skip sold listings
    if ($el.find('span.objectstatus.sold').length > 0) return

    const title = $el.find('h3.t4').text().trim()
    if (!title) return

    // Skip "kjøpes" (want-to-buy ads) and irrelevant equipment
    if (/kjøpes/i.test(title)) return
    if (EXCLUDED_KEYWORDS.some(kw => title.toLowerCase().includes(kw))) return

    const href       = $el.find('a').first().attr('href') ?? ''
    const externalId = href.match(/\/(\d+)\?/)?.[1] ?? ''
    if (!externalId) return

    // Image — upgrade list-page thumbnail to 1280w
    const thumbSrc = $el.find('img.centered-image').attr('src') || $el.find('img').first().attr('src') || ''
    const images   = thumbSrc ? [thumbSrc.replace('/480w/', '/1280w/').replace('/default/', '/1280w/')] : []

    // Year (first span.prl) and price (second span.prl)
    const prls     = $el.find('span.prl')
    const year     = parseInt($(prls[0]).text().trim()) || null
    const priceRaw = $(prls[1]).text().trim()
    const price    = priceRaw ? parseInt(priceRaw.replace(/[^\d]/g, '')) || null : null

    const location = $el.find('span.blockify.ptt').text().trim() || 'Norge'

    const { category, subcategory } = mapCategory(title)

    const parts = title.split(' ')
    const brand = parts[0] || null
    const model = parts.slice(1).join(' ') || null

    const slug = `${slugify(title)}-${externalId}`

    listings.push({
      title, brand, model, year,
      price, priceType: price && price > 0 ? 'fast_price' : 'negotiable',
      category, subcategory, images,
      operatingHours: null,  // filled in after detail-page fetch
      weightClass:    null,  // filled in after detail-page fetch
      externalId, location, slug,
    })
  })

  const hasNext = $('a:contains("Neste")').length > 0

  return { listings, hasNext }
}

async function scrapeAllPages(): Promise<{ listings: ScrapedListing[]; log: string[] }> {
  const all:     ScrapedListing[] = []
  const seenIds  = new Set<string>()
  const log:     string[]         = []
  let page    = 1
  let hasMore = true

  while (hasMore) {
    const url = page === 1 ? BASE_URL : `${BASE_URL}&page=${page}`
    try {
      const html                  = await fetchHtml(url)
      const { listings, hasNext } = parsePage(html)

      let added = 0
      for (const item of listings) {
        if (!seenIds.has(item.externalId)) {
          seenIds.add(item.externalId)
          all.push(item)
          added++
        }
      }
      log.push(`Side ${page}: ${added} annonser`)
      hasMore = hasNext
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log.push(`Side ${page}: FEIL ${msg}`)
      hasMore = false
    }
    page++
    if (hasMore) await sleep(500)
  }

  // Pass 2: fetch detail page for each listing — full image gallery + driftstimer + vektklasse
  let detailErrors = 0
  for (const item of all) {
    const detail = await fetchRockmannDetail(item.externalId)
    if (detail.images.length > 0) item.images      = detail.images
    if (detail.hours       !== null) item.operatingHours = detail.hours
    if (detail.weightClass !== null) item.weightClass    = detail.weightClass
    if (detail.images.length === 0) detailErrors++
  }
  if (detailErrors > 0) log.push(`Detaljer: ${detailErrors} maskiner uten bilder fra detaljside`)

  return { listings: all, log }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function syncRockmannListings(): Promise<SyncResult> {
  const start    = Date.now()
  const sellerId = process.env.ROCKMANN_SELLER_ID
  if (!sellerId) throw new Error('ROCKMANN_SELLER_ID env var is not set')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const result: SyncResult = { created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0, details: [] }

  // 1. Scrape all pages
  const { listings, log } = await scrapeAllPages()
  result.totalScraped = listings.length
  console.log('[rockmann] Scraped:', log.join(' | '))

  if (listings.length === 0) {
    throw new Error(`0 maskiner funnet. Log: ${log.join(' | ')}`)
  }

  // 2. Fetch existing Rockmann listings from DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('listings')
    .select('id, source_external_id, status, price, year, operating_hours, weight_class, images, created_at')
    .eq('source', SOURCE) as {
      data: { id: string; source_external_id: string; status: string; price: number | null; year: number | null; operating_hours: number | null; weight_class: string | null; images: string[]; created_at: string }[] | null
    }

  // Group by source_external_id — detect and soft-delete in-DB duplicates (keep newest)
  type RockRow = { id: string; status: string; price: number | null; year: number | null; operating_hours: number | null; weight_class: string | null; images: string[]; created_at: string }
  const rowsByExtId = new Map<string, RockRow[]>()
  for (const row of existing ?? []) {
    if (!row.source_external_id) continue
    const arr = rowsByExtId.get(row.source_external_id) ?? []
    arr.push(row)
    rowsByExtId.set(row.source_external_id, arr)
  }
  let duplicatesRemoved = 0
  const categoryBreakdown: Record<string, number> = {}
  const dbMap = new Map<string, RockRow>()
  for (const [extId, rows] of rowsByExtId.entries()) {
    rows.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    dbMap.set(extId, rows[0])
    for (const dup of rows.slice(1)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('listings').update({ status: 'removed_by_sync' }).eq('id', dup.id)
      duplicatesRemoved++
    }
  }

  // 3. Insert new / update changed listings
  // Using explicit INSERT + UPDATE (not upsert) because the unique index is partial
  // (WHERE source_external_id IS NOT NULL) and PostgreSQL rejects ON CONFLICT
  // specs that don't include the partial index's WHERE clause.
  for (const item of listings) {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] ?? 0) + 1
    const current = dbMap.get(item.externalId)

    if (!current) {
      const listingId = crypto.randomUUID()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('listings').insert({
        id:                 listingId,
        seller_id:          sellerId,
        source:             SOURCE,
        source_external_id: item.externalId,
        title:              item.title,
        category:           item.category,
        subcategory:        item.subcategory,
        brand:              item.brand,
        model:              item.model,
        year:               item.year,
        operating_hours:    item.operatingHours,
        weight_class:       item.weightClass,
        price:              item.price,
        price_type:         item.priceType,
        location:           item.location,
        images:             item.images,
        status:             'active',
        views:              0,
        slug:               item.slug,
      })
      if (error) {
        console.error('[rockmann] INSERT error:', JSON.stringify(error), 'title:', item.title)
        result.errors++
      } else {
        result.created++
        result.details.push({
          externalId:  item.externalId,
          title:       item.title,
          hours:       item.operatingHours,
          weightClass: item.weightClass,
          status:      'created',
        })
      }
    } else {
      const dbImageCount = (current.images ?? []).length
      const changed =
        current.price !== item.price ||
        current.year  !== item.year  ||
        (item.operatingHours !== null && item.operatingHours !== current.operating_hours) ||
        (item.weightClass    !== null && item.weightClass    !== current.weight_class)    ||
        (item.images.length > 1 && dbImageCount <= 1)

      if (changed) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('listings')
          .update({
            title:      item.title,
            category:   item.category,
            subcategory: item.subcategory,
            price:      item.price,
            price_type: item.priceType,
            year:       item.year,
            ...(item.operatingHours !== null ? { operating_hours: item.operatingHours } : {}),
            ...(item.weightClass    !== null ? { weight_class:    item.weightClass    } : {}),
            images: item.images.length > 0 ? item.images : current.images,
          })
          .eq('id', current.id)
        if (error) {
          console.error('[rockmann] UPDATE error:', JSON.stringify(error), 'id:', current.id)
          result.errors++
        } else result.updated++
      }

      result.details.push({
        externalId:  item.externalId,
        title:       item.title,
        hours:       item.operatingHours,
        weightClass: item.weightClass,
        status:      changed ? 'updated' : 'unchanged',
      })

      // Re-activate if previously soft-deleted
      if (current.status === 'removed_by_sync') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('listings').update({ status: 'active' }).eq('id', current.id)
      }
    }
  }

  // 4. Soft-delete listings no longer on Finn
  const scrapedIds = new Set(listings.map(l => l.externalId))
  for (const [extId, row] of dbMap.entries()) {
    if (!scrapedIds.has(extId) && row.status === 'active') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('listings').update({ status: 'removed_by_sync', updated_at: new Date() }).eq('id', row.id)
      result.removed++
    }
  }

  result.durationMs        = Date.now() - start
  result.duplicatesRemoved = duplicatesRemoved
  result.categoryBreakdown = categoryBreakdown
  return result
}

export async function writeRockmannSyncLog(
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
