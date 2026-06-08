import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin/auth'

export const maxDuration = 30
export const preferredRegion = 'fra1'

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,en;q=0.7',
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = 'https://brukt.hesselberg.no/hesselberg/anlegg/'
  let status = 0
  let finalUrl = url
  let htmlLength = 0
  let htmlPreview = ''
  let listingLinksFound = 0
  let fetchError: string | null = null

  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20_000) })
    status    = res.status
    finalUrl  = res.url
    const html = await res.text()
    htmlLength = html.length
    htmlPreview = html.substring(0, 800)

    const links = new Set(
      [...html.matchAll(/href="(\/hesselberg\/anlegg\/[^"]+\.html)"/g)].map(m => m[1])
    )
    listingLinksFound = links.size
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json({
    testedFrom: 'fra1 (Frankfurt)',
    url,
    finalUrl,
    httpStatus: status,
    htmlLength,
    listingLinksFound,
    fetchError,
    htmlPreview,
  })
}
