import { Suspense } from 'react'
import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import SokContent from './SokContent'

export const metadata: Metadata = {
  title: 'Søk maskiner',
  description: 'Søk blant over 1 200 maskiner fra verifiserte norske bedrifter.',
}

export default function SokPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
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
