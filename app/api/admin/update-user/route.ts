import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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
  if (body.companyName   !== undefined) profilePatch.company_name   = body.companyName
  if (body.orgNumber     !== undefined) profilePatch.org_number     = body.orgNumber
  if (body.contactPerson !== undefined) profilePatch.contact_person = body.contactPerson
  if (body.phone         !== undefined) profilePatch.phone          = body.phone
  if (body.verified      !== undefined) profilePatch.verified       = body.verified
  if (body.notes         !== undefined) profilePatch.notes          = body.notes

  if (Object.keys(profilePatch).length > 0) {
    const { error } = await (supabase as any)
      .from('profiles')
      .update(profilePatch)
      .eq('id', userId)
    if (error) errors.push('Profil: ' + error.message)
  }

  // ── 2. Update Supabase Auth user — only if user exists and fields changed ─
  // Safe destructuring: getUserById returns { data: null } when user doesn't exist
  const getUserResult = await supabase.auth.admin.getUserById(userId)
  const currentUser = getUserResult.data?.user ?? null

  if (currentUser) {
    const authPatch: Record<string, unknown> = {}

    if (body.email !== undefined && body.email !== currentUser.email) {
      // Service role bypasses email confirmation automatically — email_confirm is
      // not a valid field on updateUserById (only on createUser) and causes errors.
      authPatch.email = body.email
    }

    if (body.password !== undefined) {
      authPatch.password = body.password
    }

    if (body.active !== undefined) {
      const now = new Date()
      const isBanned = !!(currentUser as any).banned_until &&
        new Date((currentUser as any).banned_until) > now
      const wantsBanned = !body.active

      // Only change ban state if it actually needs to change
      if (isBanned && !wantsBanned) {
        authPatch.ban_duration = 'none'
      } else if (!isBanned && wantsBanned) {
        authPatch.ban_duration = '876000h'
      }
      // If already in the desired state, don't touch ban_duration at all
    }

    if (Object.keys(authPatch).length > 0) {
      const { error } = await supabase.auth.admin.updateUserById(userId, authPatch as any)
      if (error) errors.push('Auth: ' + error.message)
    }
  }
  // If currentUser is null (scraper/system profile with no real auth user),
  // skip auth update — profiles table update already happened above.

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(' | ') }, { status: 422 })
  }

  // Invalidate ISR cache so profile/listing changes appear immediately on the site
  revalidatePath('/annonse', 'layout')
  revalidatePath('/selgere', 'layout')

  return NextResponse.json({ ok: true })
}
