import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  if (!id) return NextResponse.json({ error: 'Mangler id' }, { status: 400 })

  const supabase = createAdminClient()

  // 1. Nullstill seller_id på listings — bevar annonsene
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: listingsErr } = await (supabase as any)
    .from('listings')
    .update({ seller_id: null })
    .eq('seller_id', id)

  if (listingsErr) {
    return NextResponse.json({ error: `listings: ${listingsErr.message}` }, { status: 500 })
  }

  // 2. Slett profil
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileErr } = await (supabase as any)
    .from('profiles')
    .delete()
    .eq('id', id)

  if (profileErr) {
    return NextResponse.json({ error: `profiles: ${profileErr.message}` }, { status: 500 })
  }

  // 3. Slett auth-bruker (ignorer "not found" siden profil kan eksistere uten auth)
  const { error: authErr } = await supabase.auth.admin.deleteUser(id)
  if (authErr) {
    const msg = authErr.message.toLowerCase()
    if (!msg.includes('not found') && !msg.includes('user not found')) {
      return NextResponse.json({ error: `auth: ${authErr.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
