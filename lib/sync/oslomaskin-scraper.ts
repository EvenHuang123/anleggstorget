import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL        = 'https://www.oslomaskin.com'
const SOURCE          = 'oslomaskin'
const DEFAULT_LOCATION = 'Oslo'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SyncResult {
  created:      number
  updated:      number
  removed:      number
  totalScraped: number
  errors:       number
  durationMs:   number
}

interface ScrapedListing {
  title:          string
  brand:          string | null
  model:          string | null
  externalId:     string
  detailUrl:      string
  listImage:      string | null
  year:           number | null
  operatingHours: number | null
  price:          number | null
  priceType:      'fast_price' | 'negotiable'
  category:       string
  subcategory:    string
  weightClass:    string | null
  images:         string[]
  dbSlug:         string
}

interface DbListing {
  id:                 string
  source_external_id: string
  status:             string
  price:              number | null
  operating_hours:    number | null
  weight_class:       string | null
  images:             string[]
}

// ── Category / weight helpers ─────────────────────────────────────────────────

function inferWeightClass(kg: number): string {
  if (kg <  5000) return 'Under 5 tonn'
  if (kg < 10000) return '5–10 tonn'
  if (kg < 20000) return '10–20 tonn'
  if (kg < 40000) return '20–40 tonn'
  return 'Over 40 tonn'
}

function inferWeightClassFromTitle(title: string): string | null {
  const t = title.toLowerCase()

  const excMatch = t.match(/\b(?:pc|zx|ec|ew|hx|dx|js|sk|cx|sh)\s*(\d{2,3})/)
  if (excMatch) {
    const n = parseInt(excMatch[1])
    if (n >= 15 && n <= 500) return inferWeightClass(n * 100)
  }

  const catExcMatch = t.match(/\bcat\s*3(\d{2})(?!\d)/)
  if (catExcMatch) {
    const tonnes = parseInt(catExcMatch[1])
    if (tonnes > 0) return inferWeightClass(tonnes * 1000)
  }

  const CAT_DOZER_KG: Record<number, number> = {
    3: 8500, 4: 9000, 5: 13000, 6: 22000,
    7: 27000, 8: 38000, 9: 50000, 10: 70000, 11: 105000,
  }
  const catDozerMatch = t.match(/\bcat\s*d(\d{1,2})/)
  if (catDozerMatch) {
    const kg = CAT_DOZER_KG[parseInt(catDozerMatch[1])]
    if (kg) return inferWeightClass(kg)
  }

  const liebMatch = t.match(/\br9(\d{2})/)
  if (liebMatch) {
    const tonnes = parseInt(liebMatch[1])
    if (tonnes > 0) return inferWeightClass(tonnes * 1000)
  }

  const volvoLMatch = t.match(/\bvolvo\s*l(\d+)/)
  if (volvoLMatch) {
    const n = parseInt(volvoLMatch[1])
    if (n < 55)  return '5–10 tonn'
    if (n < 100) return '10–20 tonn'
    if (n < 200) return '20–40 tonn'
    return 'Over 40 tonn'
  }

  const waMatch = t.match(/\bwa(\d{2,3})/)
  if (waMatch) {
    const n = parseInt(waMatch[1])
    if (n < 280) return '10–20 tonn'
    if (n < 580) return '20–40 tonn'
    return 'Over 40 tonn'
  }

  return null
}

interface CategoryInfo { category: string; subcategory: string }

function categorizeFromTitle(title: string): CategoryInfo {
  const t = title.toLowerCase()

  if (
    t.includes('hjullaster') || t.includes('wheel loader') ||
    /\bl\d{2,3}[a-z]?\b/.test(t) || /\bwa\d{2,3}/.test(t)
  ) {
    return { category: 'Hjullastere', subcategory: 'Hjullaster' }
  }

  if (t.includes('dumper')) {
    const isBelt = t.includes('belted') || t.includes('belte')
    return { category: 'Dumpers', subcategory: isBelt ? 'Beltedumper' : 'Dumper' }
  }

  if (
    t.includes('kran') || t.includes('teleskop') || t.includes('personløfter') ||
    t.includes('skylife') || t.includes('lift')
  ) {
    return { category: 'Kraner og løft', subcategory: 'Personløfter (saks/mast)' }
  }

  const isExcavator =
    t.includes('graver') || t.includes('excavator') ||
    /\b(?:zx|pc|hx|dx|js|sk|cx|sh|r9)\d/.test(t) ||
    /\bcat\s*3\d{2}/.test(t)

  if (isExcavator) {
    const isWheel = t.includes('hjul') || /\bew\d/.test(t) || t.includes('wheel')
    return {
      category:    'Gravemaskiner',
      subcategory: isWheel ? 'Hjulgraver' : 'Beltegraver',
    }
  }

  return { category: 'Annet', subcategory: 'Utstyr og tilbehør' }
}

// ── Text parsers ──────────────────────────────────────────────────────────────

function parseYear(text: string): number | null {
  const m = text.match(/(\d{4})\s*[Mm]odell/)
  if (!m) return null
  const y = parseInt(m[1])
  return y >= 1970 && y <= 2030 ? y : null
}

function parseHours(text: string): number | null {
  // Matches "6100 timer" or "6 100 timer"
  const m = text.match(/([\d][\d\s]{0,5})\s*[Tt]imer/)
  if (!m) return null
  const n = parseInt(m[1].replace(/\s/g, ''), 10)
  return isNaN(n) ? null : n
}

function parsePrice(text: string): number | null {
  // Variants: "NOK 649000,-" / "NOK: 35000,-" / "NOK 79900 + mva"
  const m = text.match(/NOK[:\s]*([\d][\d\s]{0,9})[,\-\s]/i)
  if (!m) return null
  const n = parseInt(m[1].replace(/\s/g, ''), 10)
  return isNaN(n) || n === 0 ? null : n
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function cleanImageUrl(src: string): string {
  const abs = src.startsWith('http') ? src : `${BASE_URL}${src}`
  // Remove dimension transforms like /719x0_744x0/ or /123x456_789x0/
  return abs.replace(/\/\d+x\d+_\d+x\d+\//g, '/')
}

// ── Network ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'nb-NO,nb;q=0.9',
        },
        signal: AbortSignal.timeout(25_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err) {
      if (i === retries - 1) throw err
      await sleep(2000 * (i + 1))
    }
  }
  throw new Error('unreachable')
}

// ── Detail page images ────────────────────────────────────────────────────────

async function fetchDetailImages(slug: string, fallback: string | null): Promise<string[]> {
  const url = `${BASE_URL}/b/${slug}`
  try {
    const html = await fetchHtml(url)
    const $ = cheerio.load(html)
    const images: string[] = []

    // Prioritise .gallery, then fall back to any product upload image on the page
    const $gallery = $('.gallery img, .images img, .photo img, .slider img')
    const $fallback = $('img[src*="/uploads/"]')

    const $targets = $gallery.length > 0 ? $gallery : $fallback

    $targets.each((_i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || ''
      if (!src) return
      const clean = cleanImageUrl(src)
      // Only include product upload images; skip logos/icons
      if (!clean.includes('/uploads/')) return
      if (images.includes(clean)) return
      images.push(clean)
    })

    return images
  } catch (err) {
    console.warn(`[oslomaskin] Detaljside-fetch feilet for ${slug}:`, err instanceof Error ? err.message : err)
    return fallback ? [fallback] : []
  }
}

// ── List page scraping ────────────────────────────────────────────────────────

async function scrapeListPage(): Promise<ScrapedListing[]> {
  const html = await fetchHtml(`${BASE_URL}/til-salgs`)
  const $ = cheerio.load(html)
  const results: ScrapedListing[] = []

  $('li.post').each((_i, el) => {
    const $el = $(el)

    const $link = $el.find('a[href^="/b/"]').first()
    const href = $link.attr('href') ?? ''
    if (!href) return

    // Extract slug: "/b/hitachi-zx210lc-3-602781" → "hitachi-zx210lc-3-602781"
    const externalId = href.replace(/^\/b\//, '').trim()
    if (!externalId) return

    const title = (
      $el.find('a.subtitle.title').text().trim() ||
      $link.attr('title')?.trim() ||
      ''
    )
    if (!title) return

    const imgSrc = $el.find('img.postImg').attr('src') ?? null
    const listImage = imgSrc ? cleanImageUrl(imgSrc) : null

    const descText = $el.find('div.bodytext.shortDescription').text().trim()

    const year          = parseYear(descText)
    const operatingHours = parseHours(descText)
    const price         = parsePrice(descText)
    const priceType: 'fast_price' | 'negotiable' = price ? 'fast_price' : 'negotiable'

    const { category, subcategory } = categorizeFromTitle(title)
    const weightClass = inferWeightClassFromTitle(title)

    const titleParts = title.split(' ')
    const brand = titleParts[0] ?? null
    const model = titleParts.slice(1).join(' ') || null

    const uid = crypto.randomUUID()
    const dbSlug = `${slugify(title)}-${uid.slice(0, 6)}`

    results.push({
      title, brand, model,
      externalId,
      detailUrl: `${BASE_URL}/b/${externalId}`,
      listImage,
      year, operatingHours, price, priceType,
      category, subcategory, weightClass,
      images: listImage ? [listImage] : [],
      dbSlug,
    })
  })

  return results
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function syncOslomaskinListings(): Promise<SyncResult> {
  const start = Date.now()

  const sellerId = process.env.OSLOMASKIN_SELLER_ID
  if (!sellerId) throw new Error('OSLOMASKIN_SELLER_ID env var is not set')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const result: SyncResult = { created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0 }

  // 1. Fetch existing Oslo Maskin listings from DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('listings')
    .select('id, source_external_id, status, price, operating_hours, weight_class, images')
    .eq('source', SOURCE) as { data: DbListing[] | null }

  const dbMap = new Map<string, DbListing>()
  for (const row of existing ?? []) {
    if (row.source_external_id) dbMap.set(row.source_external_id, row)
  }

  // 2. Scrape list page
  let listings: ScrapedListing[]
  try {
    listings = await scrapeListPage()
  } catch (err) {
    throw new Error(`Kunne ikke scrape listesiden: ${err instanceof Error ? err.message : err}`)
  }

  if (listings.length === 0) {
    throw new Error('0 maskiner funnet på /til-salgs — strukturen kan ha endret seg')
  }

  result.totalScraped = listings.length

  // 3. Fetch detail-page images for each listing
  for (const item of listings) {
    const detailImages = await fetchDetailImages(item.externalId, item.listImage)
    if (detailImages.length > 0) item.images = detailImages
    await sleep(300)
  }

  const seenExternalIds = new Set<string>()

  // 4. Upsert listings
  for (const item of listings) {
    seenExternalIds.add(item.externalId)
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
        brand:              item.brand,
        model:              item.model,
        category:           item.category,
        subcategory:        item.subcategory,
        year:               item.year,
        operating_hours:    item.operatingHours,
        weight_class:       item.weightClass,
        price:              item.price,
        price_type:         item.priceType,
        location:           DEFAULT_LOCATION,
        images:             item.images,
        status:             'active',
        views:              0,
        slug:               item.dbSlug,
      })

      if (error) result.errors++
      else       result.created++
    } else {
      const priceChanged = current.price !== item.price
      const hoursChanged = current.operating_hours !== item.operatingHours

      if (priceChanged || hoursChanged) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('listings')
          .update({
            price:           item.price,
            price_type:      item.priceType,
            // Protect: do not overwrite with null if DB already has a value
            ...(item.operatingHours !== null ? { operating_hours: item.operatingHours } : {}),
            ...(item.weightClass    !== null ? { weight_class:    item.weightClass    } : {}),
            images:          item.images.length > 0 ? item.images : current.images,
          })
          .eq('id', current.id)

        if (error) result.errors++
        else       result.updated++
      }

      if (current.status === 'removed_by_sync') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('listings').update({ status: 'active' }).eq('id', current.id)
      }
    }
  }

  // 5. Soft-delete listings no longer on Oslo Maskin site
  for (const [extId, row] of dbMap.entries()) {
    if (!seenExternalIds.has(extId) && row.status === 'active') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('listings')
        .update({ status: 'removed_by_sync', updated_at: new Date() })
        .eq('id', row.id)
      result.removed++
    }
  }

  result.durationMs = Date.now() - start
  return result
}

export async function writeOslomaskinSyncLog(
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
