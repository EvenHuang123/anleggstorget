import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, verified } = await request.json()
  if (!userId || typeof verified !== 'boolean') return NextResponse.json({ error: 'Ugyldig input' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await (supabase as any).from('profiles').update({ verified }).eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
