/**
 * Hesselberg Maskin AS listing sync — scrapes brukt.hesselberg.no per category,
 * then visits each detail page for full image gallery.
 *
 * Cheerio parses: table.list.list_vertical tr.item (category page)
 *                 div#links a.thumb img[data-src] (detail page gallery)
 *
 * Prerequisites (run once in Supabase SQL Editor if not already done):
 *   ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
 *   ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS source_external_id TEXT;
 *   CREATE UNIQUE INDEX IF NOT EXISTS listings_source_external_id_idx
 *     ON public.listings(source, source_external_id)
 *     WHERE source_external_id IS NOT NULL;
 */

import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL  = 'https://brukt.hesselberg.no'
const SOURCE    = 'hesselberg'
const DEFAULT_LOCATION = 'Oslo'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// ── Category sources ──────────────────────────────────────────────────────────

interface CategorySource {
  path:        string
  category:    string  // new TEXT-based category values (post DB migration)
  subcategory: string
  label:       string  // for logging only
}

const CATEGORIES: CategorySource[] = [
  { path: '/hesselberg/anlegg/hjulgraver',             category: 'Gravemaskiner',           subcategory: 'Hjulgraver',               label: 'Hjulgraver'               },
  { path: '/hesselberg/anlegg/beltegraver',            category: 'Gravemaskiner',           subcategory: 'Beltegraver',              label: 'Beltegraver'              },
  { path: '/hesselberg/anlegg/teleskoptrucker',        category: 'Kompaktmaskiner',         subcategory: 'Teleskoptrucker',          label: 'Teleskoptrucker'          },
  { path: '/hesselberg/anlegg/hjullaster',             category: 'Hjullastere',             subcategory: 'Hjullaster',               label: 'Hjullaster'               },
  { path: '/hesselberg/anlegg/personloftere',          category: 'Kraner og løft',          subcategory: 'Personløfter (saks/mast)', label: 'Personløftere'            },
  { path: '/hesselberg/anlegg/dumper',                 category: 'Dumpers',                 subcategory: 'Dumper',                   label: 'Dumper'                   },
  { path: '/hesselberg/anlegg/doser-veihovel',         category: 'Annet',                   subcategory: 'Doser og Veihøvel',        label: 'Doser og Veihøvel'        },
  { path: '/hesselberg/anlegg/komprimeringsmaskiner',  category: 'Komprimering og asfalt',  subcategory: 'Komprimeringsmaskiner',    label: 'Komprimeringsmaskiner'    },
  { path: '/hesselberg/anlegg/asfaltmaskiner',         category: 'Komprimering og asfalt',  subcategory: 'Asfaltlegger',             label: 'Asfaltmaskiner'           },
  { path: '/hesselberg/utstyr',                        category: 'Annet',                   subcategory: 'Utstyr og tilbehør',       label: 'Utstyr'                   },
]

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
  title:              string
  brand:              string | null
  model:              string | null
  year:               number | null
  operatingHours:     number | null
  price:              number
  priceType:          'fast_price' | 'negotiable'
  category:           CategorySource['category']
  subcategory:        string
  images:             string[]
  detailUrl:          string
  externalId:         string
  slug:               string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function fetchHtml(url: string): Promise<string> {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'nb-NO,nb;q=0.9' },
        signal: AbortSignal.timeout(25_000),
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

// ── Detail page image scraping ────────────────────────────────────────────────

async function fetchDetailImages(url: string): Promise<string[]> {
  try {
    const html = await fetchHtml(url)
    const $ = cheerio.load(html)
    const images: string[] = []

    $('#links a.thumb img, div.gallery-thumbs a.thumb img').each((_i, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src') || ''
      if (src.includes('mascus.com') && !images.includes(src)) images.push(src)
    })

    if (images.length === 0) {
      const main = $('img.image_main').attr('src') || ''
      if (main) images.push(main)
    }

    return images
  } catch {
    return []
  }
}

// ── Per-category scraping ─────────────────────────────────────────────────────

function parseCategoryPage(html: string, cat: CategorySource): ScrapedListing[] {
  const $ = cheerio.load(html)
  const results: ScrapedListing[] = []

  $('table.list.list_vertical tr.item').each((_i, el) => {
    const $el = $(el)

    const titleLink = $el.find('span.field_brandmodel a').first()
    const title     = titleLink.text().trim()
    const detailPath = titleLink.attr('href') ?? ''
    if (!title || !detailPath) return

    const externalId = detailPath.split('/').pop()?.replace('.html', '') ?? ''
    if (!externalId) return

    const priceText = $el.find('span.field_price').text()
    const priceDigits = priceText.replace(/\D/g, '')
    const price = parseInt(priceDigits, 10) || 0

    const yearText = $el.find('span.field_yearofmanufacture').text()
    const year = parseInt(yearText.replace(/\D/g, ''), 10) || null

    const hoursText = $el.find('span.field_meterreadout').text()
    const hoursDigits = hoursText.replace('Timer:', '').replace(/t$/, '').replace(/\s/g, '')
    const operatingHours = parseInt(hoursDigits, 10) || null

    const titleParts = title.split(' ')
    const brand = titleParts[0] ?? null
    const model = titleParts.slice(1).join(' ') || null

    const uid = crypto.randomUUID()
    const slug = `${slugify(title)}-${uid.slice(0, 6)}`

    results.push({
      title, brand, model, year, operatingHours,
      price, priceType: price > 0 ? 'fast_price' : 'negotiable',
      category:    cat.category,
      subcategory: cat.subcategory,
      images:      [],   // filled in after detail-page fetch
      detailUrl:   `${BASE_URL}${detailPath}`,
      externalId,
      slug,
    })
  })

  return results
}

async function scrapeAllCategories(): Promise<{ listings: ScrapedListing[]; log: string[] }> {
  const listings: ScrapedListing[] = []
  const seenIds = new Set<string>()
  const log: string[] = []

  // Pass 1: scrape all category pages
  for (const cat of CATEGORIES) {
    const url = `${BASE_URL}${cat.path}/`
    try {
      const html = await fetchHtml(url)
      const items = parseCategoryPage(html, cat)

      let added = 0
      for (const item of items) {
        if (!seenIds.has(item.externalId)) {
          seenIds.add(item.externalId)
          listings.push(item)
          added++
        }
      }
      log.push(`${cat.label}: ${added} (page len=${html.length})`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log.push(`${cat.label}: FEIL ${msg}`)
    }
    await sleep(300)
  }

  // Pass 2: fetch detail page for each unique listing to get full image gallery
  let imageErrors = 0
  for (const item of listings) {
    item.images = await fetchDetailImages(item.detailUrl)
    if (item.images.length === 0) imageErrors++
    await sleep(200)
  }
  if (imageErrors > 0) log.push(`Bilder: ${imageErrors} maskiner uten bilder`)

  return { listings, log }
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

  // 1. Scrape all categories
  const { listings, log } = await scrapeAllCategories()
  result.totalScraped = listings.length

  if (listings.length === 0) {
    throw new Error(`0 maskiner funnet. Kategoriresultater: ${log.join(' | ')}`)
  }

  // 2. Fetch existing Hesselberg listings from DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('listings')
    .select('id, source_external_id, status, price, operating_hours, images')
    .eq('source', SOURCE) as { data: { id: string; source_external_id: string; status: string; price: number; operating_hours: number | null; images: string[] }[] | null }

  const dbMap = new Map<string, { id: string; status: string; price: number; operating_hours: number | null; images: string[] }>()
  for (const row of existing ?? []) {
    if (row.source_external_id) dbMap.set(row.source_external_id, row)
  }

  // 3. Insert new / update changed listings
  // Using explicit INSERT + UPDATE (not upsert) because the unique index is partial
  // (WHERE source_external_id IS NOT NULL) and PostgreSQL rejects ON CONFLICT
  // specs that don't include the partial index's WHERE clause.
  for (const item of listings) {
    const current = dbMap.get(item.externalId)

    if (!current) {
      // INSERT new listing
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
        price:              item.price,
        price_type:         item.priceType,
        location:           DEFAULT_LOCATION,
        images:             item.images,
        status:             'active',
        views:              0,
        slug:               item.slug,
      })
      if (error) result.errors++
      else       result.created++
    } else {
      // UPDATE if price, hours, or image count changed
      const dbImageCount = (current.images ?? []).length
      const changed =
        current.price           !== item.price ||
        current.operating_hours !== item.operatingHours ||
        (item.images.length > 0 && item.images.length !== dbImageCount)

      if (changed) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('listings')
          .update({
            price:           item.price,
            price_type:      item.priceType,
            operating_hours: item.operatingHours,
            images:          item.images.length > 0 ? item.images : current.images,
            subcategory:     item.subcategory,
          })
          .eq('id', current.id)
        if (error) result.errors++
        else       result.updated++
      }

      // Re-activate if previously soft-deleted
      if (current.status === 'draft') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('listings').update({ status: 'active' }).eq('id', current.id)
      }
    }
  }

  // 4. Soft-delete listings no longer on Hesselberg site
  const scrapedIds = new Set(listings.map(l => l.externalId))
  for (const [extId, row] of dbMap.entries()) {
    if (!scrapedIds.has(extId) && row.status === 'active') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('listings').update({ status: 'draft' }).eq('id', row.id)
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
