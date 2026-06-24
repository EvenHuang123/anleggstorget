import type { Metadata } from 'next'
import CategoryPageTemplate from '@/components/seo/CategoryPageTemplate'
import type { CategoryPageConfig } from '@/components/seo/CategoryPageTemplate'

export const metadata: Metadata = {
  title: 'Kjøp og selg dumpere i Norge – B2B markedsplass',
  description: 'Finn brukte dumpere til salgs fra verifiserte norske bedrifter. Artikulerte dumpere, rigide dumpere og minidumpere. Gratis å søke og kontakte selger.',
  keywords: ['kjøp dumper', 'selg dumper', 'brukt dumper Norge', 'artikulert dumper', 'rigid dumper', 'minidumper', 'Volvo dumper', 'Bell dumper', 'Komatsu dumper', 'dumper til salgs'],
  openGraph: {
    title: 'Kjøp og selg dumpere i Norge | Anleggstorget',
    description: 'Finn brukte dumpere fra verifiserte norske bedrifter. Artikulerte dumpere, rigide dumpere og minidumpere.',
  },
}

const config: CategoryPageConfig = {
  category: 'dumpers',
  h1: 'Dumpere til salgs i Norge',
  intro: [
    'Anleggstorget er Norges B2B-markedsplass for kjøp og salg av dumpere mellom verifiserte bedrifter. Her finner du artikulerte dumpere, rigide dumpere og minidumpere fra ledende merker som Volvo, Bell, Komatsu, Caterpillar, Terex og Doosan.',
    'Dumpere er uunnværlige i store anleggsprosjekter, veikonstruksjon, gruvearbeid og masseflytting. Artikulerte dumpere er spesielt populære i norsk terreng takket være god manøvreringsevne på krevende underlag. Her finner du maskiner med kapasitet fra 5 til 50+ tonn.',
    'Alle selgere er verifisert mot Brønnøysundregisteret — ingen privatsalg, kun seriøse norske bedrifter. Har du en dumper til salgs? Legg ut gratis og nå kjøpere over hele landet.',
  ],
  faq: [
    {
      q: 'Hva er forskjellen på artikulert og rigid dumper?',
      a: 'Artikulerte dumpere er leddet i midten og egner seg for ujevnt og mykt terreng — typisk for norske anleggsforhold. Rigide dumpere har fast ramme og er mer egnet for harde, flate overflater som gruver og havner.',
    },
    {
      q: 'Hvilke merker finner jeg på Anleggstorget?',
      a: 'Volvo A-serie, Bell B-serie, Komatsu HM-serie, Caterpillar 730/740, Terex TA og Doosan DA er blant de vanligste. Nye annonser legges til løpende.',
    },
    {
      q: 'Hva koster en brukt dumper?',
      a: 'Minidumpere starter fra ca. 100 000 kr. Mellomstore artikulerte dumpere (25–35 tonn) ligger typisk i 1,5–4 mill kr avhengig av timeverk og stand. Store rigide dumpere kan koste 5–15 mill kr.',
    },
    {
      q: 'Kan jeg annonsere dumper til leie?',
      a: 'Ja. Anleggstorget støtter både salgs- og utleieannonser. Velg riktig annonse-type ved oppretting.',
    },
    {
      q: 'Hva bør jeg inspisere før kjøp av dumper?',
      a: 'Kontroller leddpunktene (på artikulerte), drivverk, dekk/belteslitasje, hydraulikksystem og tippfunksjon. Be om full servicehistorikk og be om prøvekjøring.',
    },
  ],
  relatedCategories: [
    { label: 'Gravemaskiner', href: '/gravemaskiner' },
    { label: 'Hjullastere', href: '/hjullastere' },
    { label: 'Traktorer', href: '/traktorer' },
    { label: 'Kraner og løft', href: '/sok?category=kraner' },
  ],
}

export const dynamic = 'force-dynamic'

export default function DumperePage() {
  return <CategoryPageTemplate config={config} />
}
