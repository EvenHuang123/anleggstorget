'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SortDesc, Grid3X3, LayoutList, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import ListingFilters from '@/components/listings/ListingFilters'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_TREE, treeKeysToDbValues, formatNumber } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Nyeste først' },
  { value: 'price_asc',  label: 'Laveste pris' },
  { value: 'price_desc', label: 'Høyeste pris' },
]

export default function SokContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [listings, setListings]           = useState<Listing[]>([])
  const [loading, setLoading]             = useState(true)
  const [viewMode, setViewMode]           = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchInput, setSearchInput]     = useState(searchParams.get('q') || '')

  // Read ALL filter params from URL
  const q            = searchParams.get('q')           || ''
  const categoryParam= searchParams.get('category')    || ''
  const subcategory  = searchParams.get('subcategory') || ''
  const location     = searchParams.get('location')    || ''
  const listingType  = searchParams.get('listingType') || ''
  const vatMode      = searchParams.get('vatMode')     || 'ex'
  const minPrice     = searchParams.get('minPrice')    || ''
  const maxPrice     = searchParams.get('maxPrice')    || ''
  const sort         = searchParams.get('sort')        || 'newest'

  const treeKeys = categoryParam.split(',').filter(Boolean)

  // Count active filter groups for the badge
  const activeFilterCount = [
    treeKeys.length > 0,
    !!subcategory,
    !!location,
    !!listingType,
    !!(minPrice || maxPrice),
  ].filter(Boolean).length

  // Instant URL update (used by search bar + sort)
  const setParam = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    router.replace(`/sok?${p.toString()}`, { scroll: false })
  }, [searchParams, router])

  // ── Fetch listings ─────────────────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let qb = (supabase as any)
        .from('listings')
        .select('*, profiles(company_name, verified, org_number), favorites_count:favorites(count)')
        .eq('status', 'active')

      // Category: resolve tree keys → DB enum values
      const dbCats = treeKeysToDbValues(treeKeys)
      if (dbCats.length === 1)      qb = qb.eq('category', dbCats[0])
      else if (dbCats.length > 1)   qb = qb.in('category', dbCats)

      // Subcategory
      if (subcategory) qb = qb.eq('subcategory', subcategory)

      // Text search
      if (q) qb = qb.ilike('title', `%${q}%`)

      // Location
      if (location) qb = qb.ilike('location', `%${location}%`)

      // Type annonse
      if (listingType === 'sale') qb = qb.eq('listing_type', 'sale')
      else if (listingType === 'rent') qb = qb.eq('listing_type', 'rent')

      // Price filter — uses price_ex_vat or price_inc_vat based on vatMode
      const priceCol = vatMode === 'inc' ? 'price_inc_vat' : 'price_ex_vat'
      if (minPrice) qb = qb.gte(priceCol, parseInt(minPrice))
      if (maxPrice) qb = qb.lte(priceCol, parseInt(maxPrice))

      // Sort
      if (sort === 'newest')     qb = qb.order('created_at',  { ascending: false })
      else if (sort === 'price_asc')  qb = qb.order('price_ex_vat', { ascending: true,  nullsFirst: false })
      else if (sort === 'price_desc') qb = qb.order('price_ex_vat', { ascending: false, nullsFirst: false })

      const { data } = await qb.limit(48)
      setListings((data as Listing[]) || [])
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [q, categoryParam, subcategory, location, listingType, vatMode, minPrice, maxPrice, sort])

  useEffect(() => { fetchListings() }, [fetchListings])

  // Keep search input in sync with URL
  useEffect(() => { setSearchInput(searchParams.get('q') || '') }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParam({ q: searchInput })
  }

  // Remove one filter chip
  const removeChip = (key: string, value?: string) => {
    if (key === 'category' && value) {
      // Remove one tree key from comma-separated list
      const next = treeKeys.filter(k => k !== value)
      const p = new URLSearchParams(searchParams.toString())
      if (next.length > 0) p.set('category', next.join(','))
      else p.delete('category')
      p.delete('subcategory')
      router.replace(`/sok?${p.toString()}`, { scroll: false })
    } else {
      setParam({ [key]: '' })
    }
  }

  // Build active filter chips
  const chips = [
    ...treeKeys.map(k => ({
      key: 'category', value: k,
      label: CATEGORY_TREE[k]?.label ?? k,
    })),
    subcategory && { key: 'subcategory', value: subcategory,
      label: (() => {
        for (const node of Object.values(CATEGORY_TREE)) {
          if (node.subcategories[subcategory]) return node.subcategories[subcategory]
        }
        return subcategory
      })(),
    },
    location && { key: 'location', value: location, label: location },
    listingType === 'sale' && { key: 'listingType', value: 'sale', label: 'Til salgs' },
    listingType === 'rent' && { key: 'listingType', value: 'rent', label: 'Til leie' },
    minPrice && { key: 'minPrice', value: minPrice, label: `Fra ${Number(minPrice).toLocaleString('nb-NO')} kr` },
    maxPrice && { key: 'maxPrice', value: maxPrice, label: `Til ${Number(maxPrice).toLocaleString('nb-NO')} kr` },
  ].filter(Boolean) as { key: string; value: string; label: string }[]

  // Page heading
  const headingLabel = treeKeys.length > 0
    ? treeKeys.map(k => CATEGORY_TREE[k]?.label ?? k).join(', ')
    : 'Alle maskiner'

  return (
    <div className="container-main" style={{ padding: '28px 24px 80px' }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 26, color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 2 }}>
          {headingLabel}
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: 13 }}>
          {loading ? 'Søker...' : `Viser ${formatNumber(listings.length)} maskin${listings.length !== 1 ? 'er' : ''}`}
        </p>
      </div>

      {/* ── Search row ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: chips.length > 0 ? 10 : 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
          <input
            type="text" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Søk etter maskin, merke, modell..."
            className="input-base"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0 18px', height: 46, flexShrink: 0 }}>Søk</button>

        {/* Mobile filter toggle with count badge */}
        <button
          type="button"
          onClick={() => setShowMobileFilters(f => !f)}
          className="btn-secondary show-filter-btn"
          style={{ padding: '0 14px', height: 46, position: 'relative', flexShrink: 0, gap: 6 }}
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

      {/* ── Active chips ───────────────────────────────────────────────────── */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
          {chips.map((chip, i) => (
            <div key={i} className="tag tag-gold" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
              {chip.label}
              <button onClick={() => removeChip(chip.key, chip.value)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold2)', padding: 0, display: 'flex' }}>
                <X size={10} />
              </button>
            </div>
          ))}
          <button
            onClick={() => router.replace('/sok', { scroll: false })}
            style={{ fontSize: 11, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Nullstill alle
          </button>
        </div>
      )}

      {/* ── Mobile collapsible filter panel ─────────────────────────────────── */}
      <div className="show-filter-btn" style={{ marginBottom: showMobileFilters ? 0 : 0 }}>
        {showMobileFilters && (
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 4, marginBottom: 16, overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13, color: 'var(--t1)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Filtrer maskiner
              </span>
              <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)' }}>
                <X size={16} />
              </button>
            </div>
            <ListingFilters
              onClose={() => setShowMobileFilters(false)}
              resultCount={listings.length}
            />
          </div>
        )}
      </div>

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Desktop sidebar */}
        <div className="filters-sidebar">
          <ListingFilters />
        </div>

        {/* Results column */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Sort + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SortDesc size={13} style={{ color: 'var(--t3)' }} />
              <div style={{ position: 'relative' }}>
                <select
                  value={sort}
                  onChange={e => setParam({ sort: e.target.value })}
                  style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--t1)',
                    fontFamily: 'Barlow', fontSize: 13, padding: '6px 28px 6px 10px',
                    borderRadius: 3, cursor: 'pointer', outline: 'none', appearance: 'none',
                  }}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['grid', 'list'] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  background: viewMode === mode ? 'var(--bg4)' : 'transparent',
                  border: `1px solid ${viewMode === mode ? 'var(--border2)' : 'transparent'}`,
                  borderRadius: 3, padding: '6px 8px',
                  color: viewMode === mode ? 'var(--t1)' : 'var(--t3)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {mode === 'grid' ? <Grid3X3 size={14} /> : <LayoutList size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Results grid */}
          {loading ? (
            <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card shimmer" style={{ height: 280 }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4 }}>
              <SlidersHorizontal size={32} style={{ color: 'var(--t3)', marginBottom: 16 }} />
              <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20, color: 'var(--t1)', marginBottom: 8 }}>
                Ingen maskiner funnet
              </p>
              <p style={{ color: 'var(--t3)', fontSize: 14, marginBottom: 20 }}>
                Prøv å justere filtrene
              </p>
              <button onClick={() => router.replace('/sok', { scroll: false })} className="btn-secondary" style={{ fontSize: 13 }}>
                Nullstill filtre
              </button>
            </div>
          ) : (
            <div
              className="results-grid"
              style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(3,1fr)' : '1fr', gap: viewMode === 'grid' ? 14 : 10 }}
            >
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
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
