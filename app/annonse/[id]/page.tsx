/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import AnnonseContent from './AnnonseContent'
import { createPublicClient } from '@/lib/supabase/public'
import type { Listing } from '@/lib/supabase/types'
import { CATEGORIES, getListingImageUrl } from '@/lib/utils/format'
import { listingSchema, breadcrumbSchema } from '@/lib/schema'

// ISR: re-render at most once every 5 minutes. No cookies() call = static-cacheable.
export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  // Build-time: generate nothing. Pages are SSR'd on first request, then cached.
  return []
}

interface Props {
  params: Promise<{ id: string }>
}

async function fetchListing(slugOrId: string) {
  try {
    const supabase = createPublicClient()
    for (const field of ['slug', 'id']) {
      const { data } = await (supabase as any)
        .from('listings')
        .select('*, profiles(*), favorites_count:favorites(count)')
        .eq(field, slugOrId)
        .in('status', ['active', 'sold', 'reserved'])
        .single() as { data: Listing | null }
      if (data) return data
    }
    return null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await fetchListing(id)
  if (!listing) return { title: 'Annonse ikke funnet' }

  const priceStr = listing.price && listing.price > 0
    ? `${listing.price.toLocaleString('nb-NO')} kr`
    : 'Forhandlingsbar'

  const desc = listing.description
    ? listing.description.substring(0, 155) + '…'
    : `${listing.brand || ''} ${listing.model || ''} – ${priceStr}`.trim()

  const slug = listing.slug || id
  const ogImage = listing.images?.[0]
    ? getListingImageUrl(listing.images[0])
    : '/og-image.jpg'

  return {
    title: { absolute: `${listing.title} – ${priceStr} | Anleggstorget` },
    description: desc,
    alternates: {
      canonical: `https://www.anleggstorget.no/annonse/${slug}`,
    },
    openGraph: {
      title: listing.title,
      description: desc,
      url: `https://www.anleggstorget.no/annonse/${slug}`,
      images: [ogImage],
    },
  }
}

export default async function AnnonsePage({ params }: Props) {
  const { id } = await params
  const listing = await fetchListing(id)

  if (!listing) notFound()

  // Related listings — same category, exclude current
  let related: Listing[] = []
  try {
    const supabase = createPublicClient()
    const { data } = await (supabase as any)
      .from('listings')
      .select('*, profiles(company_name, verified)')
      .eq('category', listing.category)
      .eq('status', 'active')
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(3) as { data: Listing[] | null }
    related = data || []
  } catch {
    related = []
  }


  const slug = listing.slug || id
  const categoryLabel = CATEGORIES[listing.category]?.label || listing.category
  const breadcrumbs = [
    { name: 'Hjem', url: 'https://anleggstorget.no' },
    { name: 'Maskiner', url: 'https://www.anleggstorget.no/sok' },
    { name: categoryLabel, url: `https://www.anleggstorget.no/sok?category=${listing.category}` },
    { name: listing.title, url: `https://www.anleggstorget.no/annonse/${slug}` },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema(listing)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
        <AnnonseContent listing={listing} related={related} />
      </main>
      <Footer />
    </>
  )
}
