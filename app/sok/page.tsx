import { Suspense } from 'react'
import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import SokContent from './SokContent'

export const revalidate = 60

const CATEGORY_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  gravemaskiner: {
    title: 'Brukte gravemaskiner til salgs – Kjøp gravemaskin B2B',
    description: 'Finn brukte gravemaskiner fra verifiserte norske bedrifter. Minigraver, midigraver, store gravere og hjulgravere. Trygt B2B-salg på Anleggstorget.',
    keywords: ['kjøp gravemaskin', 'brukt gravemaskin', 'gravemaskin til salgs', 'minigraver', 'hjulgraver', 'beltegraver'],
  },
  hjullastere: {
    title: 'Brukte hjullastere til salgs – B2B markedsplass',
    description: 'Kjøp og selg brukte hjullastere fra verifiserte norske bedrifter. Kompakt, middelsstor og stor hjullaster. Trygt B2B-kjøp på Anleggstorget.',
    keywords: ['kjøp hjullaster', 'brukt hjullaster', 'hjullaster til salgs', 'kompakt hjullaster', 'teleskoplaster'],
  },
  dumpers: {
    title: 'Brukte dumpere til salgs – Kjøp dumper B2B',
    description: 'Finn brukte dumpere fra verifiserte bedrifter. Minidumper, bandedumper, hjuldumper og knekkstyrt dumper til salgs på Anleggstorget.',
    keywords: ['kjøp dumper', 'brukt dumper', 'dumper til salgs', 'bandedumper', 'hjuldumper'],
  },
  kompaktmaskiner: {
    title: 'Brukte kompaktmaskiner – Kompaktlaster og teleskoplaster',
    description: 'Kjøp brukte kompaktmaskiner, kompaktlastere og teleskoplastere fra verifiserte norske bedrifter på Anleggstorget.',
    keywords: ['kompaktmaskin', 'kompaktlaster', 'teleskoplaster', 'teleskoptrucker'],
  },
  kraner: {
    title: 'Brukte kraner og løfteutstyr – Kjøp mobilkran B2B',
    description: 'Finn brukte kraner, mobilkraner, personløftere og lastebilkraner fra verifiserte norske bedrifter på Anleggstorget.',
    keywords: ['kjøp kran', 'brukt kran', 'mobilkran', 'personløfter', 'lastebilkran'],
  },
  annet: {
    title: 'Annet anleggsutstyr til salgs – Doser, generatorer og mer',
    description: 'Kjøp brukt anleggsutstyr, dosere, generatorer og tilbehør fra verifiserte norske bedrifter. Finn det du trenger på Anleggstorget.',
    keywords: ['anleggsutstyr', 'doser', 'generator', 'anleggsmaskiner', 'annet utstyr'],
  },
}

interface SokProps {
  searchParams: Promise<{ category?: string; brand?: string; q?: string }>
}

export async function generateMetadata({ searchParams }: SokProps): Promise<Metadata> {
  const { category, brand, q } = await searchParams
  const cat = category && CATEGORY_META[category] ? CATEGORY_META[category] : null

  if (q) {
    return {
      title: { absolute: `"${q}" – Maskinsøk | Anleggstorget` },
      description: `Søkeresultater for "${q}". Finn brukte anleggsmaskiner fra verifiserte norske bedrifter på Anleggstorget.`,
      robots: { index: false },
    }
  }

  if (brand) {
    return {
      title: { absolute: `${brand} maskiner til salgs | Anleggstorget` },
      description: `Kjøp brukte ${brand}-maskiner fra verifiserte norske bedrifter. Gravemaskiner, hjullastere og mer på Anleggstorget.`,
      alternates: { canonical: `https://www.anleggstorget.no/sok?brand=${encodeURIComponent(brand)}` },
    }
  }

  if (cat && category) {
    return {
      title: { absolute: `${cat.title} | Anleggstorget` },
      description: cat.description,
      keywords: cat.keywords,
      alternates: { canonical: `https://www.anleggstorget.no/sok?category=${category}` },
      openGraph: {
        title: cat.title,
        description: cat.description,
      },
    }
  }

  return {
    title: 'Finn maskiner – Søk brukte gravemaskiner og anleggsutstyr',
    description: 'Søk blant brukte gravemaskiner, hjullastere, dumpere, traktorer og annet anleggsutstyr fra verifiserte norske bedrifter. Gratis å browse.',
    keywords: ['søk maskin', 'finn gravemaskin', 'brukt hjullaster', 'dumper til salgs', 'traktor Norge', 'anleggsutstyr', 'maskin søk'],
    alternates: { canonical: 'https://www.anleggstorget.no/sok' },
    openGraph: {
      title: 'Finn maskiner | Anleggstorget',
      description: 'Søk blant brukte gravemaskiner, hjullastere og anleggsutstyr fra verifiserte norske bedrifter.',
    },
  }
}

export default async function SokPage({ searchParams }: SokProps) {
  const { category, brand, q } = await searchParams

  // Server-rendered h1 ensures crawlers see a heading even before SokContent
  // (SokContent is 'use client' inside Suspense — its h1 is JS-only on first load)
  const serverH1 = q
    ? `Søkeresultater for "${q}"`
    : brand
    ? `${brand} maskiner til salgs`
    : category && CATEGORY_META[category]
    ? CATEGORY_META[category].title.split(' –')[0].split(' |')[0]
    : 'Søk maskiner'

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
        {/* sr-only: visible to crawlers/screen readers; SokContent renders the visual h1 */}
        <h1 className="sr-only">{serverH1}</h1>
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
