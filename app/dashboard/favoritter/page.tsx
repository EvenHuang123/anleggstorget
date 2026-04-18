'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ListingCard from '@/components/listings/ListingCard'
import type { Listing } from '@/lib/supabase/types'

export default function FavoritterPage() {
  const supabase = createClient()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/logg-inn'; return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('favorites')
        .select('listing_id, listings(*, profiles(company_name, verified, org_number))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }) as {
          data: Array<{ listing_id: string; listings: Listing }> | null
        }

      const favListings = (data || []).map(f => f.listings).filter(Boolean)
      setListings(favListings)
      setFavorites(new Set(favListings.map(l => l.id)))
      setLoading(false)
    }
    load()
  }, [])

  const toggleFavorite = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('favorites').delete()
      .eq('user_id', session.user.id)
      .eq('listing_id', id)

    setListings(prev => prev.filter(l => l.id !== id))
    setFavorites(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 24, color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Favoritter
          </h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="card shimmer" style={{ height: 280 }} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 24, color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 4 }}>
          Favoritter
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: 14 }}>
          {listings.length > 0 ? `${listings.length} lagrede maskiner` : 'Ingen favoritter ennå'}
        </p>
      </div>

      {listings.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px', textAlign: 'center',
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--bg3)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Heart size={22} style={{ color: 'var(--t3)' }} />
          </div>
          <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--t1)', marginBottom: 8 }}>
            Ingen favoritter ennå
          </p>
          <p style={{ color: 'var(--t3)', fontSize: 14 }}>
            Klikk hjerte-ikonet på en annonse for å lagre den her.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="fav-grid">
          {listings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFavorite={favorites.has(listing.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <style>{`
        .fav-grid { grid-template-columns: repeat(3,1fr) !important; }
        @media (max-width: 1024px) { .fav-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px) { .fav-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
