/**
 * Rockmann AS sync — kjører syncRockmannListings + detaljside-fetching
 *
 * Usage:
 *   npm run sync:rockmann
 *
 * Requires .env.local med NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * og ROCKMANN_SELLER_ID.
 */

import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Load .env.local ───────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath   = path.join(__dirname, '../.env.local')

function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch { /* ignore missing file */ }
}

loadEnv(envPath)

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { syncRockmannListings, writeRockmannSyncLog, fetchRockmannDetail } =
    await import('../lib/sync/rockmann-scraper.js')

  const { createClient } = await import('@supabase/supabase-js')

  console.log('[rockmann] Starter sync...')

  try {
    // 1. Kjør vanlig sync (insert/update/soft-delete)
    const result = await syncRockmannListings()
    await writeRockmannSyncLog(result, 'success')
    console.log('[rockmann] Sync ferdig:', result)

    // 2. Hent detaljdata for alle aktive Rockmann-listings
    console.log('[rockmann] Starter detaljside-fetching...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    )

    const { data: listings } = await supabase
      .from('listings')
      .select('id, source_external_id, images, operating_hours')
      .eq('source', 'rockmann')
      .eq('status', 'active')

    let updated = 0
    for (const listing of listings ?? []) {
      const detail = await fetchRockmannDetail(listing.source_external_id)

      if (detail.images.length > 1 || detail.hours !== null) {
        const { error } = await supabase
          .from('listings')
          .update({
            images:          detail.images.length > 0 ? detail.images : listing.images,
            operating_hours: detail.hours,
          })
          .eq('id', listing.id)

        if (!error) {
          updated++
          console.log(`[rockmann] Oppdatert: ${listing.source_external_id} — ${detail.images.length} bilder, ${detail.hours ?? '–'} timer`)
        }
      }
    }

    console.log(`[rockmann] Detaljfetching ferdig: ${updated} listings oppdatert`)

  } catch (err) {
    console.error('[rockmann] FEIL:', err.message)
    process.exit(1)
  }
}

main()
