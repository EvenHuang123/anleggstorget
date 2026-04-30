/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import AnnonseContent from './AnnonseContent'
import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchListing(slugOrId: string) {
  try {
    const supabase = await createClient()
    // Try slug first, fall back to ID
    for (const field of ['slug', 'id']) {
      const { data } = await (supabase as any)
        .from('listings')
        .select('*, profiles(*), favorites_count:favorites(count)')
        .eq(field, slugOrId)
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

  const desc = listing.description
    ? listing.description.substring(0, 155) + '…'
    : `${listing.brand || ''} ${listing.model || ''} – ${listing.price.toLocaleString('nb-NO')} kr`.trim()

  return {
    title: `${listing.title} – ${listing.price.toLocaleString('nb-NO')} kr | Anleggstorget`,
    description: desc,
    openGraph: {
      title: listing.title,
      description: desc,
      images: listing.images?.[0]
        ? [`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${listing.images[0]}`]
        : ['/og-image.jpg'],
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
    const supabase = await createClient()
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


  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
        <AnnonseContent listing={listing} related={related} />
      </main>
      <Footer />
    </>
  )
}
