/**
 * Rockmann AS sync — kjører syncRockmannListings fra lib/sync/rockmann-scraper.ts
 *
 * Usage:
 *   npm run sync:rockmann
 *   node --import tsx/esm scripts/sync-rockmann.mjs
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * and ROCKMANN_SELLER_ID.
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
  const { syncRockmannListings, writeRockmannSyncLog } =
    await import('../lib/sync/rockmann-scraper.js')

  console.log('[rockmann] Starter sync...')

  try {
    const result = await syncRockmannListings()
    await writeRockmannSyncLog(result, 'success')
    console.log('[rockmann] Ferdig:', result)
  } catch (err) {
    console.error('[rockmann] FEIL:', err.message)
    process.exit(1)
  }
}

main()
