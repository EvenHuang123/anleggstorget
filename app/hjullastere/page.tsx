import type { Metadata } from 'next'
import CategoryPageTemplate from '@/components/seo/CategoryPageTemplate'
import { getCategoryData, buildCategoryMetadata } from '@/lib/seo/category'
import type { CategoryPageConfig } from '@/lib/seo/category'

const config: CategoryPageConfig = {
  category: 'hjullastere',
  slug: 'hjullastere',
  h1: 'Brukte hjullastere til salgs i Norge',
  metaTitle: 'Brukte hjullastere til salgs i Norge | Anleggstorget',
  metaDescription: 'Finn brukte hjullastere til salgs fra verifiserte norske bedrifter — kompaktlastere, teleskoplastere og store hjullastere fra Volvo, Cat, Komatsu og Manitou.',
  keywords: ['kjøp hjullaster', 'selg hjullaster', 'brukt hjullaster Norge', 'kompaktlaster', 'teleskoplaster', 'Volvo hjullaster', 'Caterpillar hjullaster', 'Komatsu hjullaster', 'hjullaster til salgs'],
  ogImage: 'https://images.unsplash.com/photo-1625231334168-35067f8853ed?w=1200&q=75',
  intro: [
    'Anleggstorget er Norges markedsplass for kjøp og salg av hjullastere fra verifiserte bedrifter. Her finner du kompaktlastere, teleskoplastere og store hjullastere fra ledende merker som Volvo, Caterpillar, Komatsu, Liebherr og Manitou.',
    'Hjullastere er allsidige maskiner brukt i alt fra massehåndtering og lossing til jordbruk og industri. På Anleggstorget finner du alt fra kompakte modeller under 5 tonn til store industrihjullastere på 20+ tonn — alle tilgjengelige fra verifiserte norske bedrifter.',
    'Alle transaksjoner skjer direkte mellom kjøper og selger uten provisjon. Legg ut hjullasteren din gratis og nå kjøpere i hele Norge, eller bruk søkefilteret for å finne riktig maskin til ditt behov.',
  ],
  faq: [
    {
      q: 'Hvilke typer hjullastere finner jeg på Anleggstorget?',
      a: 'Du finner kompaktlastere (< 5 tonn), mellomstore hjullastere (5–15 tonn) og store hjullastere (15+ tonn). Merker som Volvo, Caterpillar, Komatsu, Liebherr, Manitou og Case er representert.',
    },
    {
      q: 'Hva koster en brukt hjullaster?',
      a: 'Pris varierer mye etter størrelse, timeverk og alder. Kompaktlastere kan gå fra 300 000–800 000 kr, mellomstore fra 800 000–2 mill, og store hjullastere fra 2–5+ millioner kr. Se faktiske priser i annonsene.',
    },
    {
      q: 'Kan jeg leie ut hjullasteren min via Anleggstorget?',
      a: 'Ja. Anleggstorget støtter både salg og utleie. Velg "utleie" som annonse-type når du legger ut maskinen din.',
    },
    {
      q: 'Er det trygt å kjøpe brukt hjullaster her?',
      a: 'Alle selgere er verifisert mot Brønnøysundregisteret. Vi anbefaler alltid befaring og prøvekjøring før kjøp. Kontakt selger direkte for full historikk.',
    },
    {
      q: 'Hva bør jeg se etter ved kjøp av brukt hjullaster?',
      a: 'Sjekk timeverk, hydraulikk-tilstand, dekkslitasje, leddbolter og serviceintervaller. Be om å se maskinen i drift og få service-journal.',
    },
  ],
  relatedCategories: [
    { label: 'Gravemaskiner', href: '/gravemaskiner' },
    { label: 'Dumpere', href: '/dumpere' },
    { label: 'Kompaktmaskiner', href: '/kompaktmaskiner' },
    { label: 'Kraner og løft', href: '/kraner-og-loft' },
  ],
}

// ISR: revalider hver time — maskinlisten endres, men ikke minutt for minutt.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { count } = await getCategoryData(config.category)
  return buildCategoryMetadata(config, count)
}

export default function HjullasterePage() {
  return <CategoryPageTemplate config={config} />
}
