import Link from 'next/link'
import { ArrowRight, Search, Shield, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ListingCard from '@/components/listings/ListingCard'
import { treeKeysToDbValues } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'

export interface CategoryPageConfig {
  category: string
  h1: string
  intro: string[]
  faq: { q: string; a: string }[]
  relatedCategories: { label: string; href: string }[]
}

async function getCategoryListings(category: string): Promise<Listing[]> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let qb = (supabase as any)
      .from('listings')
      .select('*, profiles(company_name, verified, org_number), favorites_count:favorites(count)')
      .eq('status', 'active')

    const dbCats = treeKeysToDbValues([category])
    const cats = dbCats.length > 0 ? dbCats : [category]
    if (cats.length === 1) qb = qb.eq('category', cats[0])
    else                   qb = qb.in('category', cats)

    const { data } = await qb
      .order('created_at', { ascending: false })
      .limit(12) as { data: Listing[] | null }
    return data ?? []
  } catch {
    return []
  }
}

export default async function CategoryPageTemplate({ config }: { config: CategoryPageConfig }) {
  const listings = await getCategoryListings(config.category)

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>

        {/* Hero */}
        <section style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '56px 0 48px',
        }}>
          <div className="container-main">
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'var(--t3)' }}>
              <Link href="/" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Hjem</Link>
              <ChevronRight size={12} />
              <Link href="/sok" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Maskiner</Link>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--t2)' }}>{config.h1}</span>
            </nav>

            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12,
            }}>
              Kategori
            </p>
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)',
              color: 'var(--t1)', letterSpacing: '0.02em', marginBottom: 20,
            }}>
              {config.h1}
            </h1>

            {/* Intro paragraphs */}
            <div style={{ maxWidth: 720, marginBottom: 32 }}>
              {config.intro.map((para, i) => (
                <p key={i} style={{
                  color: 'var(--t2)', fontSize: 15, lineHeight: 1.75,
                  marginBottom: i < config.intro.length - 1 ? 14 : 0,
                }}>
                  {para}
                </p>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href={`/sok?category=${config.category}`}
                className="btn-primary"
                style={{ fontSize: 13, padding: '11px 24px' }}
              >
                <Search size={14} />
                Se alle {config.h1.toLowerCase()}
                <ArrowRight size={14} />
              </Link>
              <Link href="/registrer" className="btn-secondary" style={{ fontSize: 13, padding: '11px 24px' }}>
                Legg ut gratis
              </Link>
            </div>
          </div>
        </section>

        {/* Listings grid */}
        <section style={{ padding: '56px 0' }}>
          <div className="container-main">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 6 }}>Annonser</p>
                <h2 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 22, color: 'var(--t1)',
                }}>
                  {listings.length > 0
                    ? `${listings.length} aktive annonser`
                    : 'Ingen annonser ennå'}
                </h2>
              </div>
              <Link href={`/sok?category=${config.category}`} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color: 'var(--gold)', fontSize: 13, textDecoration: 'none',
                fontFamily: 'Barlow Condensed', fontWeight: 600,
                letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0,
              }}>
                Avansert søk <ArrowRight size={13} />
              </Link>
            </div>

            {listings.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 20,
              }} className="cat-listing-grid">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div style={{
                padding: '56px 0', textAlign: 'center',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 4,
              }}>
                <p style={{ color: 'var(--t3)', fontSize: 15, marginBottom: 20 }}>
                  Ingen aktive annonser i denne kategorien ennå.
                </p>
                <Link href="/registrer" className="btn-primary" style={{ fontSize: 13 }}>
                  Legg ut første annonse gratis
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Trust bar */}
        <section style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '28px 0',
        }}>
          <div className="container-main">
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              {[
                { icon: Shield, text: 'Alle bedrifter verifisert mot Brønnøysundregisteret' },
                { icon: Search, text: 'Gratis å søke og kontakte selgere' },
                { icon: ArrowRight, text: 'Gratis å legge ut annonse' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--t2)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '64px 0' }}>
          <div className="container-main" style={{ maxWidth: 800 }}>
            <p className="section-label" style={{ marginBottom: 8 }}>Spørsmål og svar</p>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 28,
              color: 'var(--t1)', marginBottom: 36,
            }}>
              Ofte stilte spørsmål
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {config.faq.map(({ q, a }) => (
                <div key={q} style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '20px 24px',
                }}>
                  <h3 style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700, fontSize: 16,
                    color: 'var(--t1)', marginBottom: 8, letterSpacing: '0.01em',
                  }}>
                    {q}
                  </h3>
                  <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          padding: '48px 0',
        }}>
          <div className="container-main">
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, fontSize: 11,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--t3)', marginBottom: 16,
            }}>
              Se også
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {config.relatedCategories.map(({ label, href }) => (
                <Link key={href} href={href} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 3, padding: '8px 14px',
                  color: 'var(--t2)', fontSize: 13, textDecoration: 'none',
                  fontFamily: 'Barlow Condensed', fontWeight: 500,
                  transition: 'border-color 0.15s, color 0.15s',
                }} className="related-link">
                  {label} <ArrowRight size={12} />
                </Link>
              ))}
              <Link href="/selgere" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 3, padding: '8px 14px',
                color: 'var(--t2)', fontSize: 13, textDecoration: 'none',
                fontFamily: 'Barlow Condensed', fontWeight: 500,
              }} className="related-link">
                Se alle selgere <ArrowRight size={12} />
              </Link>
              <Link href="/markedsinnsikt" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 3, padding: '8px 14px',
                color: 'var(--t2)', fontSize: 13, textDecoration: 'none',
                fontFamily: 'Barlow Condensed', fontWeight: 500,
              }} className="related-link">
                Markedsinnsikt <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .cat-listing-grid { grid-template-columns: repeat(3,1fr) !important; }
        @media (max-width: 900px) { .cat-listing-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .cat-listing-grid { grid-template-columns: 1fr !important; } }
        .related-link:hover { border-color: rgba(200,149,58,0.4) !important; color: var(--gold) !important; }
      `}</style>
    </>
  )
}
