import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, query, category, brand, max_price } = body as Record<string, unknown>

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 })
  }

  const { error } = await (supabase as any).from('saved_searches').insert({
    email: email.trim().toLowerCase(),
    query:     typeof query     === 'string' ? query     : null,
    category:  typeof category  === 'string' ? category  : null,
    brand:     typeof brand     === 'string' ? brand     : null,
    max_price: typeof max_price === 'number' ? max_price : null,
  })

  if (error) {
    console.error('saved_searches insert error:', error)
    return NextResponse.json({ error: 'Kunne ikke lagre varsling' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
