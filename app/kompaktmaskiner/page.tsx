import type { Metadata } from 'next'
import CategoryPageTemplate from '@/components/seo/CategoryPageTemplate'
import { getCategoryData, buildCategoryMetadata } from '@/lib/seo/category'
import type { CategoryPageConfig } from '@/lib/seo/category'

const config: CategoryPageConfig = {
  category: 'kompaktmaskiner',
  slug: 'kompaktmaskiner',
  h1: 'Brukte kompaktmaskiner til salgs i Norge',
  metaTitle: 'Brukte kompaktmaskiner til salgs i Norge | Anleggstorget',
  metaDescription: 'Finn brukte kompaktmaskiner til salgs fra verifiserte norske bedrifter — kompaktlastere, teleskoplastere og teleskoptrucker fra Bobcat, Manitou, JCB og Kramer.',
  keywords: ['kjøp kompaktlaster', 'brukt kompaktmaskin Norge', 'teleskoplaster til salgs', 'teleskoptruck', 'Bobcat kompaktlaster', 'Manitou teleskoplaster', 'JCB teleskoplaster', 'kompaktmaskin B2B'],
  ogImage: 'https://images.unsplash.com/photo-1625231334168-35067f8853ed?w=1200&q=75',
  intro: [
    'Anleggstorget er Norges markedsplass for kjøp og salg av kompaktmaskiner fra verifiserte bedrifter. Her finner du kompaktlastere, teleskoplastere og teleskoptrucker fra ledende merker som Bobcat, Manitou, JCB, Kramer, Caterpillar og Merlo.',
    'Kompaktmaskiner er uunnværlige på trange byggeplasser, i landbruk, industri og logistikk der plassen er begrenset men behovet for løfte- og lastekapasitet er stort. Teleskoplastere gir ekstra rekkevidde i høyden, mens kompaktlastere er smidige arbeidshester for daglig drift.',
    'Alle selgere er verifisert mot Brønnøysundregisteret — du handler kun med aktive, seriøse norske bedrifter. Bruk søkefilteret for å finne riktig løftekapasitet, rekkevidde og timeverk, eller legg ut din egen maskin gratis og nå kjøpere i hele Norge.',
  ],
  faq: [
    {
      q: 'Hva koster en brukt kompaktmaskin?',
      a: 'Kompaktlastere starter typisk fra 150 000–500 000 kr avhengig av alder og timeverk. Teleskoplastere ligger ofte mellom 400 000 og 1,2 mill kr, mens større teleskoptrucker med høy løftekapasitet kan koste mer. Se faktiske priser i annonsene.',
    },
    {
      q: 'Hva er forskjellen på kompaktlaster og teleskoplaster?',
      a: 'En kompaktlaster (skid-steer eller kompakt hjullaster) er en liten, svingbar lastemaskin for trange forhold. En teleskoplaster har en uttrekkbar bom som gir betydelig rekkevidde og løftehøyde — ideell for å stable og løfte materialer i høyden.',
    },
    {
      q: 'Hvilke merker finner jeg her?',
      a: 'Bobcat, Manitou, JCB, Kramer, Caterpillar, Merlo, Wacker Neuson og Avant er blant merkene som er representert. Nye annonser kommer til løpende.',
    },
    {
      q: 'Hva bør jeg sjekke før jeg kjøper brukt kompaktmaskin?',
      a: 'Kontroller timeverk, hydraulikk, tilstand på bom og teleskopseksjon (på teleskoplastere), dekk og hurtigfeste. Sjekk at redskaper følger med, og be om servicehistorikk og prøvekjøring.',
    },
  ],
  relatedCategories: [
    { label: 'Hjullastere', href: '/hjullastere' },
    { label: 'Gravemaskiner', href: '/gravemaskiner' },
    { label: 'Dumpere', href: '/dumpere' },
    { label: 'Kraner og løft', href: '/kraner-og-loft' },
  ],
}

// ISR: revalider hver time — maskinlisten endres, men ikke minutt for minutt.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { count } = await getCategoryData(config.category)
  return buildCategoryMetadata(config, count)
}

export default function KompaktmaskinerPage() {
  return <CategoryPageTemplate config={config} />
}
