import { Suspense } from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import StatsBar from '@/components/landing/StatsBar'
import TickerStripe from '@/components/landing/TickerStripe'
import SearchBar from '@/components/landing/SearchBar'
import FeaturedListings from '@/components/landing/FeaturedListings'
import Categories from '@/components/landing/Categories'
import TrustSection from '@/components/landing/TrustSection'
import BrandsStripe from '@/components/landing/BrandsStripe'
import CtaSection from '@/components/landing/CtaSection'

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
        <StatsBar />
        <TickerStripe />
        <SearchBar />
        <Suspense fallback={<ListingsSkeleton />}>
          <FeaturedListings />
        </Suspense>
        <div className="gold-line" />
        <Categories />
        <TrustSection />
        <BrandsStripe />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
