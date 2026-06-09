/**
 * Scrapes bruktmarked.nasta.no and upserts listings into Supabase for NASTA AS.
 *
 * Usage: node scripts/scrape-nasta.mjs [--dry-run]
 *
 * Requires .env.local with SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.
 *
 * Before first run, execute in Supabase SQL Editor:
 *
 *   -- Mark existing NASTA listings with correct source (one-time migration)
 *   UPDATE public.listings
 *     SET source = 'nasta_as'
 *   WHERE seller_id = 'fc88b0fc-ef94-4199-876c-72d97424055d'
 *     AND (source IS NULL OR source = 'manual' OR source = 'nasta');
 *
 *   -- Unique index to prevent duplicate inserts
 *   CREATE UNIQUE INDEX IF NOT EXISTS listings_nasta_extid_idx
 *     ON public.listings(source_external_id)
 *     WHERE source_external_id IS NOT NULL;
 *
 *   -- Remove duplicate NASTA listings — keep newest per external ID
 *   DELETE FROM listings
 *   WHERE id IN (
 *     SELECT id FROM (
 *       SELECT id,
 *         ROW_NUMBER() OVER (
 *           PARTITION BY source_external_id ORDER BY created_at DESC
 *         ) AS rn
 *       FROM listings
 *       WHERE seller_id = 'fc88b0fc-ef94-4199-876c-72d97424055d'
 *         AND source_external_id IS NOT NULL
 *     ) ranked
 *     WHERE rn > 1
 *   );
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Config ────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath   = path.join(__dirname, '../.env.local')

function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch { /* ignore */ }
}

loadEnv(envPath)

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY       = process.env.SUPABASE_SERVICE_ROLE_KEY
const NASTA_SELLER_ID   = 'fc88b0fc-ef94-4199-876c-72d97424055d'
const SOURCE            = 'nasta_as'
const BASE_URL          = 'https://bruktmarked.nasta.no'
const DRY_RUN           = process.argv.includes('--dry-run')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Category mapping ──────────────────────────────────────────────────────────

const CATEGORY_MAP = {
  beltegraver: 'gravemaskin', 'midigravere-7-12t': 'gravemaskin',
  midigravere: 'gravemaskin', minigravere: 'gravemaskin',
  hjulgravere: 'gravemaskin', gravemaskiner: 'gravemaskin',
  hjullastere: 'hjullaster',  hjullaster: 'hjullaster',
  beltedumpere: 'dumper',     dumpere: 'dumper',     dumper: 'dumper',
  traktorer: 'traktor',       traktor: 'traktor',
  kranbiler: 'kranbil',       kranbil: 'kranbil',
  skogsmaskiner: 'skogsutstyr', skogsutstyr: 'skogsutstyr',
  betongutstyr: 'betong',     betong: 'betong',
  hjulgraver: 'gravemaskin',  minigraver: 'gravemaskin',
  midigraver: 'gravemaskin',  beltedumper: 'dumper',
  skuffer: 'annet',           utstyr: 'annet',        annet: 'annet',
}

function mapCategory(urlSegment, gruppeText) {
  const seg = (urlSegment || '').toLowerCase()
  const grp = (gruppeText  || '').toLowerCase()
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (seg.includes(key)) return val
  }
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (grp.includes(key)) return val
  }
  return 'annet'
}

function inferWeightClass(totalvektKg) {
  const kg = parseInt(String(totalvektKg || '').replace(/\D/g, ''), 10)
  if (isNaN(kg) || kg === 0) return null
  if (kg <  5000) return 'Under 5 tonn'
  if (kg < 10000) return '5–10 tonn'
  if (kg < 20000) return '10–20 tonn'
  if (kg < 40000) return '20–40 tonn'
  return 'Over 40 tonn'
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function extractH1(html) {
  const m = html.match(/<h1[^>]*class="main_header"[^>]*>([^<]+)<\/h1>/)
  return m ? m[1].trim() : null
}

function extractDataPairs(html) {
  const pairs = {}
  const rowRe = /<tr[^>]*class="item[^"]*"[^>]*>([\s\S]*?)<\/tr>/g
  let rowMatch
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

function extractImages(html) {
  const urls = []
  const re   = /data-src="(https:\/\/st\.mascus\.com\/image\/product\/large\/[^"]+)"/g
  let m
  while ((m = re.exec(html)) !== null) {
    if (!urls.includes(m[1])) urls.push(m[1])
  }
  return urls
}

// ── Network helpers ───────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fetchHtml(url, retries = 3) {
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
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// ── Discover listing URLs ─────────────────────────────────────────────────────

async function discoverListingPaths() {
  const paths = new Set()
  for (let page = 1; page <= 20; page++) {
    const url = page === 1
      ? `${BASE_URL}/nastaas/anlegg/`
      : `${BASE_URL}/nastaas/anlegg,${page},createdate_desc,search.html`
    console.log(`  Scanning page ${page}: ${url}`)
    let html
    try {
      html = await fetchHtml(url)
    } catch {
      console.log(`  Page ${page} failed — stopping`)
      break
    }
    const re = /href="(\/nastaas\/anlegg\/[^"]+\.html)"/g
    let m
    while ((m = re.exec(html)) !== null) paths.add(m[1])
    if (!new RegExp(`/nastaas/anlegg,${page + 1},`).test(html)) {
      console.log(`  No page ${page + 1} — done`)
      break
    }
    await sleep(400)
  }
  return [...paths]
}

// ── Parse one listing ─────────────────────────────────────────────────────────

function parseListing(html, listingPath) {
  const urlSegment = listingPath.split('/')[3] || ''
  const title      = extractH1(html) || 'Ukjent maskin'
  const data       = extractDataPairs(html)
  const imageUrls  = extractImages(html)

  const priceRaw   = (data['Pris eks. MVA'] || '').replace(/\s/g, '').replace(/NOK.*/, '')
  const price      = parseInt(priceRaw, 10) || 0
  const priceType  = price === 0 ? 'negotiable' : 'fast_price'

  const year       = parseInt(data['Årsmodell'] || '', 10) || null

  const hoursRaw   = (data['Driftstimer'] || '').replace(/\s/g, '').replace(/t$/, '')
  const hours      = parseInt(hoursRaw, 10) || null

  const lagersted  = data['Lagersted'] || ''
  let location     = lagersted
  const cityMatch  = lagersted.match(/([A-ZÆØÅ][a-zæøå]+(?:\s[A-ZÆØÅ][a-zæøå]+)*)\s+\d{4}/)
  if (cityMatch)                    location = cityMatch[1]
  else if (lagersted.includes(',')) location = lagersted.split(',')[0].trim()
  if (!location)                    location = 'Kristiansand'

  const category    = mapCategory(urlSegment, data['Gruppe'] || '')
  const weightClass = inferWeightClass(data['Totalvekt'] || '')

  const titleParts  = title.split(' ')
  const brand       = titleParts[0] || null
  const model       = titleParts.slice(1).join(' ') || null

  // Stable external ID — last path segment without .html
  const externalId  = listingPath.split('/').pop()?.replace('.html', '') || listingPath

  return { title, brand, model, year, category, price, priceType,
           operating_hours: hours, weight_class: weightClass,
           location, description: data['Beskrivelse'] || null,
           imageUrls, externalId }
}

// ── Upload images ─────────────────────────────────────────────────────────────

async function uploadImages(imageUrls, listingId) {
  const uploaded = []
  for (let j = 0; j < Math.min(imageUrls.length, 20); j++) {
    const ext      = imageUrls[j].split('.').pop()?.split('?')[0] || 'jpg'
    const filePath = `listings/${listingId}/${j}.${ext}`
    try {
      const buf = await fetchBuffer(imageUrls[j])
      const { error } = await supabase.storage
        .from('listing-images')
        .upload(filePath, buf, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, upsert: true })
      if (!error) uploaded.push(filePath)
    } catch (err) {
      console.warn(`    Image ${j} failed: ${err.message}`)
    }
    await sleep(150)
  }
  return uploaded
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startMs = Date.now()
  console.log(`\n🔍 NASTA scraper — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   Source: ${SOURCE}  Seller: ${NASTA_SELLER_ID}\n`)

  // 1. Load ALL existing NASTA listings (by seller_id, catches old + new source values)
  const { data: existing } = await supabase
    .from('listings')
    .select('id, title, year, price, operating_hours, description, source_external_id, status, images')
    .eq('seller_id', NASTA_SELLER_ID)

  // Build lookup by stable external ID
  const dbMap = new Map()
  for (const row of existing || []) {
    if (row.source_external_id) dbMap.set(row.source_external_id, row)
  }
  console.log(`   ${existing?.length ?? 0} existing listings in DB (${dbMap.size} with external ID)\n`)

  // 2. Discover all listing paths on NASTA site
  console.log('📋 Discovering listing URLs...')
  const paths = await discoverListingPaths()
  console.log(`   Found ${paths.length} unique listing paths.\n`)

  const stats     = { created: 0, updated: 0, reactivated: 0, skipped: 0, removed: 0, failed: 0 }
  const seenIds   = new Set()

  // 3. Process each scraped listing
  for (let i = 0; i < paths.length; i++) {
    const listingPath = paths[i]
    process.stdout.write(`[${i + 1}/${paths.length}] ${listingPath.split('/').pop()} `)

    let html
    try {
      html = await fetchHtml(`${BASE_URL}${listingPath}`)
    } catch (err) {
      console.log(`❌ fetch failed: ${err.message}`)
      stats.failed++
      continue
    }

    const parsed = parseListing(html, listingPath)
    seenIds.add(parsed.externalId)

    const dbRow = dbMap.get(parsed.externalId)

    if (dbRow) {
      // ── UPDATE existing listing with fresh NASTA data ──────────────────────
      const priceChanged   = dbRow.price             !== parsed.price
      const hoursChanged   = dbRow.operating_hours   !== parsed.operating_hours
      const descChanged    = dbRow.description       !== parsed.description
      const wasRemoved     = dbRow.status === 'draft'

      if (!priceChanged && !hoursChanged && !descChanged && !wasRemoved) {
        console.log(`⏭  unchanged: "${parsed.title}"`)
        stats.skipped++
        continue
      }

      if (!DRY_RUN) {
        const updatePayload = {}
        if (priceChanged)  updatePayload.price            = parsed.price
        if (priceChanged)  updatePayload.price_type       = parsed.priceType
        if (hoursChanged)  updatePayload.operating_hours  = parsed.operating_hours
        if (descChanged)   updatePayload.description      = parsed.description
        if (wasRemoved)    updatePayload.status           = 'active'

        const { error } = await supabase.from('listings').update(updatePayload).eq('id', dbRow.id)
        if (error) {
          console.log(`❌ update failed: ${error.message}`)
          stats.failed++
        } else {
          if (wasRemoved) {
            console.log(`♻️  reactivated: "${parsed.title}"`)
            stats.reactivated++
          } else {
            const changes = [priceChanged && 'pris', hoursChanged && 'timer', descChanged && 'desc'].filter(Boolean).join(', ')
            console.log(`✏️  updated (${changes}): "${parsed.title}"`)
            stats.updated++
          }
        }
      } else {
        console.log(`✏️  [dry] would update: "${parsed.title}"`)
        stats.updated++
      }

    } else {
      // ── INSERT new listing ─────────────────────────────────────────────────
      console.log(`\n   Title:    ${parsed.title}`)
      console.log(`   Category: ${parsed.category} | Year: ${parsed.year} | Hours: ${parsed.operating_hours}h | Price: ${parsed.price} NOK`)

      if (DRY_RUN) {
        console.log(`   ✓ [dry-run] would insert`)
        stats.created++
        continue
      }

      const listingId = crypto.randomUUID()
      const images    = await uploadImages(parsed.imageUrls, listingId)
      console.log(`   Uploaded ${images.length}/${Math.min(parsed.imageUrls.length, 20)} images`)

      const slug = `${slugify(parsed.title)}-${listingId.slice(0, 6)}`

      const { error } = await supabase.from('listings').insert({
        id:                 listingId,
        seller_id:          NASTA_SELLER_ID,
        source:             SOURCE,
        source_external_id: parsed.externalId,
        title:              parsed.title,
        category:           parsed.category,
        brand:              parsed.brand,
        model:              parsed.model,
        year:               parsed.year,
        operating_hours:    parsed.operating_hours,
        weight_class:       parsed.weight_class,
        price:              parsed.price,
        price_ex_vat:       parsed.price,
        price_inc_vat:      Math.round(parsed.price * 1.25),
        vat_rate:           25,
        price_type:         parsed.priceType,
        listing_type:       'sale',
        location:           parsed.location,
        description:        parsed.description,
        images,
        status:             'active',
        views:              0,
        slug,
      })

      if (error) {
        console.log(`   ❌ insert failed: ${error.message}`)
        stats.failed++
      } else {
        console.log(`   ✅ created: ${slug}`)
        stats.created++
        // Keep dbMap in sync so removal check is accurate
        dbMap.set(parsed.externalId, { id: listingId, status: 'active', source_external_id: parsed.externalId })
      }
    }

    await sleep(300)
  }

  // 4. Mark listings no longer on NASTA as removed (soft-delete → draft)
  //    Only applies to listings we can reliably track (source_external_id IS NOT NULL)
  if (!DRY_RUN) {
    for (const [extId, row] of dbMap.entries()) {
      if (!seenIds.has(extId) && row.status === 'active') {
        const { error } = await supabase
          .from('listings')
          .update({ status: 'draft' })
          .eq('id', row.id)
        if (!error) {
          console.log(`🗑  removed (gone from NASTA): id=${row.id} extId=${extId}`)
          stats.removed++
        }
      }
    }
  }

  const durationSec = ((Date.now() - startMs) / 1000).toFixed(1)
  console.log(`\n📊 Done in ${durationSec}s`)
  console.log(`   Created:     ${stats.created}`)
  console.log(`   Updated:     ${stats.updated}`)
  console.log(`   Reactivated: ${stats.reactivated}`)
  console.log(`   Skipped:     ${stats.skipped}`)
  console.log(`   Removed:     ${stats.removed}`)
  console.log(`   Failed:      ${stats.failed}`)

  // Write sync log if not dry-run
  if (!DRY_RUN) {
    await supabase.from('sync_logs').insert({
      source:        SOURCE,
      status:        stats.failed === 0 ? 'success' : 'partial',
      created_count: stats.created,
      updated_count: stats.updated + stats.reactivated,
      removed_count: stats.removed,
      total_scraped: paths.length,
      duration_ms:   Date.now() - startMs,
    })
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
