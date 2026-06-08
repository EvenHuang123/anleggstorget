import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'

interface UpdatePayload {
  userId: string
  companyName?: string
  orgNumber?: string
  contactPerson?: string | null
  phone?: string | null
  email?: string
  verified?: boolean
  active?: boolean
  password?: string
  notes?: string | null
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!verifyAdminToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: UpdatePayload = await request.json().catch(() => ({}))
  const { userId } = body
  if (!userId) return NextResponse.json({ error: 'userId påkrevd' }, { status: 400 })

  const supabase = createAdminClient()
  const errors: string[] = []

  // ── 1. Update profiles table ──────────────────────────────────────────────
  const profilePatch: Record<string, unknown> = {}
  if (body.companyName  !== undefined) profilePatch.company_name   = body.companyName
  if (body.orgNumber    !== undefined) profilePatch.org_number      = body.orgNumber
  if (body.contactPerson !== undefined) profilePatch.contact_person = body.contactPerson
  if (body.phone        !== undefined) profilePatch.phone           = body.phone
  if (body.verified     !== undefined) profilePatch.verified        = body.verified
  if (body.notes        !== undefined) profilePatch.notes           = body.notes

  if (Object.keys(profilePatch).length > 0) {
    const { error } = await (supabase as any)
      .from('profiles')
      .update(profilePatch)
      .eq('id', userId)
    if (error) errors.push('Profil: ' + error.message)
  }

  // ── 2. Update Supabase Auth user (email, password, ban) ──────────────────
  const authPatch: Record<string, unknown> = {}
  if (body.email    !== undefined) authPatch.email    = body.email
  if (body.password !== undefined) authPatch.password = body.password
  if (body.active   !== undefined) {
    // ban_duration: 'none' = active, '876000h' (~100 years) = effectively permanent ban
    authPatch.ban_duration = body.active ? 'none' : '876000h'
  }

  if (Object.keys(authPatch).length > 0) {
    const { error } = await supabase.auth.admin.updateUserById(userId, authPatch as any)
    if (error) errors.push('Auth: ' + error.message)
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(' | ') }, { status: 422 })
  }

  return NextResponse.json({ ok: true })
}
