import { NextRequest, NextResponse } from 'next/server'
import { syncRockmannListings, writeRockmannSyncLog } from '@/lib/sync/rockmann-scraper'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const auth   = request.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const empty: import('@/lib/sync/rockmann-scraper').SyncResult = {
    created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0,
  }

  try {
    const result = await syncRockmannListings()
    await writeRockmannSyncLog(result, 'success')
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sync-rockmann]', message)
    await writeRockmannSyncLog(empty, 'error', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
