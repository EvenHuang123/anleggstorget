import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { organizationSchema, websiteSchema, faqSchema } from '@/lib/schema'
import { createPublicClient } from '@/lib/supabase/public'

// Revalidate homepage every 60 s — FeaturedListings uses public client (no cookies = cacheable)
export const revalidate = 120
import { CheckCircle2, Shield, Users, MapPin, TrendingUp } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'

export const metadata: Metadata = {
  title: 'Kjøp og selg tunge maskiner – B2B Maskinmarkedsplass',
  description: 'Norges B2B-markedsplass for verifiserte bedrifter. Kjøp, selg og leie gravemaskiner, hjullastere, dumpere og anleggsutstyr trygt. Gratis annonsering.',
  openGraph: {
    title: 'Anleggstorget – Kjøp og selg tunge maskiner',
    description: 'Norges B2B-markedsplass for verifiserte bedrifter. Kjøp, selg og leie anleggsmaskiner trygt. Gratis annonsering.',
    url: 'https://www.anleggstorget.no',
  },
}
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import SearchBar from '@/components/landing/SearchBar'
import FeaturedListings from '@/components/landing/FeaturedListings'
import Categories from '@/components/landing/Categories'
import BrandsStripe from '@/components/landing/BrandsStripe'
import CtaSection from '@/components/landing/CtaSection'

const FEATURES = [
  {
    icon: CheckCircle2,
    iconColor: '#10b981',
    heading: 'GRATIS Å BRUKE',
    text: 'Ingen provisjon eller skjulte kostnader',
  },
  {
    icon: Shield,
    iconColor: '#3b82f6',
    heading: 'VERIFISERTE BEDRIFTER',
    text: 'Sjekket mot Brønnøysundregisteret',
  },
  {
    icon: Users,
    iconColor: '#8b5cf6',
    heading: 'TRYGG KOMMUNIKASJON',
    text: 'Direkte kontakt mellom bedrifter',
  },
  {
    icon: MapPin,
    iconColor: '#ef4444',
    heading: 'NORSK PLATTFORM',
    text: 'Bygget for norske bedrifter',
  },
]

function ListingsSkeleton() {
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="container-main">
        <div className="listing-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card shimmer" style={{ height: 320 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQ_ITEMS = [
  { q: 'Hvordan fungerer Anleggstorget?', a: 'Anleggstorget er en B2B-markedsplass kun for verifiserte norske bedrifter. Registrer din bedrift gratis ved å verifisere organisasjonsnummeret mot Brønnøysundregisteret, legg ut annonser for maskiner du vil selge eller leie ut, og kom i direkte kontakt med andre bedrifter. Ingen mellommenn, ingen provisjon.' },
  { q: 'Er alle bedrifter verifiserte?', a: 'Ja, alle bedrifter på Anleggstorget er automatisk verifisert mot Brønnøysundregisteret før de kan legge ut annonser. Vi sjekker organisasjonsnummer og bedriftsnavn i sanntid, noe som sikrer at kun ekte, registrerte norske bedrifter kan handle på plattformen. Ingen privatpersoner eller uverifiserte selskaper.' },
  { q: 'Koster det å legge ut annonser?', a: 'Nei, det er helt gratis å legge ut annonser på Anleggstorget. Vi tar ingen provisjon på salg, ingen skjulte kostnader, og ingen abonnementsavgift. Plattformen er 100% gratis for alle verifiserte bedrifter.' },
  { q: 'Hvilke typer maskiner kan jeg kjøpe, selge og leie?', a: 'Du kan kjøpe, selge og leie alle typer anleggsmaskiner på Anleggstorget: gravemaskiner, hjullastere, dumpere, traktorer, kraner, kompaktlastere, veivalser og mer. Alt fra små minigravere på 1–2 tonn til store anleggsmaskiner på 40+ tonn.' },
  { q: 'Hvordan kontakter jeg en selger?', a: 'Klikk på "Kontakt selger" på en annonse, fyll ut en kort melding med ditt spørsmål, så får selgeren beskjed på e-post umiddelbart. Du kan også se selgerens bedriftsinformasjon, organisasjonsnummer og kontaktdetaljer direkte på annonsen.' },
  { q: 'Kan jeg leie ut maskiner på Anleggstorget?', a: 'Ja! Anleggstorget støtter både salg og utleie av maskiner. Når du legger ut en annonse kan du spesifisere at maskinen er til leie, og oppgi leiepris per dag, uke eller måned. Du kan også velge å tilby både salg og leie på samme maskin.' },
]

export default async function HomePage() {
  const supabase = createPublicClient()
  const [{ count: listingCount }, { count: sellerCount }] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }} />
      <Navbar />
      <main id="main-content">
        <Hero listingCount={listingCount ?? 0} sellerCount={sellerCount ?? 0} />
        <section style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '80px 0',
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
                  <div style={{ marginBottom: 12, lineHeight: 1 }}>
                    <f.icon size={40} strokeWidth={2} style={{ color: f.iconColor, display: 'block', margin: '0 auto' }} />
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
                <div style={{ marginBottom: 12, lineHeight: 1 }}>
                  <TrendingUp size={40} strokeWidth={2} style={{ color: '#C8953A', display: 'block', margin: '0 auto' }} />
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

        {/* FAQ */}
        <section className="faq-section" style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          padding: '80px 24px',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12, textAlign: 'center',
            }}>
              Spørsmål og svar
            </p>
            <h2 className="faq-heading" style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 36,
              color: 'var(--t1)', marginBottom: 48,
              textAlign: 'center', letterSpacing: '0.02em',
            }}>
              Ofte stilte spørsmål
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q} className="faq-item" style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: 28,
                }}>
                  <h3 style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700, fontSize: 20,
                    color: 'var(--t1)', marginBottom: 12,
                    letterSpacing: '0.02em',
                  }}>
                    {q}
                  </h3>
                  <p style={{
                    color: 'var(--t2)', fontSize: 15,
                    lineHeight: 1.7, margin: 0,
                  }}>
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @media (max-width: 768px) {
              .faq-section { padding: 48px 16px !important; }
              .faq-heading { font-size: 28px !important; margin-bottom: 32px !important; }
              .faq-item { padding: 20px !important; }
            }
          `}</style>
        </section>

      </main>
      <Footer />
    </>
  )
}
