import type { Metadata } from 'next'
import CategoryPageTemplate from '@/components/seo/CategoryPageTemplate'
import { getCategoryData, buildCategoryMetadata } from '@/lib/seo/category'
import type { CategoryPageConfig } from '@/lib/seo/category'

const config: CategoryPageConfig = {
  category: 'kraner',
  slug: 'kraner-og-loft',
  h1: 'Brukte kraner og løfteutstyr til salgs i Norge',
  metaTitle: 'Brukte kraner og løfteutstyr til salgs i Norge | Anleggstorget',
  metaDescription: 'Finn brukte kraner og løfteutstyr til salgs fra verifiserte norske bedrifter — mobilkraner, lastebilkraner, personløftere og tårnkraner fra Liebherr, Palfinger og Hiab.',
  keywords: ['kjøp mobilkran', 'brukt kran Norge', 'lastebilkran til salgs', 'personløfter', 'saksløfter', 'tårnkran', 'Liebherr mobilkran', 'Palfinger kran', 'Hiab lastebilkran', 'løfteutstyr B2B'],
  ogImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=75',
  intro: [
    'Anleggstorget er Norges markedsplass for kjøp og salg av kraner og løfteutstyr fra verifiserte bedrifter. Her finner du mobilkraner, lastebilkraner, personløftere og tårnkraner fra ledende merker som Liebherr, Palfinger, Hiab, Manitowoc, JLG og Genie.',
    'Løfteutstyr er kritisk i bygg og anlegg, industri, havnedrift og montasjearbeid. Enten du trenger en lastebilkran for daglig logistikk, en personløfter for arbeid i høyden, eller en mobilkran for tunge løft, finner du maskiner tilpasset norske forhold og forskrifter.',
    'Alle selgere er verifisert mot Brønnøysundregisteret — ingen privatsalg, kun seriøse norske bedrifter. Kontakt selger direkte, forhandle pris og avtale levering. Har du kran eller løfteutstyr til salgs? Legg ut gratis og nå kjøpere over hele landet.',
  ],
  faq: [
    {
      q: 'Hva koster en brukt kran?',
      a: 'Prisen varierer sterkt med type og kapasitet. Lastebilkraner starter fra ca. 150 000 kr, personløftere fra 100 000–500 000 kr, mens mobilkraner og tårnkraner med høy løftekapasitet kan koste flere millioner. Se faktiske priser i annonsene.',
    },
    {
      q: 'Hvilke typer løfteutstyr finner jeg her?',
      a: 'Du finner mobilkraner, lastebilkraner (kranbil), personløftere (saks- og bomløftere), tårnkraner og annet løfteutstyr. Merker som Liebherr, Palfinger, Hiab, JLG, Genie og Manitowoc er representert.',
    },
    {
      q: 'Følger sertifisering og dokumentasjon med?',
      a: 'Krav til sakkyndig kontroll og sertifisering gjelder for løfteutstyr i Norge. Be alltid selger om gyldig kontrollrapport og dokumentasjon før kjøp — seriøse bedrifter har dette i orden.',
    },
    {
      q: 'Hva bør jeg sjekke før jeg kjøper brukt kran?',
      a: 'Kontroller løftekapasitet og rekkevidde mot ditt behov, tilstand på wire, hydraulikk og bom, samt siste sakkyndige kontroll. Be om servicehistorikk, kontrollrapport og gjerne en demonstrasjon av løftefunksjonene.',
    },
  ],
  relatedCategories: [
    { label: 'Gravemaskiner', href: '/gravemaskiner' },
    { label: 'Hjullastere', href: '/hjullastere' },
    { label: 'Kompaktmaskiner', href: '/kompaktmaskiner' },
    { label: 'Annet utstyr', href: '/annet' },
  ],
}

// ISR: revalider hver time — maskinlisten endres, men ikke minutt for minutt.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { count } = await getCategoryData(config.category)
  return buildCategoryMetadata(config, count)
}

export default function KranerOgLoftPage() {
  return <CategoryPageTemplate config={config} />
}
