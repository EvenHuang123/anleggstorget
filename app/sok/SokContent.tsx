'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SortDesc, Grid3X3, LayoutList, X, Filter } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import ListingFilters from '@/components/listings/ListingFilters'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, formatNumber } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Nyeste først' },
  { value: 'price_asc', label: 'Pris lav–høy' },
  { value: 'price_desc', label: 'Pris høy–lav' },
  { value: 'hours_asc', label: 'Færrest timer' },
]


export default function SokContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const location = searchParams.get('location') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const minYear = searchParams.get('minYear') || ''
  const maxYear = searchParams.get('maxYear') || ''
  const minHours = searchParams.get('minHours') || ''
  const maxHours = searchParams.get('maxHours') || ''
  const weightClass = searchParams.get('weightClass') || ''
  const priceType = searchParams.get('priceType') || ''
  const brand = searchParams.get('brand') || ''

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      let qb = supabase
        .from('listings')
        .select('*, profiles(company_name, verified, org_number), favorites_count:favorites(count)')
        .eq('status', 'active')

      if (q) qb = qb.ilike('title', `%${q}%`)
      if (category) qb = qb.eq('category', category)
      if (location) qb = qb.ilike('location', `%${location}%`)
      if (brand) qb = qb.ilike('brand', `%${brand}%`)
      if (minPrice) qb = qb.gte('price', parseInt(minPrice))
      if (maxPrice) qb = qb.lte('price', parseInt(maxPrice))
      if (minYear) qb = qb.gte('year', parseInt(minYear))
      if (maxYear) qb = qb.lte('year', parseInt(maxYear))
      if (minHours) qb = qb.gte('operating_hours', parseInt(minHours))
      if (maxHours) qb = qb.lte('operating_hours', parseInt(maxHours))
      if (weightClass) qb = qb.eq('weight_class', weightClass)
      if (priceType) qb = qb.eq('price_type', priceType)

      if (sort === 'newest') qb = qb.order('created_at', { ascending: false })
      else if (sort === 'price_asc') qb = qb.order('price', { ascending: true })
      else if (sort === 'price_desc') qb = qb.order('price', { ascending: false })
      else if (sort === 'hours_asc') qb = qb.order('operating_hours', { ascending: true })

      const { data } = await qb.limit(48)
      setListings((data as Listing[]) || [])
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [q, category, location, brand, minPrice, maxPrice, minYear, maxYear, minHours, maxHours, weightClass, priceType, sort])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams(searchParams.toString())
    if (query) p.set('q', query); else p.delete('q')
    router.push(`/sok?${p.toString()}`)
  }

  const activeFilters = [
    category && { key: 'category', label: CATEGORIES[category]?.label },
    location && { key: 'location', label: location },
    brand && { key: 'brand', label: brand },
    minPrice && { key: 'minPrice', label: `Fra ${Number(minPrice).toLocaleString('nb-NO')} kr` },
    maxPrice && { key: 'maxPrice', label: `Til ${Number(maxPrice).toLocaleString('nb-NO')} kr` },
  ].filter(Boolean)

  return (
    <div className="container-main" style={{ padding: '32px 24px 80px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 28, color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 6 }}>
          {category ? `${CATEGORIES[category]?.label || category}` : 'Alle maskiner'}
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: 13 }}>
          {loading ? 'Søker...' : `${formatNumber(listings.length)} annonser funnet`}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk i resultater..."
            className="input-base"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0 20px', height: 44 }}>Søk</button>
        <button type="button" onClick={() => setShowMobileFilters(true)} className="btn-secondary show-filter-btn" style={{ padding: '0 16px', height: 44 }}>
          <Filter size={14} /> Filter
        </button>
      </form>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {activeFilters.map(f => f && (
            <div key={f.key} className="tag tag-gold" style={{ padding: '4px 10px' }}>
              {f.label}
              <button
                onClick={() => {
                  const p = new URLSearchParams(searchParams.toString())
                  p.delete(f.key)
                  router.push(`/sok?${p.toString()}`)
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold2)', padding: 0, marginLeft: 4 }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Filters sidebar */}
        <div className="filters-sidebar">
          <ListingFilters />
        </div>

        {/* Mobile filters overlay */}
        {showMobileFilters && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          }} onClick={() => setShowMobileFilters(false)}>
            <div
              style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 300,
                background: 'var(--bg2)', overflowY: 'auto', padding: 20,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: 'var(--t1)' }}>Filter</span>
                <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)' }}>
                  <X size={18} />
                </button>
              </div>
              <ListingFilters />
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Sort + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SortDesc size={14} style={{ color: 'var(--t3)' }} />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--t1)',
                  fontFamily: 'Barlow', fontSize: 13, padding: '6px 10px',
                  borderRadius: 3, cursor: 'pointer', outline: 'none',
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    background: viewMode === mode ? 'var(--bg4)' : 'transparent',
                    border: `1px solid ${viewMode === mode ? 'var(--border2)' : 'transparent'}`,
                    borderRadius: 3, padding: '6px 8px',
                    color: viewMode === mode ? 'var(--t1)' : 'var(--t3)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {mode === 'grid' ? <Grid3X3 size={14} /> : <LayoutList size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Listings */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card shimmer" style={{ height: 280 }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 24px',
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4,
            }}>
              <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20, color: 'var(--t1)', marginBottom: 8 }}>
                Ingen annonser funnet
              </p>
              <p style={{ color: 'var(--t3)', fontSize: 14 }}>
                Prøv å justere filtrene eller søketeksten
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr',
              gap: viewMode === 'grid' ? 16 : 12,
            }} className="results-grid">
              {listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorite={favorites.has(listing.id)}
                  onToggleFavorite={id => {
                    setFavorites(prev => {
                      const next = new Set(prev)
                      next.has(id) ? next.delete(id) : next.add(id)
                      return next
                    })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .filters-sidebar { display: block; }
        .show-filter-btn { display: none !important; }
        .results-grid { grid-template-columns: repeat(3, 1fr) !important; }
        @media (max-width: 1100px) { .results-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 900px) {
          .filters-sidebar { display: none !important; }
          .show-filter-btn { display: flex !important; }
          .results-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) { .results-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
