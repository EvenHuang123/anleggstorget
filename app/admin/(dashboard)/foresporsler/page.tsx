import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/admin/supabase'
import ForesporslerClient from './ForesporslerClient'

export const dynamic = 'force-dynamic'

export interface InquiryRow {
  id: string
  message: string
  email: string | null
  phone: string | null
  status: string | null
  created_at: string
  updated_at: string | null
  listing_title: string | null
  listing_id: string | null
  listing_category: string | null
  seller_name: string | null
  seller_id: string | null
  sender_name: string | null
}

export default async function AdminForesporslerPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: raw } = await (supabase as any)
    .from('inquiries')
    .select(`
      id, message, email, phone, status, created_at, updated_at,
      listing:listings!listing_id(
        id, title, category, seller_id,
        seller:profiles!seller_id(id, company_name)
      ),
      sender:profiles!sender_id(id, company_name)
    `)
    .order('created_at', { ascending: false })
    .limit(500) as { data: any[] | null }

  const rows: InquiryRow[] = (raw ?? []).map((r: any) => ({
    id:               r.id,
    message:          r.message ?? '',
    email:            r.email ?? null,
    phone:            r.phone ?? null,
    status:           r.status ?? 'new',
    created_at:       r.created_at,
    updated_at:       r.updated_at ?? null,
    listing_id:       r.listing?.id ?? null,
    listing_title:    r.listing?.title ?? null,
    listing_category: r.listing?.category ?? null,
    seller_id:        r.listing?.seller_id ?? null,
    seller_name:      r.listing?.seller?.company_name ?? null,
    sender_name:      r.sender?.company_name ?? null,
  }))

  const total     = rows.length
  const answered  = rows.filter(r => r.status === 'answered' || r.status === 'replied').length
  const rate      = total > 0 ? Math.round((answered / total) * 100) : 0

  // Average response time in hours
  const withBoth = rows.filter(r => r.updated_at && r.status !== 'new' && r.status !== null)
  const avgHours = withBoth.length > 0
    ? Math.round(withBoth.reduce((sum, r) => {
        const diff = new Date(r.updated_at!).getTime() - new Date(r.created_at).getTime()
        return sum + diff / 3_600_000
      }, 0) / withBoth.length)
    : null

  return (
    <ForesporslerClient
      rows={rows}
      stats={{ total, answered, rate, avgHours }}
    />
  )
}
