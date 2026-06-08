import { NextRequest, NextResponse } from 'next/server'
import { syncHesselbergListings, writeHesselbergSyncLog } from '@/lib/sync/hesselberg-scraper'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const auth   = request.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const empty: import('@/lib/sync/hesselberg-scraper').SyncResult = {
    created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0,
  }

  try {
    const result = await syncHesselbergListings()
    await writeHesselbergSyncLog(result, 'success')
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sync-hesselberg]', message)
    await writeHesselbergSyncLog(empty, 'error', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
