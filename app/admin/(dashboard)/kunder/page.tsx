import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import KunderClient from './KunderClient'

export const dynamic = 'force-dynamic'

export default async function AdminKunderPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: profiles } = await (supabase as any)
    .from('profiles')
    .select('id, company_name, org_number, contact_person, phone, email, verified, notes, updated_at, created_at')
    .order('created_at', { ascending: false }) as { data: Profile[] | null }

  const { data: listingRows } = await (supabase as any)
    .from('listings')
    .select('seller_id')
    .eq('status', 'active') as { data: { seller_id: string }[] | null }

  const listingCounts: Record<string, number> = {}
  for (const r of listingRows ?? []) {
    listingCounts[r.seller_id] = (listingCounts[r.seller_id] ?? 0) + 1
  }

  const rows = (profiles ?? []).map(p => ({
    ...p,
    email: p.email ?? '',
    active: true,
    notes: p.notes ?? null,
    updated_at: p.updated_at ?? null,
    activeListings: listingCounts[p.id] ?? 0,
  }))

  return <KunderClient initialRows={rows} />
}

interface Profile {
  id: string
  company_name: string
  org_number: string
  email: string | null
  contact_person: string | null
  phone: string | null
  verified: boolean
  notes: string | null
  created_at: string
  updated_at: string | null
}
