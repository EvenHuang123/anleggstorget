import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const schema = z.object({
  query:         z.string().max(500),
  results_count: z.number().int().min(0).max(100_000),
  filters:       z.record(z.string(), z.unknown()).optional(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) as any

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  const { query, results_count, filters } = parsed.data

  // Fire-and-forget — don't let logging failures affect search UX
  await supabase.from('search_queries').insert({
    query:         query.trim(),
    results_count,
    filters:       filters ?? null,
  })

  return NextResponse.json({ ok: true })
}
