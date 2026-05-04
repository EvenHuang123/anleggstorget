import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Building2, Mail, Phone, Star, TrendingUp, Package, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ListingCard from '@/components/listings/ListingCard'
import { formatPrice, formatRelativeDate } from '@/lib/utils/format'
import type { Listing, Profile, Review } from '@/lib/supabase/types'

interface PageProps {
  params: Promise<{ id: string }>
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          style={{
            color: i <= Math.round(rating) ? 'var(--gold)' : 'var(--bg5)',
            fill: i <= Math.round(rating) ? 'var(--gold)' : 'var(--bg5)',
          }}
        />
      ))}
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function SelgerProfilPage({ params }: PageProps) {
  const { id: slugOrId } = await params
  const supabase = await createClient()

  // Fetch profile — try slug first, fall back to ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let profile: Profile | null = null
  for (const field of ['slug', 'id']) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq(field, slugOrId)
      .single() as { data: Profile | null }
    if (data) { profile = data; break }
  }

  if (!profile) notFound()

  // Fetch listings (active + sold)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listingsData } = await (supabase as any)
    .from('listings')
    .select('*, favorites_count:favorites(count)')
    .eq('seller_id', profile.id)
    .in('status', ['active', 'sold', 'reserved'])
    .order('created_at', { ascending: false }) as { data: Listing[] | null }

  const allListings: Listing[] = listingsData ?? []
  const activeListings = allListings.filter(l => l.status === 'active' || l.status === 'reserved')
  const soldListings = allListings
    .filter(l => l.status === 'sold' && l.sold_at)
    .sort((a, b) => new Date(b.sold_at!).getTime() - new Date(a.sold_at!).getTime())
    .slice(0, 5)

  // Fetch reviews (safe — table may not exist yet)
  let reviews: (Review & { profiles: { company_name: string } | null })[] = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reviewsData } = await (supabase as any)
      .from('reviews')
      .select('*, profiles(company_name)')
      .eq('seller_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10) as { data: (Review & { profiles: { company_name: string } | null })[] | null }
    reviews = reviewsData ?? []
  } catch {
    reviews = []
  }
  const avgRating = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null

  // Trending badge logic
  const isTrending = activeListings.length >= 10 ||
    (activeListings.length >= 5 && avgRating !== null && avgRating >= 4.5)

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>

        {/* Back nav */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div className="container-main" style={{ padding: '12px 0' }}>
            <Link href="/selgere" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--t3)', fontSize: 13, textDecoration: 'none',
              transition: 'color 0.15s',
            }}>
              <ArrowLeft size={13} /> Alle selgere
            </Link>
          </div>
        </div>

        {/* Profile header */}
        <div style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '48px 0',
        }}>
          <div className="container-main">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                background: 'var(--gold3)',
                border: '2px solid rgba(200,149,58,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 800, fontSize: 28, color: 'var(--gold)',
              }}>
                {(profile.company_name?.[0] ?? '?').toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Badges */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {profile.verified && (
                    <span className="tag tag-green">
                      <CheckCircle size={11} /> Verifisert bedrift
                    </span>
                  )}
                  {isTrending && (
                    <span className="tag tag-gold">
                      <TrendingUp size={11} /> Populær selger
                    </span>
                  )}
                </div>

                <h1 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)',
                  color: 'var(--t1)', letterSpacing: '0.01em', marginBottom: 6,
                }}>
                  {profile.company_name}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--t3)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em' }}>
                    Org.nr: {profile.org_number}
                  </span>
                  {avgRating !== null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StarRating rating={avgRating} />
                      <span style={{ fontSize: 13, color: 'var(--t2)' }}>
                        {avgRating} ({reviews.length} anmeldelser)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
          <div className="container-main">
            <div className="seller-stats" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0,
            }}>
              {[
                { label: 'Aktive annonser', value: activeListings.length },
                { label: 'Anmeldelser', value: reviews.length > 0 ? `${avgRating} ★` : '—' },
                { label: 'Solgte maskiner', value: soldListings.length > 0 ? soldListings.length + '+' : '—' },
                { label: 'Profil siden', value: new Date(profile.created_at).getFullYear() },
              ].map((stat, i) => (
                <div key={stat.label} style={{
                  padding: '20px 24px',
                  borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 800, fontSize: 24,
                    color: 'var(--t1)', marginBottom: 4,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-main" style={{ padding: '48px 0 80px' }}>
          <div className="seller-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }}>

            {/* Left: main content */}
            <div>
              {/* Active listings */}
              <section style={{ marginBottom: 56 }}>
                <h2 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 800, fontSize: 22,
                  color: 'var(--t1)', marginBottom: 20,
                  textTransform: 'uppercase', letterSpacing: '0.02em',
                }}>
                  Aktive annonser ({activeListings.length})
                </h2>

                {activeListings.length === 0 ? (
                  <div style={{
                    padding: '32px 24px', textAlign: 'center',
                    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4,
                  }}>
                    <Package size={24} style={{ color: 'var(--t3)', marginBottom: 8 }} />
                    <p style={{ color: 'var(--t3)', fontSize: 14 }}>Ingen aktive annonser</p>
                  </div>
                ) : (
                  <div className="listing-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {activeListings.map(listing => (
                      <ListingCard key={listing.id} listing={{ ...listing, profiles: profile }} />
                    ))}
                  </div>
                )}
              </section>

              {/* Recently sold */}
              {soldListings.length > 0 && (
                <section style={{ marginBottom: 56 }}>
                  <h2 style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 800, fontSize: 22,
                    color: 'var(--t1)', marginBottom: 20,
                    textTransform: 'uppercase', letterSpacing: '0.02em',
                  }}>
                    Nylig solgt
                  </h2>
                  <div style={{
                    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    {soldListings.map((listing, i) => (
                      <div key={listing.id} style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '14px 20px',
                        borderBottom: i < soldListings.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontWeight: 600, fontSize: 14, color: 'var(--t2)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {listing.title}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                            Solgt {formatRelativeDate(listing.sold_at!)}
                          </p>
                        </div>
                        {listing.sold_price && (
                          <div style={{
                            fontFamily: 'Barlow Condensed, sans-serif',
                            fontWeight: 700, fontSize: 15,
                            color: 'var(--gold)', flexShrink: 0,
                          }}>
                            {formatPrice(listing.sold_price)}
                          </div>
                        )}
                        <span className="tag tag-muted" style={{ fontSize: 11, flexShrink: 0 }}>Solgt</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews */}
              {reviews.length > 0 && (
                <section>
                  <h2 style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 800, fontSize: 22,
                    color: 'var(--t1)', marginBottom: 20,
                    textTransform: 'uppercase', letterSpacing: '0.02em',
                  }}>
                    Anmeldelser ({reviews.length})
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviews.map(review => (
                      <div key={review.id} style={{
                        background: 'var(--bg2)', border: '1px solid var(--border)',
                        borderRadius: 4, padding: '20px 24px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <StarRating rating={review.rating} />
                            <span style={{
                              fontFamily: 'Barlow Condensed, sans-serif',
                              fontWeight: 600, fontSize: 14, color: 'var(--t2)',
                            }}>
                              {review.profiles?.company_name ?? 'Anonym bedrift'}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                            {formatRelativeDate(review.created_at)}
                          </span>
                        </div>
                        {review.comment && (
                          <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right sidebar: about + contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* About */}
              {profile.bio && (
                <div style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '24px 20px',
                }}>
                  <h3 style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700, fontSize: 13,
                    color: 'var(--t3)', textTransform: 'uppercase',
                    letterSpacing: '0.1em', marginBottom: 12,
                  }}>
                    Om bedriften
                  </h3>
                  <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Contact info */}
              <div style={{
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '24px 20px',
              }}>
                <h3 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 13,
                  color: 'var(--t3)', textTransform: 'uppercase',
                  letterSpacing: '0.1em', marginBottom: 16,
                }}>
                  Kontakt
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {profile.contact_person && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Building2 size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 14, color: 'var(--t2)' }}>{profile.contact_person}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Phone size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }} />
                      <a href={`tel:${profile.phone}`} style={{ fontSize: 14, color: 'var(--t2)', textDecoration: 'none' }}>
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  {!profile.contact_person && !profile.phone && (
                    <p style={{ fontSize: 13, color: 'var(--t3)', margin: 0 }}>
                      Kontakt selger via annonse
                    </p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <Link href="/sok" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '14px 20px',
                color: 'var(--t2)', fontSize: 13,
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 600, textDecoration: 'none',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                transition: 'all 0.15s',
              }} className="sidebar-cta">
                <Mail size={13} /> Finn andre maskiner
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />

      <style>{`
        .seller-stats { grid-template-columns: repeat(4, 1fr) !important; }
        .seller-layout { grid-template-columns: 1fr 300px !important; }
        .listing-grid-3 { grid-template-columns: repeat(3, 1fr) !important; }
        @media (max-width: 1100px) {
          .listing-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .seller-layout { grid-template-columns: 1fr !important; }
          .seller-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .seller-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .listing-grid-3 { grid-template-columns: 1fr !important; }
        }
        .sidebar-cta:hover { border-color: rgba(200,149,58,0.3) !important; color: var(--gold) !important; }
      `}</style>
    </>
  )
}
