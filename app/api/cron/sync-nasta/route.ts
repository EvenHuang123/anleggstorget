import { syncNASTAListings, writeSyncLog } from '@/lib/sync/nasta-scraper'

export const maxDuration = 300

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (token !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const empty: import('@/lib/sync/nasta-scraper').SyncResult = {
    created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0,
  }

  try {
    const result = await syncNASTAListings()
    await writeSyncLog(result, 'success')
    return Response.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sync-nasta]', message)
    await writeSyncLog(empty, 'failed', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
