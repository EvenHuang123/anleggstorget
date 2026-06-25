import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) as any

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Atomic increment via RPC. Create once in Supabase:
  // create or replace function increment_views(listing_id uuid)
  // returns void language sql as $$
  //   update listings set views = views + 1 where id = listing_id;
  // $$;
  const { error } = await supabase.rpc('increment_views', { listing_id: id })

  if (error) {
    // Graceful fallback: read-then-write (acceptable for view counts)
    const { data } = await supabase.from('listings').select('views').eq('id', id).single()
    if (data) {
      await supabase.from('listings').update({ views: (data.views ?? 0) + 1 }).eq('id', id)
    }
  }

  return NextResponse.json({ ok: true })
}
