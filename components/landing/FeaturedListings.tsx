import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/listings/ListingCard'
import type { Listing } from '@/lib/supabase/types'

async function getFeaturedListings(): Promise<Listing[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(company_name, verified, org_number)')
      .eq('status', 'active')
      .order('views', { ascending: false })
      .limit(6)
    return (data as Listing[]) || []
  } catch {
    return []
  }
}

const DEMO_LISTINGS: Listing[] = [
  {
    id: '1', seller_id: 'a', category: 'gravemaskin',
    title: 'Volvo EC480E Gravemaskin', description: 'Velholdt gravemaskin fra 2021.',
    brand: 'Volvo', model: 'EC480E', year: 2021, operating_hours: 3200,
    weight_class: '40-50 tonn', price: 3850000, price_type: 'fast_price',
    location: 'Vestland', status: 'active', images: [], featured: true, views: 142,
    created_at: '2026-04-15T08:00:00Z', updated_at: '2026-04-15T08:00:00Z',
    profiles: { id: 'a', company_name: 'Bergvik Maskin AS', org_number: '123456789', contact_person: null, phone: null, verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  {
    id: '2', seller_id: 'b', category: 'traktor',
    title: 'John Deere 6175R Autopowr', description: 'Toppmodell traktor med autopowr girkasse.',
    brand: 'John Deere', model: '6175R', year: 2022, operating_hours: 1800,
    weight_class: '8-10 tonn', price: 1250000, price_type: 'negotiable',
    location: 'Innlandet', status: 'active', images: [], featured: true, views: 98,
    created_at: '2026-04-14T10:00:00Z', updated_at: '2026-04-14T10:00:00Z',
    profiles: { id: 'b', company_name: 'Hauge Gård AS', org_number: '987654321', contact_person: null, phone: null, verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  {
    id: '3', seller_id: 'c', category: 'hjullaster',
    title: 'Caterpillar 950M Hjullaster', description: 'Effektiv hjullaster i god stand.',
    brand: 'Caterpillar', model: '950M', year: 2020, operating_hours: 5100,
    weight_class: '15-20 tonn', price: 2100000, price_type: 'fast_price',
    location: 'Trøndelag', status: 'active', images: [], featured: false, views: 76,
    created_at: '2026-04-13T09:00:00Z', updated_at: '2026-04-13T09:00:00Z',
    profiles: { id: 'c', company_name: 'Trøndermaskin AS', org_number: '111222333', contact_person: null, phone: null, verified: false, created_at: '2026-01-01T00:00:00Z' },
  },
  {
    id: '4', seller_id: 'd', category: 'dumper',
    title: 'Komatsu HM400-5 Articulated Dumper', description: 'Stor dumper med god kapasitet.',
    brand: 'Komatsu', model: 'HM400-5', year: 2019, operating_hours: 7200,
    weight_class: 'Over 40 tonn', price: 2650000, price_type: 'fast_price',
    location: 'Rogaland', status: 'active', images: [], featured: false, views: 54,
    created_at: '2026-04-12T11:00:00Z', updated_at: '2026-04-12T11:00:00Z',
    profiles: { id: 'd', company_name: 'Sørvestmaskin AS', org_number: '444555666', contact_person: null, phone: null, verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  {
    id: '5', seller_id: 'e', category: 'kranbil',
    title: 'Liebherr LTM 1060 Mobilkran', description: 'Velholdt mobilkran med 60t kapasitet.',
    brand: 'Liebherr', model: 'LTM 1060', year: 2018, operating_hours: 4800,
    weight_class: 'Over 40 tonn', price: 4200000, price_type: 'negotiable',
    location: 'Oslo', status: 'active', images: [], featured: false, views: 210,
    created_at: '2026-04-11T07:00:00Z', updated_at: '2026-04-11T07:00:00Z',
    profiles: { id: 'e', company_name: 'Oslo Kran & Lift AS', org_number: '777888999', contact_person: null, phone: null, verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  {
    id: '6', seller_id: 'f', category: 'gravemaskin',
    title: 'Hitachi ZX350LC-7 Gravemaskin', description: 'Moderne gravemaskin med lavt timeverk.',
    brand: 'Hitachi', model: 'ZX350LC-7', year: 2023, operating_hours: 1100,
    weight_class: '30-40 tonn', price: 4900000, price_type: 'fast_price',
    location: 'Viken', status: 'active', images: [], featured: true, views: 189,
    created_at: '2026-04-10T08:30:00Z', updated_at: '2026-04-10T08:30:00Z',
    profiles: { id: 'f', company_name: 'Østlandet Maskin AS', org_number: '321654987', contact_person: null, phone: null, verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
]

export default async function FeaturedListings() {
  const dbListings = await getFeaturedListings()
  const listings = dbListings.length > 0 ? dbListings : DEMO_LISTINGS

  return (
    <section className="section" style={{ background: 'var(--bg)' }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, gap: 16 }}>
          <div>
            <p className="section-label" style={{ marginBottom: 8 }}>Mest sette</p>
            <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
              Populære maskiner nå
            </h2>
          </div>
          <Link href="/sok" className="btn-secondary" style={{ flexShrink: 0 }}>
            Se alle <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }} className="listing-grid-3">
          {listings.slice(0, 6).map((listing, i) => (
            <div
              key={listing.id}
              style={{
                animation: `fadeInUp 0.5s ease ${i * 0.08}s both`,
              }}
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/sok" className="btn-primary" style={{ padding: '14px 36px', fontSize: 14 }}>
            Se alle {1247} annonser
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <style>{`
        .listing-grid-3 { grid-template-columns: repeat(3,1fr) !important; }
        @media (max-width: 900px) { .listing-grid-3 { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .listing-grid-3 { grid-template-columns: 1fr !important; } }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </section>
  )
}
