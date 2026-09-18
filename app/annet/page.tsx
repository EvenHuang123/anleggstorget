import type { Metadata } from 'next'
import CategoryPageTemplate from '@/components/seo/CategoryPageTemplate'
import { getCategoryData, buildCategoryMetadata } from '@/lib/seo/category'
import type { CategoryPageConfig } from '@/lib/seo/category'

const config: CategoryPageConfig = {
  category: 'annet',
  slug: 'annet',
  h1: 'Annet anleggsutstyr til salgs i Norge',
  metaTitle: 'Annet anleggsutstyr og maskiner til salgs i Norge | Anleggstorget',
  metaDescription: 'Finn annet brukt anleggsutstyr til salgs fra verifiserte norske bedrifter — dosere, veihøvler, pæleigger, generatorer, komprimering og tilbehør.',
  keywords: ['brukt anleggsutstyr Norge', 'dozer til salgs', 'veihøvel', 'pælerigg', 'generator anlegg', 'komprimering asfalt', 'skogsutstyr', 'anleggsmaskiner tilbehør', 'B2B anleggsutstyr'],
  ogImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=75',
  intro: [
    'Anleggstorget er Norges markedsplass for kjøp og salg av anleggsmaskiner og utstyr fra verifiserte bedrifter. I denne kategorien finner du alt som ikke passer i de øvrige — dosere og veihøvler, pælerigger, generatorer, komprimerings- og asfaltutstyr, skogsmaskiner og tilbehør.',
    'Spesialmaskiner og støtteutstyr er ofte avgjørende for å få jobben gjort, men vanskeligere å finne på det åpne markedet. Her samler vi disse maskinene på ett sted, slik at bedrifter med ledig utstyr enkelt når bedrifter som trenger det.',
    'Alle selgere er verifisert mot Brønnøysundregisteret — du handler kun med aktive, seriøse norske bedrifter. Bruk søkefilteret for å snevre inn på type, lokasjon og pris, eller legg ut ditt eget utstyr gratis og nå kjøpere i hele Norge.',
  ],
  faq: [
    {
      q: 'Hva slags utstyr finner jeg i kategorien «Annet»?',
      a: 'Her finner du blant annet dosere og veihøvler, pælerigger, generatorer, komprimeringsutstyr, asfaltmaskiner, skogsutstyr, betongutstyr og diverse redskaper og tilbehør til anleggsmaskiner.',
    },
    {
      q: 'Hvorfor er dette samlet i én kategori?',
      a: 'Dette er spesialmaskiner og støtteutstyr som ikke tilhører hovedkategoriene gravemaskiner, hjullastere, dumpere, kompaktmaskiner eller kraner. Å samle dem gjør det lettere å finne mindre vanlige maskiner.',
    },
    {
      q: 'Er selgerne verifiserte?',
      a: 'Ja. Alle bedrifter på Anleggstorget er verifisert mot Brønnøysundregisteret før de kan legge ut annonser. Du ser alltid organisasjonsnummer og verifisert-status.',
    },
    {
      q: 'Kan jeg selge spesialutstyr her?',
      a: 'Absolutt. Registrer bedriften din gratis, velg riktig kategori og last opp bilder og teknisk informasjon. Annonsen er synlig for kjøpere over hele Norge innen minutter.',
    },
  ],
  relatedCategories: [
    { label: 'Gravemaskiner', href: '/gravemaskiner' },
    { label: 'Hjullastere', href: '/hjullastere' },
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

export default function AnnetPage() {
  return <CategoryPageTemplate config={config} />
}
