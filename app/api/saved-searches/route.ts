import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const schema = z.object({
  email:     z.string().email().max(255),
  query:     z.string().max(200).optional(),
  category:  z.string().max(100).optional(),
  brand:     z.string().max(100).optional(),
  max_price: z.number().int().positive().max(100_000_000).optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ugyldig JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ugyldig input' }, { status: 400 })
  }

  const { email, query, category, brand, max_price } = parsed.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('saved_searches').insert({
    email:     email.trim().toLowerCase(),
    query:     query    ?? null,
    category:  category ?? null,
    brand:     brand    ?? null,
    max_price: max_price ?? null,
  })

  if (error) {
    console.error('saved_searches insert error:', error)
    return NextResponse.json({ error: 'Kunne ikke lagre varsling' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
