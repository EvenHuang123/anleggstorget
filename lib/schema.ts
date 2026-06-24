import type { Listing } from '@/lib/supabase/types'
import { getListingImageUrl } from '@/lib/utils/format'

const BASE = 'https://www.anleggstorget.no'

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Anleggstorget',
    url: BASE,
    logo: `${BASE}/at-2.png`,
    description: 'Norges B2B-markedsplass for kjøp, salg og utleie av brukte anleggsmaskiner mellom verifiserte bedrifter.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'kontakt@anleggstorget.no',
      contactType: 'customer service',
      availableLanguage: 'Norwegian',
    },
    sameAs: [],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Anleggstorget',
    url: BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE}/sok?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Hvordan fungerer Anleggstorget?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Anleggstorget er en B2B-markedsplass kun for verifiserte norske bedrifter. Registrer din bedrift gratis ved å verifisere organisasjonsnummeret mot Brønnøysundregisteret, legg ut annonser for maskiner du vil selge eller leie ut, og kom i direkte kontakt med andre bedrifter. Ingen mellommenn, ingen provisjon.',
        },
      },
      {
        '@type': 'Question',
        name: 'Er alle bedrifter verifiserte?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, alle bedrifter på Anleggstorget er automatisk verifisert mot Brønnøysundregisteret før de kan legge ut annonser. Vi sjekker organisasjonsnummer og bedriftsnavn i sanntid, noe som sikrer at kun ekte, registrerte norske bedrifter kan handle på plattformen.',
        },
      },
      {
        '@type': 'Question',
        name: 'Koster det å legge ut annonser?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nei, det er helt gratis å legge ut annonser på Anleggstorget. Vi tar ingen provisjon på salg, ingen skjulte kostnader, og ingen abonnementsavgift. Plattformen er 100% gratis for alle verifiserte bedrifter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hvilke typer maskiner kan jeg kjøpe, selge og leie?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Du kan kjøpe, selge og leie alle typer anleggsmaskiner på Anleggstorget: gravemaskiner, hjullastere, dumpere, traktorer, kraner, kompaktlastere, veivalser og mer. Alt fra små minigravere på 1–2 tonn til store anleggsmaskiner på 40+ tonn.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hvordan kontakter jeg en selger?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Klikk på "Kontakt selger" på en annonse, fyll ut en kort melding med ditt spørsmål, så får selgeren beskjed på e-post umiddelbart. Du kan også se selgerens bedriftsinformasjon, organisasjonsnummer og kontaktdetaljer direkte på annonsen.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kan jeg leie ut maskiner på Anleggstorget?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja! Anleggstorget støtter både salg og utleie av maskiner. Når du legger ut en annonse kan du spesifisere at maskinen er til leie, og oppgi leiepris per dag, uke eller måned.',
        },
      },
    ],
  }
}

export function listingSchema(listing: Listing) {
  const slug = listing.slug || listing.id
  const images = (listing.images ?? []).map(img => getListingImageUrl(img)).filter(Boolean)
  const price = listing.price_ex_vat ?? (listing.price > 0 ? listing.price : null)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description
      ? listing.description.substring(0, 500)
      : `${listing.title} til salgs. ${listing.year ? `Årsmodell ${listing.year}` : ''}${listing.operating_hours != null ? `, ${listing.operating_hours.toLocaleString('nb-NO')} driftstimer` : ''}. ${listing.location ? `Lokasjon: ${listing.location}.` : ''}`.trim(),
    ...(images.length > 0 && { image: images }),
    ...(listing.brand && { brand: { '@type': 'Brand', name: listing.brand } }),
    ...(listing.model && { model: listing.model }),
    ...(listing.year && { vehicleModelDate: String(listing.year) }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NOK',
      ...(price != null && price > 0 && { price }),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      itemCondition: 'https://schema.org/UsedCondition',
      url: `${BASE}/annonse/${slug}`,
      ...(listing.profiles && {
        seller: {
          '@type': 'Organization',
          name: listing.profiles.company_name,
          ...(listing.profiles.org_number && { identifier: listing.profiles.org_number }),
        },
      }),
    },
    ...(listing.category && { category: listing.category }),
  }

  return schema
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
