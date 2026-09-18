import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCredentials, getSessionToken, COOKIE_NAME } from '@/lib/admin/auth'

const schema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(128),
})

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || !verifyCredentials(parsed.data.username, parsed.data.password)) {
    return NextResponse.json({ error: 'Ugyldig brukernavn eller passord' }, { status: 401 })
  }

  const token = getSessionToken()
  const response = NextResponse.json({ ok: true })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
