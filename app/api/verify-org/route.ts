import { NextRequest, NextResponse } from 'next/server'
import { verifyOrgNumber } from '@/lib/brreg'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const orgNumber = body?.orgNumber

  if (!orgNumber || typeof orgNumber !== 'string') {
    return NextResponse.json(
      { valid: false, name: null, error: 'orgNumber er påkrevd' },
      { status: 400 }
    )
  }

  const result = await verifyOrgNumber(orgNumber)
  return NextResponse.json(result, { status: result.valid ? 200 : 422 })
}
