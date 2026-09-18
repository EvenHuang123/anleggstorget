import type { Metadata } from 'next'
import CategoryPageTemplate from '@/components/seo/CategoryPageTemplate'
import { getCategoryData, buildCategoryMetadata } from '@/lib/seo/category'
import type { CategoryPageConfig } from '@/lib/seo/category'

const config: CategoryPageConfig = {
  category: 'gravemaskiner',
  slug: 'gravemaskiner',
  h1: 'Brukte gravemaskiner til salgs i Norge',
  metaTitle: 'Brukte gravemaskiner til salgs i Norge | Anleggstorget',
  metaDescription: 'Finn brukte gravemaskiner til salgs fra verifiserte norske bedrifter — beltegravere, hjulgravere og minigravere fra Volvo, Cat, Komatsu og Hitachi.',
  keywords: ['kjøp gravemaskin', 'selg gravemaskin', 'brukt gravemaskin Norge', 'bandgravemaskin til salgs', 'hjulgravemaskin', 'minigraver', 'Volvo gravemaskin', 'Caterpillar gravemaskin', 'Komatsu gravemaskin', 'Hitachi gravemaskin'],
  ogImage: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&q=75',
  intro: [
    'Anleggstorget er Norges markedsplass for kjøp og salg av gravemaskiner fra verifiserte bedrifter. Her finner du bandgravemaskiner, hjulgravemaskiner og minigravere fra ledende merker som Volvo, Caterpillar, Komatsu, Hitachi, Liebherr og Doosan.',
    'Alle selgere på plattformen er sjekket mot Brønnøysundregisteret — du handler kun med aktive, legitime norske bedrifter. Kontakt selger direkte uten mellomledd, forhandle pris og avtale levering.',
    'Leter du etter en brukt gravemaskin til anleggsprosjekter, grunnarbeid eller infrastrukturarbeid? Bruk søkefilteret for å finne riktig vektklasse, timeverk og lokasjon. Har du en gravemaskin du vil selge? Legg ut annonse gratis og nå kjøpere over hele Norge.',
  ],
  faq: [
    {
      q: 'Hva koster en brukt gravemaskin?',
      a: 'Prisen avhenger sterkt av vektklasse, timeverk og alder. Minigravere (0–6 tonn) starter fra ca. 150 000 kr, mellomstore beltegravere (6–20 tonn) ligger typisk mellom 400 000 og 1,5 mill kr, og store gravere (20+ tonn) fra 1,5 mill kr og oppover. Se faktiske priser i annonsene.',
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
      q: 'Hva bør jeg sjekke før jeg kjøper brukt gravemaskin?',
      a: 'Sjekk timeverk, servicehistorikk, slitasje på belter/dekk og hydraulikk, og om det nylig er utført service. Be om å se maskinen i drift og vurder transportkostnader til din lokasjon.',
    },
  ],
  relatedCategories: [
    { label: 'Hjullastere', href: '/hjullastere' },
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

export default function GravemaskinerPage() {
  return <CategoryPageTemplate config={config} />
}
