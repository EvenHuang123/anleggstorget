import type { Metadata } from 'next'
import CategoryPageTemplate from '@/components/seo/CategoryPageTemplate'
import type { CategoryPageConfig } from '@/components/seo/CategoryPageTemplate'

export const metadata: Metadata = {
  title: 'Kjøp og selg gravemaskiner i Norge – B2B markedsplass',
  description: 'Finn brukte gravemaskiner til salgs fra verifiserte norske bedrifter. Bandgravemaskiner, hjulgravemaskiner og minigravere. Gratis å søke og kontakte selger.',
  keywords: ['kjøp gravemaskin', 'selg gravemaskin', 'brukt gravemaskin Norge', 'bandgravemaskin til salgs', 'hjulgravemaskin', 'minigraver', 'Volvo gravemaskin', 'Caterpillar gravemaskin', 'Komatsu gravemaskin', 'Hitachi gravemaskin'],
  openGraph: {
    title: 'Kjøp og selg gravemaskiner i Norge | Anleggstorget',
    description: 'Finn brukte gravemaskiner fra verifiserte norske bedrifter. Bandgravemaskiner, hjulgravemaskiner og minigravere.',
  },
}

const config: CategoryPageConfig = {
  category: 'gravemaskin',
  h1: 'Gravemaskiner til salgs i Norge',
  intro: [
    'Anleggstorget er Norges B2B-markedsplass for kjøp og salg av gravemaskiner mellom verifiserte bedrifter. Her finner du bandgravemaskiner, hjulgravemaskiner og minigravere fra ledende merker som Volvo, Caterpillar, Komatsu, Hitachi, Liebherr og Doosan.',
    'Alle selgere på plattformen er sjekket mot Brønnøysundregisteret — du handler kun med aktive, legitime norske bedrifter. Kontakt selger direkte uten mellomledd, forhandle pris og avtale levering.',
    'Leter du etter en brukt gravemaskin til anleggsprosjekter, grunnarbeid eller infrastrukturarbeid? Bruk søkefilteret for å finne riktig vektklasse, timeverk og lokasjon. Har du en gravemaskin du vil selge? Legg ut annonse gratis og nå kjøpere over hele Norge.',
  ],
  faq: [
    {
      q: 'Hva koster det å kjøpe gravemaskin på Anleggstorget?',
      a: 'Det er helt gratis å søke og kontakte selgere på Anleggstorget. Plattformen tar ingen provisjon — pris avtales direkte mellom kjøper og selger.',
    },
    {
      q: 'Hvilke gravemaskiner finner jeg her?',
      a: 'Du finner bandgravemaskiner fra 1 til 50+ tonn, hjulgravemaskiner, minigravere og spesialmaskiner. Merker som Volvo, Caterpillar, Komatsu, Hitachi, Doosan, JCB og Liebherr er representert.',
    },
    {
      q: 'Er selgerne verifiserte?',
      a: 'Ja. Alle bedrifter på Anleggstorget er verifisert mot Brønnøysundregisteret før de kan legge ut annonser. Du ser alltid organisasjonsnummer og verifisert-status.',
    },
    {
      q: 'Kan jeg selge gravemaskinen min her?',
      a: 'Absolutt. Registrer bedriften din gratis, last opp bilder og teknisk informasjon. Annonsen er synlig for kjøpere over hele Norge innen minutter.',
    },
    {
      q: 'Hva bør jeg sjekke før jeg kjøper brukt gravemaskin?',
      a: 'Sjekk timeverk, servicehistorikk, slitasjeklasse og om det er nylig utført service. Be om å se maskinen i drift og vurder transportkostnader til din lokasjon.',
    },
  ],
  relatedCategories: [
    { label: 'Hjullastere', href: '/hjullastere' },
    { label: 'Dumpere', href: '/dumpere' },
    { label: 'Kranbiler', href: '/sok?category=kranbil' },
    { label: 'Skogsutstyr', href: '/sok?category=skogsutstyr' },
  ],
}

export const dynamic = 'force-dynamic'

export default function GravemaskinerPage() {
  return <CategoryPageTemplate config={config} />
}
