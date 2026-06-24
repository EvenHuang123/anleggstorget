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
