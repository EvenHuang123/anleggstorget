import { NextRequest, NextResponse } from 'next/server'
import { syncNASTAListings, writeSyncLog } from '@/lib/sync/nasta-scraper'

// Vercel cron jobs call this endpoint. Set CRON_SECRET in Vercel env vars.
// Vercel automatically passes Authorization: Bearer {CRON_SECRET} from their servers.
export const maxDuration = 300 // 5 min — increase in Vercel project settings if needed

export async function GET(request: NextRequest) {
  const auth    = request.headers.get('authorization') ?? ''
  const secret  = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const empty: import('@/lib/sync/nasta-scraper').SyncResult = {
    created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0,
  }

  try {
    const result = await syncNASTAListings()
    await writeSyncLog(result, 'success')
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sync-nasta]', message)
    await writeSyncLog(empty, 'error', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
