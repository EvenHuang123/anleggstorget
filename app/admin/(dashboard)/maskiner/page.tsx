import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import MaskinerClient from './MaskinerClient'

export const dynamic = 'force-dynamic'

export default async function AdminMaskinerPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: listings } = await (supabase as any)
    .from('listings')
    .select('id, title, category, price, source, status, created_at, slug, images, seller_id, profiles(company_name)')
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return <MaskinerClient initialListings={listings ?? []} />
}
