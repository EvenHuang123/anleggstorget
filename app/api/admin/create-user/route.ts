import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { email, password, companyName, orgNumber, contactPerson, phone } = body as {
    email?: string; password?: string; companyName?: string
    orgNumber?: string; contactPerson?: string; phone?: string
  }

  if (!email || !password || !companyName || !orgNumber) {
    return NextResponse.json({ error: 'Manglende påkrevde felt' }, { status: 400 })
  }

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
    id: userId,
    company_name: companyName,
    org_number: orgNumber,
    contact_person: contactPerson ?? null,
    phone: phone ?? null,
    verified: true,
  })

  if (profileErr) {
    // Roll back auth user
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Kunne ikke opprette bedriftsprofil: ' + profileErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, userId, email })
}
