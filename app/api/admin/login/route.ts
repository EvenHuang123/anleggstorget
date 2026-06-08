import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, getSessionToken, COOKIE_NAME } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { username, password } = body as { username?: string; password?: string }

  if (!username || !password || !verifyCredentials(username, password)) {
    return NextResponse.json({ error: 'Ugyldig brukernavn eller passord' }, { status: 401 })
  }

  const token = getSessionToken()
  const response = NextResponse.json({ ok: true })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}
