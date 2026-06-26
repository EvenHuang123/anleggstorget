import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ── Admin auth ────────────────────────────────────────────────────────────────

const ADMIN_COOKIE = 'admin_session'

async function verifyAdminToken(token: string, secret: string): Promise<boolean> {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return false
  try {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode('admin-auth-v1'))
    const expected = Array.from(new Uint8Array(sigBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return token === expected
  } catch {
    return false
  }
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory per Edge instance. For horizontal scale, replace with Upstash Redis.

const rateLimitMap = new Map<string, { count: number; reset: number }>()

function isRateLimited(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now > record.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs })
    return false
  }
  if (record.count >= limit) return true
  record.count++
  return false
}

// ── Proxy (middleware) ────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes — HMAC cookie check
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()

    const token = request.cookies.get(ADMIN_COOKIE)?.value ?? ''
    const secret = process.env.ADMIN_SECRET ?? ''

    if (!(await verifyAdminToken(token, secret))) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Rate-limit offentlige API-routes — 30 kall/minutt per IP
  if (
    pathname.startsWith('/api/saved-searches') ||
    pathname.startsWith('/api/listings')
  ) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60' },
      })
    }
    return NextResponse.next()
  }

  // Auth-beskyttelse for innloggede ruter via Supabase SSR
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/ny-annonse')
  ) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // getUser() verifiserer token mot Supabase Auth — sikrere enn getSession()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/logg-inn', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/ny-annonse/:path*',
    '/api/saved-searches/:path*',
    '/api/listings/:path*',
  ],
}
