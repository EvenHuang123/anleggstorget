import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) as any

const paramsSchema = z.object({ id: z.string().uuid() })

function detectDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const raw = await params
  const parsed = paramsSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ugyldig ID' }, { status: 400 })
  }

  const { id } = parsed.data

  // Skip admin traffic (admin session cookie)
  if (req.cookies.has('admin_session') || req.cookies.has('sb-admin')) {
    return NextResponse.json({ ok: true })
  }

  // Increment view counter (existing behaviour)
  const { error } = await supabase.rpc('increment_views', { listing_id: id })
  if (error) {
    const { data } = await supabase.from('listings').select('views').eq('id', id).single()
    if (data) {
      await supabase.from('listings').update({ views: (data.views ?? 0) + 1 }).eq('id', id)
    }
  }

  // Log anonymous view into listing_views — no IP, no user ID (GDPR safe)
  const ua      = req.headers.get('user-agent') ?? ''
  const referer = req.headers.get('referer') ?? null
  let referrerHost: string | null = null
  try { if (referer) referrerHost = new URL(referer).hostname } catch { /* ignore invalid URL */ }

  await supabase.from('listing_views').insert({
    listing_id:  id,
    referrer:    referrerHost,
    device_type: detectDevice(ua),
  })

  return NextResponse.json({ ok: true })
}
