/**
 * Fetches Totalvekt for all NASTA listings and updates weight_class in Supabase.
 * Run once: node scripts/fix-weight-class.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '../.env.local')

function loadEnv(f) {
  try {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch { /* ignore */ }
}
loadEnv(envPath)

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const SELLER_ID = 'fc88b0fc-ef94-4199-876c-72d97424055d'
const BASE = 'https://bruktmarked.nasta.no'

function kgToWeightClass(kg) {
  if (kg <  5000) return 'Under 5 tonn'
  if (kg < 10000) return '5–10 tonn'
  if (kg < 20000) return '10–20 tonn'
  if (kg < 40000) return '20–40 tonn'
  return 'Over 40 tonn'
}

function extractDataPairs(html) {
  const pairs = {}
  const rowRe = /<tr[^>]*class="item[^"]*"[^>]*>([\s\S]*?)<\/tr>/g
  let m
  while ((m = rowRe.exec(html)) !== null) {
    const spans = [...m[1].matchAll(/<span class="data">([\s\S]*?)<\/span>/g)]
    if (spans.length >= 2) {
      const key   = spans[0][1].replace(/<[^>]+>/g, '').trim()
      const value = spans[1][1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      if (key && value) pairs[key] = value
    }
  }
  return pairs
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function discoverPaths() {
  const paths = new Set()
  for (let page = 1; page <= 20; page++) {
    const url = page === 1
      ? `${BASE}/nastaas/anlegg/`
      : `${BASE}/nastaas/anlegg,${page},createdate_desc,search.html`
    const html = await fetchHtml(url)
    const re = /href="(\/nastaas\/anlegg\/[^"]+\.html)"/g
    let m
    while ((m = re.exec(html)) !== null) paths.add(m[1])
    if (!new RegExp(`/nastaas/anlegg,${page + 1},`).test(html)) break
    await sleep(300)
  }
  return [...paths]
}

async function main() {
  // Fetch listings with NULL weight_class from DB
  const { data: listings } = await sb
    .from('listings')
    .select('id, title, category')
    .eq('seller_id', SELLER_ID)
    .is('weight_class', null)

  if (!listings?.length) {
    console.log('No listings with missing weight_class.')
    return
  }
  console.log(`${listings.length} listings need weight_class.\n`)

  // Scrape NASTA for Totalvekt per title
  const paths = await discoverPaths()
  console.log(`Found ${paths.length} listing pages on NASTA.\n`)

  // Map: title (lowercase) → weight_class string
  const weightMap = {}

  for (const listingPath of paths) {
    const url = `${BASE}${listingPath}`
    let html
    try { html = await fetchHtml(url) } catch { await sleep(500); continue }

    const data   = extractDataPairs(html)
    const h1m    = html.match(/<h1[^>]*class="main_header"[^>]*>([^<]+)<\/h1>/)
    const title  = h1m ? h1m[1].trim() : null
    if (!title) continue

    const vektRaw = (data['Totalvekt'] || '').replace(/\s/g, '').replace(/kg.*/i, '')
    const kg      = parseInt(vektRaw, 10)

    if (!isNaN(kg) && kg > 0) {
      const wc = kgToWeightClass(kg)
      weightMap[title.toLowerCase()] = wc
      console.log(`  ${title.padEnd(35)} ${kg} kg → ${wc}`)
    } else {
      console.log(`  ${title.padEnd(35)} no Totalvekt`)
    }
    await sleep(200)
  }

  console.log('\nUpdating DB...\n')

  let updated = 0
  for (const listing of listings) {
    const wc = weightMap[listing.title.toLowerCase()]
    if (!wc) {
      console.log(`  ⚠  no weight data for: ${listing.title}`)
      continue
    }
    const { error } = await sb
      .from('listings')
      .update({ weight_class: wc })
      .eq('id', listing.id)
    if (error) {
      console.log(`  ❌ ${listing.title}: ${error.message}`)
    } else {
      console.log(`  ✅ ${listing.title} → ${wc}`)
      updated++
    }
  }

  console.log(`\nDone. Updated ${updated}/${listings.length} listings.`)
}

main().catch(err => { console.error(err); process.exit(1) })
