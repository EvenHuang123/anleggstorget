import type { Metadata } from 'next'
import CategoryPageTemplate from '@/components/seo/CategoryPageTemplate'
import { getCategoryData, buildCategoryMetadata } from '@/lib/seo/category'
import type { CategoryPageConfig } from '@/lib/seo/category'

const config: CategoryPageConfig = {
  category: 'traktor',
  slug: 'traktorer',
  h1: 'Brukte traktorer til salgs i Norge',
  metaTitle: 'Brukte traktorer til salgs i Norge | Anleggstorget',
  metaDescription: 'Finn brukte traktorer til salgs fra verifiserte norske bedrifter — landbrukstraktorer, anleggstraktorer og kompakttraktorer fra John Deere, Fendt og Valtra.',
  keywords: ['kjøp traktor', 'selg traktor', 'brukt traktor Norge', 'landbrukstraktor', 'anleggstraktor', 'kompakttraktor', 'John Deere traktor', 'Fendt traktor', 'Valtra traktor', 'traktor til salgs'],
  ogImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=75',
  intro: [
    'Anleggstorget er Norges markedsplass for kjøp og salg av traktorer fra verifiserte bedrifter. Her finner du landbrukstraktorer, anleggstraktorer og kompakttraktorer fra ledende merker som John Deere, Fendt, Valtra, New Holland, Case IH og Claas.',
    'Traktorer brukes i alt fra jordbruk og skogsdrift til kommunalteknikk og anleggsarbeid. På Anleggstorget finner du alt fra kompakttraktorer under 50 hk til store firehjulsdrevne landbrukstraktorer med over 300 hk — tilgjengelig fra verifiserte norske bedrifter over hele landet.',
    'Alle selgere er verifisert mot Brønnøysundregisteret — ingen privatsalg, kun seriøse norske bedrifter. Kontakt selger direkte uten mellomledd. Har du en traktor til salgs? Legg ut gratis og nå kjøpere fra Rogaland til Troms.',
  ],
  faq: [
    {
      q: 'Hvilke typer traktorer finner jeg på Anleggstorget?',
      a: 'Du finner kompakttraktorer (< 50 hk), mellomstore landbrukstraktorer (50–150 hk) og store traktorer (150+ hk). Merker som John Deere, Fendt, Valtra, New Holland, Case IH, Claas og Massey Ferguson er representert.',
    },
    {
      q: 'Hva koster en brukt traktor?',
      a: 'Kompakttraktorer starter fra ca. 150 000–400 000 kr. Mellomstore landbrukstraktorer (80–150 hk) ligger typisk i 400 000–1,2 mill kr avhengig av timeverk og utstyr. Store traktorer med frontlaster og spesialtilbehør kan koste 1,5–3 mill kr.',
    },
    {
      q: 'Kan jeg kjøpe traktor med frontlaster og redskaper?',
      a: 'Ja. Mange annonser inkluderer frontlaster, skuffe og annet tilbehør. Filtrer på kategori og les annonsebeskrivelsen nøye for å se hva som følger med.',
    },
    {
      q: 'Er selgerne på Anleggstorget verifiserte?',
      a: 'Ja. Alle bedrifter er sjekket mot Brønnøysundregisteret før de kan legge ut annonser. Du ser alltid organisasjonsnummer og verifisert-status på selgerens profil.',
    },
    {
      q: 'Hva bør jeg kontrollere før kjøp av brukt traktor?',
      a: 'Sjekk timeverk, hydraulikksystem, kraftuttak (PTO), 4WD-funksjon, dekktilstand og servicehistorikk. Be om prøvekjøring og kontroller at elektronikk og eventuell GPS/autostyring fungerer.',
    },
  ],
  relatedCategories: [
    { label: 'Gravemaskiner', href: '/gravemaskiner' },
    { label: 'Hjullastere', href: '/hjullastere' },
    { label: 'Dumpere', href: '/dumpere' },
    { label: 'Annet utstyr', href: '/annet' },
  ],
}

// ISR: revalider hver time — maskinlisten endres, men ikke minutt for minutt.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { count } = await getCategoryData(config.category)
  return buildCategoryMetadata(config, count)
}

export default function TraktororPage() {
  return <CategoryPageTemplate config={config} />
}
