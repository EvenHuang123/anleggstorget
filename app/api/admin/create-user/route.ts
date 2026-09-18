import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'

const schema = z.object({
  email:         z.string().email().max(254),
  password:      z.string().min(8).max(128),
  companyName:   z.string().min(1).max(200),
  orgNumber:     z.string().regex(/^\d{9}$/),
  contactPerson: z.string().max(200).optional(),
  phone:         z.string().max(30).optional(),
})

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Manglende påkrevde felt' }, { status: 400 })
  }
  const { email, password, companyName, orgNumber, contactPerson, phone } = parsed.data

  const supabase = createAdminClient()

  // 1. Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) {
    const msg = authErr.message.includes('already registered')
      ? 'E-postadressen er allerede i bruk'
      : authErr.message
    return NextResponse.json({ error: msg }, { status: 422 })
  }

  const userId = authData.user.id

  // 2. Create profile
  const { error: profileErr } = await (supabase as any).from('profiles').insert({
    id:             crypto.randomUUID(),
    user_id:        userId,
    company_name:   companyName,
    org_number:     orgNumber,
    contact_person: contactPerson ?? null,
    email:          email,
    verified:       true,
  })

  if (profileErr) {
    // Roll back auth user
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Kunne ikke opprette bedriftsprofil: ' + profileErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, userId, email })
}
