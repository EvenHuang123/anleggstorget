import Link from 'next/link'
import { Building2, ArrowRight, Package, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shared/Navbar'
import SubNav from '@/components/shared/SubNav'
import Footer from '@/components/shared/Footer'
import type { Profile } from '@/lib/supabase/types'

export const metadata = {
  title: 'Verifiserte maskinselgere i Norge',
  description: 'Se alle verifiserte bedrifter som selger og leier ut anleggsmaskiner i Norge. Alle sjekket mot Brønnøysundregisteret for trygg handel.',
  keywords: ['maskinselgere Norge', 'verifiserte bedrifter', 'anleggsmaskiner selger', 'Brønnøysund verifisert', 'kjøp maskin bedrift'],
  openGraph: {
    title: 'Verifiserte maskinselgere | Anleggstorget',
    description: 'Se alle verifiserte bedrifter som selger og leier ut anleggsmaskiner. Sjekket mot Brønnøysundregisteret.',
  },
}

interface SellerRow extends Profile {
  active_count: number
}

async function getSellers(): Promise<SellerRow[]> {
  try {
    const supabase = await createClient()

    // Fetch all profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select('*') as { data: Profile[] | null; error: unknown }

    if (profilesError || !profiles?.length) return []

    // Fetch active listing counts per seller
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listings } = await (supabase as any)
      .from('listings')
      .select('seller_id')
      .eq('status', 'active') as { data: { seller_id: string }[] | null }

    const countMap: Record<string, number> = {}
    for (const l of listings ?? []) {
      countMap[l.seller_id] = (countMap[l.seller_id] ?? 0) + 1
    }

    return profiles
      .map(p => ({ ...p, active_count: countMap[p.id] ?? 0 }))
      .filter(p => p.active_count > 0)
      .sort((a, b) => b.active_count - a.active_count)
  } catch {
    return []
  }
}

const DEMO_SELLERS: SellerRow[] = [
  { id: 'a', company_name: 'Bergvik Maskin AS', org_number: '123456789', contact_person: 'Lars Bergvik', phone: '+47 900 00 001', bio: 'Spesialist på gravemaskiner og anleggsutstyr i Vestland. 20 års erfaring i bransjen.', verified: true, created_at: '2026-01-01T00:00:00Z', active_count: 8 },
  { id: 'b', company_name: 'Hauge Gård AS', org_number: '987654321', contact_person: 'Kari Hauge', phone: '+47 900 00 002', bio: 'Kjøp, salg og utleie av landbruksmaskiner i Innlandet.', verified: true, created_at: '2026-01-01T00:00:00Z', active_count: 5 },
  { id: 'c', company_name: 'Trøndermaskin AS', org_number: '111222333', contact_person: null, phone: null, bio: null, verified: false, created_at: '2026-01-01T00:00:00Z', active_count: 3 },
  { id: 'd', company_name: 'Sørvestmaskin AS', org_number: '444555666', contact_person: 'Tor Magne', phone: '+47 900 00 004', bio: 'Dumpere og hjullastere i Rogaland og omegn.', verified: true, created_at: '2026-01-01T00:00:00Z', active_count: 4 },
  { id: 'e', company_name: 'Oslo Kran & Lift AS', org_number: '777888999', contact_person: 'Ole Kristiansen', phone: '+47 900 00 005', bio: 'Norges ledende aktør innen mobile kraner og løfteutstyr.', verified: true, created_at: '2026-01-01T00:00:00Z', active_count: 12 },
  { id: 'f', company_name: 'Østlandet Maskin AS', org_number: '321654987', contact_person: null, phone: null, bio: 'Vi kjøper, selger og leier ut tunge maskiner i hele Østlandet.', verified: true, created_at: '2026-01-01T00:00:00Z', active_count: 6 },
]

export const dynamic = 'force-dynamic'

export default async function SelgerePage() {
  const dbSellers = await getSellers()
  const sellers = dbSellers.length > 0 ? dbSellers : DEMO_SELLERS
  const verifiedCount = sellers.filter(s => s.verified).length

  return (
    <>
      <Navbar />
      <SubNav />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>

        {/* Hero */}
        <div style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '64px 0 48px',
        }}>
          <div className="container-main">
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, fontSize: 11,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12,
            }}>Verifiserte bedrifter</p>
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)',
              color: 'var(--t1)', letterSpacing: '0.02em', marginBottom: 16,
            }}>
              Bedrifter på Anleggstorget
            </h1>
            <p style={{ color: 'var(--t2)', fontSize: 16, marginBottom: 32, maxWidth: 540 }}>
              {sellers.length} aktive bedrifter · {verifiedCount} verifisert mot Brønnøysundregisteret
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="tag tag-gold">
                <span className="live-dot" style={{ width: 5, height: 5 }} />
                Live markedsplass
              </div>
              <div className="tag tag-muted">
                <Building2 size={11} />
                {verifiedCount} verifiserte
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ padding: '56px 0 80px' }}>
          <div className="container-main">
            <div className="sellers-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
            }}>
              {sellers.map(seller => {
                const isTrending = seller.active_count >= 10
                return (
                  <div key={seller.id} style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                    transition: 'border-color 0.15s',
                  }} className="seller-card">
                    {/* Avatar + badges */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--gold3)',
                        border: '1px solid rgba(200,149,58,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontWeight: 800, fontSize: 18, color: 'var(--gold)',
                      }}>
                        {(seller.company_name?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        {seller.verified && (
                          <span className="tag tag-green" style={{ fontSize: 10 }}>✓ Verifisert</span>
                        )}
                        {isTrending && (
                          <span className="tag tag-gold" style={{ fontSize: 10 }}>
                            <TrendingUp size={9} /> Populær
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <h2 style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700, fontSize: 16,
                      color: 'var(--t1)', marginBottom: 4,
                      letterSpacing: '0.01em',
                    }}>
                      {seller.company_name}
                    </h2>

                    {/* Active listings count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                      <Package size={11} style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                        {seller.active_count} aktive annonser
                      </span>
                    </div>

                    {/* Bio preview */}
                    {seller.bio && (
                      <p style={{
                        color: 'var(--t3)', fontSize: 13, lineHeight: 1.55,
                        marginBottom: 16, flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {seller.bio}
                      </p>
                    )}
                    {!seller.bio && <div style={{ flex: 1, marginBottom: 16 }} />}

                    {/* Link */}
                    <Link
                      href={`/selgere/${seller.slug || seller.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: 'var(--gold)', fontSize: 13,
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontWeight: 600, letterSpacing: '0.04em',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        marginTop: 'auto',
                      }}
                    >
                      Se profil <ArrowRight size={13} />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </main>
      <Footer />

      <style>{`
        .sellers-grid { grid-template-columns: repeat(4, 1fr) !important; }
        @media (max-width: 1100px) { .sellers-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px)  { .sellers-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px)  { .sellers-grid { grid-template-columns: 1fr !important; } }
        .seller-card:hover { border-color: rgba(200,149,58,0.3) !important; }
      `}</style>
    </>
  )
}
