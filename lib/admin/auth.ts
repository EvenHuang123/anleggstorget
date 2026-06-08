import crypto from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = 'admin_session'

function computeToken(secret: string): string {
  return crypto.createHmac('sha256', secret).update('admin-auth-v1').digest('hex')
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return false
  const secret = process.env.ADMIN_SECRET!
  const expected = computeToken(secret)
  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export function verifyCredentials(username: string, password: string): boolean {
  const u1 = process.env.ADMIN_USERNAME ?? ''
  const p1 = process.env.ADMIN_PASSWORD ?? ''
  const u2 = process.env.ADMIN_USERNAME_2 ?? ''
  const p2 = process.env.ADMIN_PASSWORD_2 ?? ''
  return (username === u1 && password === p1) || (username === u2 && password === p2 && u2 !== '')
}

export function getSessionToken(): string {
  return computeToken(process.env.ADMIN_SECRET!)
}

export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!verifyAdminToken(token)) redirect('/admin/login')
}

export { COOKIE_NAME }
