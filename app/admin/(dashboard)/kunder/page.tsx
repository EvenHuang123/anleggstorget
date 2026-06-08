import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import KunderClient from './KunderClient'

export const dynamic = 'force-dynamic'

export default async function AdminKunderPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  // Fetch profiles
  const { data: profiles } = await (supabase as any)
    .from('profiles')
    .select('id, company_name, org_number, contact_person, phone, verified, created_at')
    .order('created_at', { ascending: false }) as { data: Profile[] | null }

  // Fetch all auth users (to get emails)
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap: Record<string, string> = {}
  for (const u of authData?.users ?? []) {
    emailMap[u.id] = u.email ?? ''
  }

  // Count active listings per seller
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
    email: emailMap[p.id] ?? '',
    activeListings: listingCounts[p.id] ?? 0,
  }))

  return <KunderClient initialRows={rows} />
}

interface Profile {
  id: string
  company_name: string
  org_number: string
  contact_person: string | null
  phone: string | null
  verified: boolean
  created_at: string
}
