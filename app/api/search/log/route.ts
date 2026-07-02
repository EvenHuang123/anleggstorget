import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) as any

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }) }

  const { query, results_count, filters } = body as {
    query: string
    results_count: number
    filters?: Record<string, unknown>
  }

  // Sanity check — don't log garbage
  if (typeof query !== 'string' || typeof results_count !== 'number') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // Fire-and-forget — don't let logging failures affect search UX
  await supabase.from('search_queries').insert({
    query:         query.trim(),
    results_count: Math.max(0, results_count),
    filters:       filters ?? null,
  })

  return NextResponse.json({ ok: true })
}
