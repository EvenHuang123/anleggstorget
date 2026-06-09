import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin/auth'
import { syncNASTAListings, writeSyncLog } from '@/lib/sync/nasta-scraper'
import { syncHesselbergListings, writeHesselbergSyncLog } from '@/lib/sync/hesselberg-scraper'
import { syncRockmannListings, writeRockmannSyncLog } from '@/lib/sync/rockmann-scraper'

export const maxDuration = 300
export const preferredRegion = 'fra1'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { source } = await request.json().catch(() => ({})) as { source?: string }

  if (source === 'nasta') {
    try {
      const result = await syncNASTAListings()
      await writeSyncLog(result, 'success')
      return NextResponse.json({ ok: true, ...result })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await writeSyncLog({ created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0 }, 'error', message)
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  if (source === 'hesselberg') {
    try {
      const result = await syncHesselbergListings()
      await writeHesselbergSyncLog(result, 'success')
      return NextResponse.json({ ok: true, ...result })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await writeHesselbergSyncLog({ created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0 }, 'error', message)
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  if (source === 'rockmann') {
    try {
      const result = await syncRockmannListings()
      await writeRockmannSyncLog(result, 'success')
      return NextResponse.json({ ok: true, ...result })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await writeRockmannSyncLog({ created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0 }, 'error', message)
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Ugyldig source. Bruk "nasta", "hesselberg" eller "rockmann".' }, { status: 400 })
}
