import { Suspense } from 'react'
import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import SokContent from './SokContent'

export const metadata: Metadata = {
  title: 'Finn maskiner – Søk brukte gravemaskiner og anleggsutstyr',
  description: 'Søk blant brukte gravemaskiner, hjullastere, dumpere, traktorer og annet anleggsutstyr fra verifiserte norske bedrifter. Gratis å browse.',
  keywords: ['søk maskin', 'finn gravemaskin', 'brukt hjullaster', 'dumper til salgs', 'traktor Norge', 'anleggsutstyr', 'maskin søk'],
  openGraph: {
    title: 'Finn maskiner | Anleggstorget',
    description: 'Søk blant brukte gravemaskiner, hjullastere og anleggsutstyr fra verifiserte norske bedrifter.',
  },
}

export default function SokPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
            <p style={{ color: 'var(--t3)', fontFamily: 'Barlow Condensed', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 13 }}>Laster...</p>
          </div>
        }>
          <SokContent />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
