'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import ListingCard from '@/components/listings/ListingCard'
import type { Listing } from '@/lib/supabase/types'

function AnimatedCard({ listing, index }: { listing: Listing; index: number }) {
  const { ref, visible } = useScrollReveal('0px 0px -40px 0px')
  return (
    <div
      ref={ref}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms`,
      }}
    >
      <ListingCard listing={listing} />
    </div>
  )
}

export default function AnimatedListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20,
    }} className="listing-grid-3">
      {listings.map((listing, i) => (
        <AnimatedCard key={listing.id} listing={listing} index={i} />
      ))}
    </div>
  )
}
