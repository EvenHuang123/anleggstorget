import { Suspense } from 'react'
import type { Metadata } from 'next'
import { organizationSchema, websiteSchema, faqSchema } from '@/lib/schema'
import { createPublicClient } from '@/lib/supabase/public'
import { Shield, CheckCircle2, Users } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import SearchBar from '@/components/landing/SearchBar'
import FeaturedListings from '@/components/landing/FeaturedListings'
import Categories from '@/components/landing/Categories'
import BrandsStripe from '@/components/landing/BrandsStripe'
import CtaSection from '@/components/landing/CtaSection'

// Revalidate homepage every 120 s — all queries use the public client (no cookies = cacheable)
export const revalidate = 120

export const metadata: Metadata = {
  title: 'Kjøp og selg tunge maskiner – Norges maskinmarkedsplass',
  description: 'Norges markedsplass for anleggsmaskiner. Kjøp, selg og leie gravemaskiner, hjullastere, dumpere og anleggsutstyr trygt. Selgere verifisert mot Brønnøysundregisteret. Gratis annonsering.',
  alternates: { canonical: 'https://www.anleggstorget.no' },
  openGraph: {
    title: 'Anleggstorget – Kjøp og selg tunge maskiner',
    description: 'Norges markedsplass for anleggsmaskiner. Kjøp, selg og leie trygt — selgere verifisert mot Brønnøysundregisteret. Gratis annonsering.',
    url: 'https://www.anleggstorget.no',
  },
}

// Konkrete, etterprøvbare påstander — ingen abstrakte dyder. Kun oker/nesten-sort ikoner.
const USPS = [
  { icon: Shield,       text: 'Hver selger er verifisert mot Brønnøysundregisteret før første annonse' },
  { icon: CheckCircle2, text: 'Gratis å legge ut, og ingen provisjon på salg' },
  { icon: Users,        text: 'Du kontakter selgeren direkte, uten mellomledd' },
]

const FAQ_ITEMS = [
  { q: 'Hvordan fungerer Anleggstorget?', a: 'Anleggstorget er en markedsplass for anleggsmaskiner. Bedrifter kan selge og leie ut maskiner ved å verifisere organisasjonsnummeret mot Brønnøysundregisteret, mens både bedrifter og privatpersoner kan søke, favorittmarkere og ta direkte kontakt med selgere.' },
  { q: 'Hvem kan kjøpe og hvem kan selge?', a: 'Alle kan kjøpe. Både bedrifter og privatpersoner kan registrere seg gratis, favorittmarkere maskiner og sende forespørsler til selgere. For å selge må du registrere en bedrift; alle selgere verifiseres mot Brønnøysundregisteret før de kan legge ut annonser, slik at du vet at du handler med en registrert norsk bedrift.' },
  { q: 'Koster det å legge ut annonser?', a: 'Det er gratis å legge ut annonser på Anleggstorget. Vi tar ingen provisjon på salg og har ingen abonnementsavgift.' },
  { q: 'Hvilke typer maskiner kan jeg kjøpe, selge og leie?', a: 'Du kan kjøpe, selge og leie anleggsmaskiner på Anleggstorget: gravemaskiner, hjullastere, dumpere, traktorer, kraner og kompaktlastere. Alt fra minigravere på 1–2 tonn til anleggsmaskiner på over 40 tonn.' },
  { q: 'Hvordan kontakter jeg en selger?', a: 'Klikk på "Kontakt selger" på en annonse og fyll ut en kort melding, så får selgeren beskjed på e-post. Du ser også selgerens bedriftsinformasjon, organisasjonsnummer og kontaktdetaljer på annonsen.' },
  { q: 'Kan jeg leie ut maskiner på Anleggstorget?', a: 'Anleggstorget støtter både salg og utleie. Når du legger ut en annonse kan du oppgi at maskinen er til leie, med leiepris per dag, uke eller måned, eller tilby både salg og leie på samme maskin.' },
]

/** Ferskhetssignal: "oppdatert i dag 06:14" / "oppdatert i går" / "oppdatert 3. sep". Oslo-tid. */
function formatUpdated(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  const dayKey = (x: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(x)
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86_400_000)
  if (dayKey(d) === dayKey(now)) {
    const time = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit' }).format(d)
    return `oppdatert i dag ${time}`
  }
  if (dayKey(d) === dayKey(yesterday)) return 'oppdatert i går'
  const date = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', day: 'numeric', month: 'short' }).format(d)
  return `oppdatert ${date}`
}

function ListingsSkeleton() {
  return (
    <section style={{ padding: '56px 0', background: 'var(--bg)' }}>
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

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = createPublicClient() as any

  // Én spørring for aktive annonser dekker antall, distinkte selgere, merker og ferskhet.
  const [activeRes, syncRes] = await Promise.all([
    sb.from('listings').select('seller_id, brand, created_at').eq('status', 'active'),
    sb.from('sync_logs').select('created_at').in('status', ['success', 'partial'])
      .order('created_at', { ascending: false }).limit(1),
  ])

  const rows = (activeRes.data ?? []) as { seller_id: string | null; brand: string | null; created_at: string | null }[]
  const syncRows = (syncRes.data ?? []) as { created_at: string | null }[]
  const listingCount = rows.length
  const sellerCount = new Set(rows.map(r => r.seller_id).filter(Boolean)).size

  // Merker grupperes case-insensitivt (så "CAT" og "Cat" ikke teller som to),
  // og vi viser den vanligste skrivemåten. Kun visning — ingen datamodell-endring.
  const brandAgg = new Map<string, { count: number; labels: Map<string, number> }>()
  let newestListing: string | null = null
  for (const r of rows) {
    if (r.created_at && (!newestListing || r.created_at > newestListing)) newestListing = r.created_at
    const raw = r.brand?.trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    const entry = brandAgg.get(key) ?? { count: 0, labels: new Map<string, number>() }
    entry.count += 1
    entry.labels.set(raw, (entry.labels.get(raw) ?? 0) + 1)
    brandAgg.set(key, entry)
  }
  const topBrands = [...brandAgg.values()]
    .map(e => ({
      name: [...e.labels.entries()].sort((a, b) => b[1] - a[1])[0][0],
      count: e.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Ferskhet: siste vellykkede sync, fallback til nyeste annonse.
  const updatedLabel = formatUpdated(syncRows?.[0]?.created_at ?? newestListing)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }} />
      <Navbar />
      <main id="main-content">
        <Hero listingCount={listingCount} sellerCount={sellerCount} updatedLabel={updatedLabel} />

        {/* USP-stripe — inline linje, venstrejustert, ingen kort/ramme/ikonring */}
        <section style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '36px 0',
        }}>
          <div className="container-main">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 40px' }}>
              {USPS.map(u => (
                <div key={u.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <u.icon size={20} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.4 }}>{u.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SearchBar />
        <Suspense fallback={<ListingsSkeleton />}>
          <FeaturedListings />
        </Suspense>
        <div className="gold-line" />
        <Categories />
        <BrandsStripe brands={topBrands} />
        <CtaSection />

        {/* FAQ — venstrejustert, ingen kicker */}
        <section className="faq-section" style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          padding: '80px 24px',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 className="faq-heading" style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 36,
              color: 'var(--t1)', marginBottom: 40,
              letterSpacing: '0.02em',
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
