/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InquiriesList from '@/components/dashboard/InquiriesList'
import type { InquiryWithContext } from '@/components/dashboard/InquiriesList'

export default async function ForesporslerPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/logg-inn')

  // Resolve profile.id via user_id (scraped sellers have profile.id ≠ auth user id)
  const { data: sellerProfile } = await (supabase as any)
    .from('profiles').select('id').eq('user_id', session.user.id).single() as { data: { id: string } | null }
  const sellerId = sellerProfile?.id ?? session.user.id

  // Get the current user's listing IDs first (PostgREST can't filter on joined table in a count)
  const { data: userListings } = await (supabase as any)
    .from('listings')
    .select('id')
    .eq('seller_id', sellerId) as { data: { id: string }[] | null }

  const listingIds = (userListings || []).map(l => l.id)

  let inquiries: InquiryWithContext[] = []
  if (listingIds.length > 0) {
    const { data } = await (supabase as any)
      .from('inquiries')
      .select(`
        id, message, email, phone, status, created_at,
        listing:listings ( id, title, price, category, images ),
        sender:profiles!sender_id ( company_name, contact_person, phone )
      `)
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false }) as { data: InquiryWithContext[] | null }

    inquiries = data || []
  }

  const newCount = inquiries.filter(i => i.status === 'new').length

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 24,
            color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0,
          }}>
            Forespørsler
          </h1>
          {newCount > 0 && (
            <span style={{
              background: 'var(--gold)', color: '#0d0c0a',
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 12,
              padding: '2px 8px', borderRadius: 10,
            }}>
              {newCount} ny{newCount !== 1 ? 'e' : ''}
            </span>
          )}
        </div>
        <p style={{ color: 'var(--t3)', fontSize: 14 }}>
          {inquiries.length} {inquiries.length === 1 ? 'forespørsel' : 'forespørsler'} totalt
        </p>
      </div>

      <InquiriesList inquiries={inquiries} />
    </div>
  )
}
