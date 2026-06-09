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

export interface SyncResult {
  created:      number
  updated:      number
  removed:      number
  totalScraped: number
  errors:       number
  durationMs:   number
}

interface ScrapedListing {
  title:       string
  brand:       string | null
  model:       string | null
  year:        number | null
  price:       number | null
  priceType:   'fast_price' | 'negotiable'
  category:    string
  subcategory: string
  images:      string[]
  externalId:  string
  location:    string
  slug:        string
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

// ── Category mapping ──────────────────────────────────────────────────────────

function mapCategory(title: string): { category: string; subcategory: string } {
  const t = title.toLowerCase()

  // Hjulgraver before general graver check
  if (t.includes('ew') || t.includes('hjulgraver') || t.match(/\bew\d/))
    return { category: 'Gravemaskiner', subcategory: 'Hjulgraver' }

  // Beltegraver
  if (
    t.match(/\br9\d{2}/) || t.includes('liebherr r') ||
    t.match(/\bec\d/)    || t.match(/\bpc\d/)        ||
    t.match(/\bzx\d/)    || t.includes('hitachi')    ||
    t.includes('graver') || t.includes('excavator')  ||
    t.includes('komatsu')|| t.includes('cat 3')      ||
    t.match(/\b32[0-9]\b/)
  )
    return { category: 'Gravemaskiner', subcategory: 'Beltegraver' }

  // Hjullastere
  if (
    t.match(/\bl[6-9]\d\b/) || t.match(/\bl[12]\d{2}\b/) ||
    t.match(/\bwa\d/)       || t.includes('hjullaster')   ||
    t.match(/\b908m\b/)     || t.match(/\b938\b/)         ||
    t.includes('wheel loader')
  )
    return { category: 'Hjullastere', subcategory: 'Hjullaster' }

  // Dumpers / articulated haulers
  if (
    t.match(/\ba[2-5][05]\b/) || t.includes('bell b')   ||
    t.includes('dumper')      || t.includes('articulated')
  )
    return { category: 'Dumpers', subcategory: 'Knekkstyrt dumper' }

  // Crushing / screening
  if (
    t.includes('metso')    || t.includes('keestrack') ||
    t.includes('portafill')|| t.includes('finlay')    ||
    t.match(/\blt[0-9]/)
  )
    return { category: 'Komprimering og asfalt', subcategory: 'Komprimeringsmaskiner' }

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

    // Image — upgrade thumbnail to full-res
    const imgSrc = $el.find('img').first().attr('src') ?? ''
    const images = imgSrc ? [imgSrc.replace(/\/\d+w\//, '/1280w/')] : []

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

    const uid  = crypto.randomUUID()
    const slug = `${slugify(title)}-${uid.slice(0, 6)}`

    listings.push({
      title, brand, model, year,
      price, priceType: price && price > 0 ? 'fast_price' : 'negotiable',
      category, subcategory, images,
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

  const result: SyncResult = { created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0 }

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
    .select('id, source_external_id, status, price, year')
    .eq('source', SOURCE) as {
      data: { id: string; source_external_id: string; status: string; price: number | null; year: number | null }[] | null
    }

  const dbMap = new Map<string, { id: string; status: string; price: number | null; year: number | null }>()
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
        operating_hours:    null,
        price:              item.price ?? 0,
        price_type:         item.priceType,
        location:           item.location,
        images:             item.images,
        status:             'active',
        views:              0,
        slug:               item.slug,
      })
      if (error) result.errors++
      else       result.created++
    } else {
      const changed = current.price !== item.price || current.year !== item.year

      if (changed) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('listings')
          .update({ price: item.price, price_type: item.priceType, year: item.year, images: item.images })
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

  // 4. Soft-delete listings no longer on Finn
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

export async function writeRockmannSyncLog(
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
