/**
 * Scrapes bruktmarked.nasta.no and creates listings in Supabase for NASTA AS.
 *
 * Usage: node scripts/scrape-nasta.mjs [--dry-run]
 *
 * Requires .env.local with SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Config ────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '../.env.local')

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Listings are published under huangevenzhe@gmail.com (we manage on behalf of NASTA AS)
const NASTA_SELLER_ID = 'fc88b0fc-ef94-4199-876c-72d97424055d'

const BASE_URL = 'https://bruktmarked.nasta.no'
const DRY_RUN  = process.argv.includes('--dry-run')

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Category mapping ──────────────────────────────────────────────────────────
// Maps bruktmarked.nasta.no URL segment / "Gruppe" field → our Category type

const CATEGORY_MAP = {
  // URL segments
  'beltegraver':         'gravemaskin',
  'midigravere-7-12t':   'gravemaskin',
  'midigravere':         'gravemaskin',
  'minigravere':         'gravemaskin',
  'hjulgravere':         'gravemaskin',
  'gravemaskiner':       'gravemaskin',
  'hjullastere':         'hjullaster',
  'hjullaster':          'hjullaster',
  'beltedumpere':        'dumper',
  'dumpere':             'dumper',
  'dumper':              'dumper',
  'traktorer':           'traktor',
  'traktor':             'traktor',
  'kranbiler':           'kranbil',
  'kranbil':             'kranbil',
  'skogsmaskiner':       'skogsutstyr',
  'skogsutstyr':         'skogsutstyr',
  'betongutstyr':        'betong',
  'betong':              'betong',
  'skuffer':             'annet',
  'utstyr':              'annet',
  'annet':               'annet',
  // "Gruppe" text values (Norwegian)
  'beltegraver':         'gravemaskin',
  'hjulgraver':          'gravemaskin',
  'minigraver':          'gravemaskin',
  'midigraver':          'gravemaskin',
  'hjullaster':          'hjullaster',
  'beltedumper':         'dumper',
}

function mapCategory(urlSegment, gruppeText) {
  const seg = (urlSegment || '').toLowerCase()
  const grp = (gruppeText || '').toLowerCase()

  // Check URL segment first (more reliable)
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (seg.includes(key)) return val
  }
  // Fall back to Gruppe field text
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (grp.includes(key)) return val
  }
  return 'annet'
}

// ── Weight class helper ───────────────────────────────────────────────────────

function inferWeightClass(totalvektKg) {
  const kg = parseInt(String(totalvektKg || '').replace(/\D/g, ''), 10)
  if (isNaN(kg) || kg === 0) return null
  if (kg <  5000) return 'Under 5 tonn'
  if (kg < 10000) return '5–10 tonn'
  if (kg < 20000) return '10–20 tonn'
  if (kg < 40000) return '20–40 tonn'
  return 'Over 40 tonn'
}

// ── Slugify ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function extractH1(html) {
  const m = html.match(/<h1[^>]*class="main_header"[^>]*>([^<]+)<\/h1>/)
  return m ? m[1].trim() : null
}

function extractDataPairs(html) {
  // <span class="data">Label</span> ... <span class="data">Value</span>
  // They appear inside <td class="header"> and <td class="cell1"> respectively
  const pairs = {}

  // Strategy: extract all table rows that contain two data spans
  const rowRe = /<tr[^>]*class="item[^"]*"[^>]*>([\s\S]*?)<\/tr>/g
  let rowMatch
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

function extractImages(html) {
  const urls = []
  const re = /data-src="(https:\/\/st\.mascus\.com\/image\/product\/large\/[^"]+)"/g
  let m
  while ((m = re.exec(html)) !== null) {
    if (!urls.includes(m[1])) urls.push(m[1])
  }
  return urls
}

// ── Fetch with retry ──────────────────────────────────────────────────────────

async function fetchHtml(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)',
          'Accept': 'text/html',
        },
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
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ── Discover all listing URLs ─────────────────────────────────────────────────

async function discoverListingUrls() {
  const listingPaths = new Set()

  // Try pages 1 → until no new listings are found or no next-page link
  let page = 1
  const maxPages = 20

  while (page <= maxPages) {
    const url = page === 1
      ? `${BASE_URL}/nastaas/anlegg/`
      : `${BASE_URL}/nastaas/anlegg,${page},createdate_desc,search.html`

    console.log(`  Scanning page ${page}: ${url}`)
    let html
    try {
      html = await fetchHtml(url)
    } catch {
      console.log(`  Page ${page} failed — stopping pagination`)
      break
    }

    const before = listingPaths.size
    const re = /href="(\/nastaas\/anlegg\/[^"]+\.html)"/g
    let m
    while ((m = re.exec(html)) !== null) {
      listingPaths.add(m[1])
    }
    const added = listingPaths.size - before

    // Stop if no next-page link exists
    const hasNext = new RegExp(`/nastaas/anlegg,${page + 1},`).test(html)
    if (!hasNext) {
      console.log(`  No page ${page + 1} — stopping pagination`)
      break
    }

    page++
    await sleep(400)
  }

  return [...listingPaths]
}

// ── Parse one listing ─────────────────────────────────────────────────────────

function parseListing(html, listingPath) {
  const urlSegment = listingPath.split('/')[3] // e.g. "beltegraver"
  const title      = extractH1(html) || 'Ukjent maskin'
  const data       = extractDataPairs(html)
  const imageUrls  = extractImages(html)

  // Price: "Pris eks. MVA" → strip spaces and " NOK"
  const priceRaw  = (data['Pris eks. MVA'] || '').replace(/\s/g, '').replace(/NOK.*/, '')
  const price     = parseInt(priceRaw, 10) || 0
  const priceType = price === 0 ? 'negotiable' : 'fast_price'

  // Year
  const year = parseInt(data['Årsmodell'] || '', 10) || null

  // Operating hours: "6 800 t" → 6800
  const hoursRaw = (data['Driftstimer'] || '').replace(/\s/g, '').replace(/t$/, '')
  const hours    = parseInt(hoursRaw, 10) || null

  // Location: extract city from "Mjåvannsveien 194 Kristiansand 4628, Norge"
  // Heuristic: find the word before a 4-digit postcode
  const lagersted = data['Lagersted'] || ''
  let location    = lagersted
  const cityMatch = lagersted.match(/([A-ZÆØÅ][a-zæøå]+(?:\s[A-ZÆØÅ][a-zæøå]+)*)\s+\d{4}/)
  if (cityMatch) location = cityMatch[1]
  else if (lagersted.includes(',')) location = lagersted.split(',')[0].trim()
  if (!location) location = 'Kristiansand'

  // Category
  const gruppe   = data['Gruppe'] || ''
  const category = mapCategory(urlSegment, gruppe)

  // Weight
  const vektRaw   = (data['Totalvekt'] || '').replace(/\s/g, '').replace(/kg.*/, '')
  const vektKg    = parseInt(vektRaw, 10) || null
  const weightClass = inferWeightClass(vektKg)

  // Brand / model split: "Hitachi ZX 210 LC-6" → brand="Hitachi", model="ZX 210 LC-6"
  const titleParts = title.split(' ')
  const brand = titleParts[0] || null
  const model = titleParts.slice(1).join(' ') || null

  // Description
  const description = data['Beskrivelse'] || null

  return {
    title,
    brand,
    model,
    year,
    category,
    price,
    priceType,
    operating_hours: hours,
    weight_class: weightClass,
    location,
    description,
    imageUrls,
    nastuuid: listingPath.split('/').pop()?.replace('.html', '') || null,
  }
}

// ── Upload image to Supabase Storage ─────────────────────────────────────────

async function uploadImage(imageUrl, listingId, index) {
  const ext      = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
  const filePath = `listings/${listingId}/${index}.${ext}`

  try {
    const buf = await fetchBuffer(imageUrl)
    const { error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, buf, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: true,
      })
    if (error) throw error
    return filePath
  } catch (err) {
    console.warn(`    Image upload failed (${index}): ${err.message}`)
    return null
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 NASTA scraper — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   Seller: ${NASTA_SELLER_ID}\n`)

  // 1. Fetch existing NASTA listings — dedup by title+year+price so same model
  //    at different specs each get their own listing
  const { data: existing } = await supabase
    .from('listings')
    .select('title, year, price')
    .eq('seller_id', NASTA_SELLER_ID)

  const existingKeys = new Set(
    (existing || []).map(l => `${l.title.toLowerCase()}|${l.year}|${l.price}`)
  )
  console.log(`   ${existingKeys.size} existing listings found.\n`)

  // 2. Discover all listing URLs
  console.log('📋 Discovering listing URLs...')
  const paths = await discoverListingUrls()
  console.log(`   Found ${paths.length} unique listing paths.\n`)

  const stats = { created: 0, skipped: 0, failed: 0 }

  // 3. Process each listing
  for (let i = 0; i < paths.length; i++) {
    const listingPath = paths[i]
    const url = `${BASE_URL}${listingPath}`
    process.stdout.write(`[${i + 1}/${paths.length}] ${listingPath.split('/').pop()} `)

    let html
    try {
      html = await fetchHtml(url)
    } catch (err) {
      console.log(`❌ fetch failed: ${err.message}`)
      stats.failed++
      continue
    }

    const parsed = parseListing(html, listingPath)

    const dedupKey = `${parsed.title.toLowerCase()}|${parsed.year}|${parsed.price}`
    if (existingKeys.has(dedupKey)) {
      console.log(`⏭  skip (already exists): "${parsed.title}" ${parsed.year} ${parsed.price}kr`)
      stats.skipped++
      continue
    }

    console.log(`\n   Title:    ${parsed.title}`)
    console.log(`   Category: ${parsed.category} | Year: ${parsed.year} | Hours: ${parsed.operating_hours}h | Price: ${parsed.price} NOK`)
    console.log(`   Location: ${parsed.location} | Images: ${parsed.imageUrls.length}`)

    if (DRY_RUN) {
      console.log(`   ✓ [dry-run] would create listing`)
      stats.created++
      continue
    }

    // Generate a stable UUID-like ID from nasta UUID to allow re-runs
    const listingId = crypto.randomUUID()

    // Upload images (max 20)
    const uploadedPaths = []
    for (let j = 0; j < Math.min(parsed.imageUrls.length, 20); j++) {
      const p = await uploadImage(parsed.imageUrls[j], listingId, j)
      if (p) uploadedPaths.push(p)
      await sleep(150)
    }
    console.log(`   Uploaded ${uploadedPaths.length}/${Math.min(parsed.imageUrls.length, 20)} images`)

    // Build slug
    const slug = `${slugify(parsed.title)}-${listingId.slice(0, 6)}`

    // Insert listing
    const payload = {
      id:              listingId,
      seller_id:       NASTA_SELLER_ID,
      title:           parsed.title,
      category:        parsed.category,
      brand:           parsed.brand,
      model:           parsed.model,
      year:            parsed.year,
      operating_hours: parsed.operating_hours,
      weight_class:    parsed.weight_class ?? null,
      price:           parsed.price,
      price_type:      parsed.priceType,
      location:        parsed.location,
      description:     parsed.description,
      images:          uploadedPaths,
      status:          'draft',
      views:           0,
      slug,
    }

    const { error: insertErr } = await supabase.from('listings').insert(payload)
    if (insertErr) {
      console.log(`   ❌ insert failed: ${insertErr.message}`)
      stats.failed++
    } else {
      console.log(`   ✅ created draft: ${slug}`)
      existingKeys.add(dedupKey)
      stats.created++
    }

    await sleep(300)
  }

  console.log(`\n📊 Done! Created: ${stats.created} | Skipped: ${stats.skipped} | Failed: ${stats.failed}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
