import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import SearchBar from '@/components/landing/SearchBar'
import FeaturedListings from '@/components/landing/FeaturedListings'
import Categories from '@/components/landing/Categories'
import BrandsStripe from '@/components/landing/BrandsStripe'
import CtaSection from '@/components/landing/CtaSection'

const FEATURES = [
  {
    icon: '✓',
    iconColor: '#4caf50',
    heading: 'GRATIS Å BRUKE',
    text: 'Ingen provisjon eller skjulte kostnader',
  },
  {
    icon: '🔐',
    iconColor: undefined,
    heading: 'VERIFISERTE BEDRIFTER',
    text: 'Sjekket mot Brønnøysundregisteret',
  },
  {
    icon: '🤝',
    iconColor: undefined,
    heading: 'TRYGG KOMMUNIKASJON',
    text: 'Direkte kontakt mellom bedrifter',
  },
  {
    icon: '🇳🇴',
    iconColor: undefined,
    heading: 'NORSK PLATTFORM',
    text: 'Bygget for norske bedrifter',
  },
]

function ListingsSkeleton() {
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="container-main">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card shimmer" style={{ height: 320 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '60px 0',
        }}>
          <div className="container-main" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 32,
              textAlign: 'center',
            }}>
              {FEATURES.map(f => (
                <div key={f.heading}>
                  <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1, color: f.iconColor }}>
                    {f.icon}
                  </div>
                  <div style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700,
                    fontSize: 18,
                    color: 'var(--t1)',
                    marginBottom: 8,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {f.heading}
                  </div>
                  <p style={{ color: 'var(--t3)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                    {f.text}
                  </p>
                </div>
              ))}

              {/* Markedsinnsikt teaser card */}
              <Link
                href="/markedsinnsikt"
                className="feature-teaser-link"
              >
                <div style={{ fontSize: 48, marginBottom: 12, lineHeight: 1 }}>📊</div>
                <div style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'var(--t1)',
                  marginBottom: 8,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  MARKEDSINNSIKT
                </div>
                <p style={{ color: 'var(--t3)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  Prisindekser og trender for brukte maskiner
                </p>
                <div style={{
                  display: 'inline-block',
                  background: 'var(--gold3)',
                  border: '1px solid var(--gold)',
                  borderRadius: 12,
                  padding: '4px 10px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  marginTop: 12,
                }}>
                  Kommer snart
                </div>
              </Link>
            </div>
          </div>
          <style>{`
            @media (max-width: 1200px) { .features-grid { grid-template-columns: repeat(3, 1fr) !important; } }
            @media (max-width: 768px)  { .features-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (max-width: 480px)  { .features-grid { grid-template-columns: 1fr !important; } }
            .feature-teaser-link { text-decoration: none; display: block; transition: transform 0.15s; }
            .feature-teaser-link:hover { transform: translateY(-4px); }
          `}</style>
        </section>
        <SearchBar />
        <Suspense fallback={<ListingsSkeleton />}>
          <FeaturedListings />
        </Suspense>
        <div className="gold-line" />
        <Categories />
        <BrandsStripe />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
