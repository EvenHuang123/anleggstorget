'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SortDesc, Grid3X3, LayoutList, X, Filter, SlidersHorizontal } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import ListingFilters from '@/components/listings/ListingFilters'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, formatNumber } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Nyeste først' },
  { value: 'price_asc', label: 'Pris lav–høy' },
  { value: 'price_desc',label: 'Pris høy–lav' },
  { value: 'hours_asc', label: 'Færrest timer' },
]

export default function SokContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [listings, setListings]         = useState<Listing[]>([])
  const [loading, setLoading]           = useState(true)
  const [sort, setSort]                 = useState('newest')
  const [viewMode, setViewMode]         = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [query, setQuery]               = useState(searchParams.get('q') || '')
  const [favorites, setFavorites]       = useState<Set<string>>(new Set())

  // Read all active filter params from URL
  const q            = searchParams.get('q')        || ''
  const categoryParam= searchParams.get('category') || ''
  const categories   = categoryParam.split(',').filter(Boolean) // multi-select
  const location     = searchParams.get('location') || ''
  const minPrice     = searchParams.get('minPrice') || ''
  const maxPrice     = searchParams.get('maxPrice') || ''
  const minYear      = searchParams.get('minYear')  || ''
  const maxYear      = searchParams.get('maxYear')  || ''
  const minHours     = searchParams.get('minHours') || ''
  const maxHours     = searchParams.get('maxHours') || ''
  const weightClass  = searchParams.get('weightClass') || ''
  const listingType  = searchParams.get('listingType') || ''
  const brand        = searchParams.get('brand')    || ''

  // Count active filter groups (for badge on mobile button)
  const activeFilterCount = [
    categories.length > 0,
    !!location,
    !!(minPrice || maxPrice),
    !!listingType,
    !!brand,
    !!(minYear || maxYear),
    !!(minHours || maxHours),
    !!weightClass,
  ].filter(Boolean).length

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let qb = (supabase as any)
        .from('listings')
        .select('*, profiles(company_name, verified, org_number), favorites_count:favorites(count)')
        .eq('status', 'active')

      // Multi-category: use .in() when multiple selected
      if (categories.length === 1) qb = qb.eq('category', categories[0])
      else if (categories.length > 1) qb = qb.in('category', categories)

      if (q)          qb = qb.ilike('title', `%${q}%`)
      if (location)   qb = qb.ilike('location', `%${location}%`)
      if (brand)      qb = qb.ilike('brand', `%${brand}%`)
      if (minPrice)   qb = qb.gte('price', parseInt(minPrice))
      if (maxPrice)   qb = qb.lte('price', parseInt(maxPrice))
      if (minYear)    qb = qb.gte('year', parseInt(minYear))
      if (maxYear)    qb = qb.lte('year', parseInt(maxYear))
      if (minHours)   qb = qb.gte('operating_hours', parseInt(minHours))
      if (maxHours)   qb = qb.lte('operating_hours', parseInt(maxHours))
      if (weightClass)qb = qb.eq('weight_class', weightClass)
      // listing_type requires DB migration — handled gracefully via try/catch
      if (listingType === 'sale') qb = qb.eq('listing_type', 'sale')
      else if (listingType === 'rent') qb = qb.eq('listing_type', 'rent')

      if (sort === 'newest')     qb = qb.order('created_at', { ascending: false })
      else if (sort === 'price_asc')  qb = qb.order('price', { ascending: true })
      else if (sort === 'price_desc') qb = qb.order('price', { ascending: false })
      else if (sort === 'hours_asc')  qb = qb.order('operating_hours', { ascending: true })

      const { data } = await qb.limit(48)
      setListings((data as Listing[]) || [])
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [q, categoryParam, location, brand, minPrice, maxPrice, minYear, maxYear, minHours, maxHours, weightClass, listingType, sort])

  useEffect(() => { fetchListings() }, [fetchListings])

  // Keep search input in sync with URL param
  useEffect(() => { setQuery(searchParams.get('q') || '') }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams(searchParams.toString())
    if (query) p.set('q', query); else p.delete('q')
    router.push(`/sok?${p.toString()}`)
  }

  const removeFilter = (key: string) => {
    const p = new URLSearchParams(searchParams.toString())
    p.delete(key)
    router.push(`/sok?${p.toString()}`)
  }

  // Build active filter chips for display
  const activeChips = [
    ...categories.map(c => ({
      key: `cat-${c}`,
      label: CATEGORIES[c]?.label ?? c,
      onRemove: () => {
        const remaining = categories.filter(x => x !== c)
        const p = new URLSearchParams(searchParams.toString())
        if (remaining.length > 0) p.set('category', remaining.join(','))
        else p.delete('category')
        router.push(`/sok?${p.toString()}`)
      },
    })),
    location && { key: 'location', label: location, onRemove: () => removeFilter('location') },
    brand    && { key: 'brand',    label: brand,    onRemove: () => removeFilter('brand') },
    minPrice && { key: 'minPrice', label: `Fra ${Number(minPrice).toLocaleString('nb-NO')} kr`, onRemove: () => removeFilter('minPrice') },
    maxPrice && { key: 'maxPrice', label: `Til ${Number(maxPrice).toLocaleString('nb-NO')} kr`, onRemove: () => removeFilter('maxPrice') },
    listingType === 'sale' && { key: 'listingType', label: 'Til salgs', onRemove: () => removeFilter('listingType') },
    listingType === 'rent' && { key: 'listingType', label: 'Til leie',  onRemove: () => removeFilter('listingType') },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[]

  // Page heading: list selected category labels or "Alle maskiner"
  const headingLabel = categories.length > 0
    ? categories.map(c => CATEGORIES[c]?.label ?? c).join(', ')
    : 'Alle maskiner'

  return (
    <div className="container-main" style={{ padding: '32px 24px 80px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 28,
          color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 4,
        }}>
          {headingLabel}
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: 13 }}>
          {loading
            ? 'Søker...'
            : `Viser ${formatNumber(listings.length)} maskin${listings.length !== 1 ? 'er' : ''}`}
        </p>
      </div>

      {/* Search bar row */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: activeChips.length > 0 ? 12 : 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk etter maskin, merke, modell..."
            className="input-base"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0 20px', height: 46 }}>Søk</button>

        {/* Mobile filter button with badge */}
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="btn-secondary show-filter-btn"
          style={{ padding: '0 14px', height: 46, position: 'relative', flexShrink: 0 }}
        >
          <SlidersHorizontal size={15} />
          Filtrer
          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute', top: -7, right: -7,
              background: 'var(--gold)', color: '#0d0c0a',
              borderRadius: '50%', width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, fontFamily: 'Barlow Condensed',
              border: '2px solid var(--bg)',
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'Barlow Condensed', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Aktive filtre:</span>
          {activeChips.map(chip => (
            <div key={chip.key} className="tag tag-gold" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
              {chip.label}
              <button
                onClick={chip.onRemove}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold2)', padding: 0, display: 'flex' }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <button
            onClick={() => router.push('/sok')}
            style={{ fontSize: 11, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Nullstill alle
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Desktop sidebar */}
        <div className="filters-sidebar">
          <ListingFilters />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Sort + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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

          {/* Results */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="results-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card shimmer" style={{ height: 280 }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 24px',
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4,
            }}>
              <Filter size={32} style={{ color: 'var(--t3)', marginBottom: 16 }} />
              <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20, color: 'var(--t1)', marginBottom: 8 }}>
                Ingen annonser funnet
              </p>
              <p style={{ color: 'var(--t3)', fontSize: 14, marginBottom: 20 }}>
                Prøv å justere filtrene eller søketeksten
              </p>
              <button onClick={() => router.push('/sok')} className="btn-secondary" style={{ fontSize: 13 }}>
                Nullstill filtre
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr',
                gap: viewMode === 'grid' ? 16 : 12,
              }}
              className="results-grid"
            >
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

      {/* Mobile bottom-sheet drawer */}
      {showMobileFilters && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
            onClick={() => setShowMobileFilters(false)}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
            background: 'var(--bg2)',
            borderRadius: '16px 16px 0 0',
            maxHeight: '88vh',
            overflowY: 'auto',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          }}>
            {/* Drag handle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 0', position: 'sticky', top: 0, background: 'var(--bg2)', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--bg5)', marginBottom: 10 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 20px 10px' }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: 'var(--t1)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Filtrer maskiner</span>
                <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', padding: 4 }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <ListingFilters
              onClose={() => setShowMobileFilters(false)}
              resultCount={listings.length}
            />
          </div>
        </>
      )}

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
