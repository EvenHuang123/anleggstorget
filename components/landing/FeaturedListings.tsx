import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/public'
import AnimatedListingGrid from '@/components/landing/AnimatedListingGrid'
import type { Listing } from '@/lib/supabase/types'

async function getFeaturedListings(): Promise<Listing[]> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(company_name, verified, org_number), favorites_count:favorites(count)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)
    const listings = (data as Listing[]) || []
    return listings.sort((a, b) =>
      (b.favorites_count?.[0]?.count ?? 0) - (a.favorites_count?.[0]?.count ?? 0)
    ).slice(0, 6)
  } catch {
    return []
  }
}

export default async function FeaturedListings() {
  const listings = await getFeaturedListings()

  if (listings.length === 0) return null

  return (
    <section className="section" style={{ background: 'var(--bg)' }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, gap: 16 }}>
          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Mest favorittmarkerte</p>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
              Populære maskiner nå
            </h2>
          </div>
          <Link href="/sok" className="btn-secondary" style={{ flexShrink: 0 }}>
            Se alle <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid — scroll-triggered staggered animation */}
        <AnimatedListingGrid listings={listings.slice(0, 6)} />

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/sok" className="btn-primary" style={{ padding: '14px 36px', fontSize: 14 }}>
            Se alle annonser
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <style>{`
        .listing-grid-3 { grid-template-columns: repeat(3,1fr) !important; }
        @media (max-width: 900px) { .listing-grid-3 { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .listing-grid-3 { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
