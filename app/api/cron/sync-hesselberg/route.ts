import { syncHesselbergListings, writeHesselbergSyncLog } from '@/lib/sync/hesselberg-scraper'

export const maxDuration = 300
export const preferredRegion = 'fra1'

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')

  if (token !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const empty: import('@/lib/sync/hesselberg-scraper').SyncResult = {
    created: 0, updated: 0, removed: 0, totalScraped: 0, errors: 0, durationMs: 0,
  }

  try {
    const result = await syncHesselbergListings()
    await writeHesselbergSyncLog(result, 'success')
    return Response.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sync-hesselberg]', message)
    await writeHesselbergSyncLog(empty, 'failed', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
