'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, SortDesc, Grid3X3, LayoutList, X, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
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

const PAGE_SIZE = 24

// ── Pagination component ───────────────────────────────────────────────────
function Pagination({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null

  // Build page list: 1 ... X-1 X X+1 ... N
  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  const btn = (content: React.ReactNode, onClick: () => void, active = false, disabled = false) => (
    <button
      key={String(content)}
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 38, height: 38, padding: '0 8px', borderRadius: 3,
        border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
        background: active ? 'var(--gold)' : 'var(--bg3)',
        color: active ? '#0d0c0a' : disabled ? 'var(--t3)' : 'var(--t2)',
        fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 14,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        transition: 'all 0.1s',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {content}
    </button>
  )

  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
      {btn(<><ChevronLeft size={14} /> Forrige</>, () => onPage(page - 1), false, page === 1)}
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`ellipsis-${i}`} style={{ color: 'var(--t3)', padding: '0 4px', fontSize: 14 }}>…</span>
          : btn(p, () => onPage(p as number), p === page)
      )}
      {btn(<>Neste <ChevronRight size={14} /></>, () => onPage(page + 1), false, page === totalPages)}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function SokContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const [listings, setListings]           = useState<Listing[]>([])
  const [totalCount, setTotalCount]       = useState(0)
  const [loading, setLoading]             = useState(true)
  const [viewMode, setViewMode]           = useState<'grid' | 'list'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchInput, setSearchInput]     = useState(searchParams.get('q') || '')

  // Read ALL filter + pagination params from URL
  const q            = searchParams.get('q')           || ''
  const categoryParam= searchParams.get('category')    || ''
  const subcategory  = searchParams.get('subcategory') || ''
  const location     = searchParams.get('location')    || ''
  const listingType  = searchParams.get('listingType') || ''
  const minPrice     = searchParams.get('minPrice')    || ''
  const maxPrice     = searchParams.get('maxPrice')    || ''
  const sort         = searchParams.get('sort')        || 'newest'
  const page         = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const treeKeys = categoryParam.split(',').filter(Boolean)

  const activeFilterCount = [
    treeKeys.length > 0, !!subcategory, !!location, !!listingType, !!(minPrice || maxPrice),
  ].filter(Boolean).length

  // Filter changes — always read window.location.search so we never use a
  // stale React-state snapshot (useCallback with searchParams dep can silently
  // navigate to the same URL and be deduped by the Next.js router).
  const setParam = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(window.location.search)
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    p.delete('page')
    router.replace(`/sok?${p.toString()}`, { scroll: false })
  }, [router])

  // Page navigation — preserves all other params
  const goToPage = useCallback((newPage: number) => {
    const p = new URLSearchParams(window.location.search)
    if (newPage <= 1) p.delete('page'); else p.set('page', String(newPage))
    router.replace(`/sok?${p.toString()}`, { scroll: true })
  }, [router])

  // ── Fetch listings with count ────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let qb = (supabase as any)
        .from('listings')
        .select('*, profiles(company_name, verified, org_number), favorites_count:favorites(count)', { count: 'exact' })
        .eq('status', 'active')

      const dbCats = treeKeysToDbValues(treeKeys)
      if (dbCats.length === 1)    qb = qb.eq('category', dbCats[0])
      else if (dbCats.length > 1) qb = qb.in('category', dbCats)

      if (subcategory) qb = qb.eq('subcategory', subcategory)
      if (q)           qb = qb.ilike('title', `%${q}%`)
      if (location)    qb = qb.ilike('location', `%${location}%`)
      if (listingType === 'sale') qb = qb.eq('listing_type', 'sale')
      else if (listingType === 'rent') qb = qb.eq('listing_type', 'rent')
      if (minPrice) qb = qb.gte('price_ex_vat', parseInt(minPrice))
      if (maxPrice) qb = qb.lte('price_ex_vat', parseInt(maxPrice))

      if (sort === 'newest')          qb = qb.order('created_at',  { ascending: false })
      else if (sort === 'price_asc')  qb = qb.order('price_ex_vat', { ascending: true,  nullsFirst: false })
      else if (sort === 'price_desc') qb = qb.order('price_ex_vat', { ascending: false, nullsFirst: false })

      const from = (page - 1) * PAGE_SIZE
      const to   = from + PAGE_SIZE - 1
      const { data, count } = await qb.range(from, to)

      setListings((data as Listing[]) || [])
      setTotalCount(count ?? 0)
    } catch {
      setListings([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [q, categoryParam, subcategory, location, listingType, minPrice, maxPrice, sort, page])

  useEffect(() => { fetchListings() }, [fetchListings])
  useEffect(() => { setSearchInput(searchParams.get('q') || '') }, [pathname, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    setParam({ q: trimmed })
  }

  const clearSearch = () => {
    setSearchInput('')
    const p = new URLSearchParams(searchParams.toString())
    p.delete('q')
    p.delete('page')
    router.replace(`/sok?${p.toString()}`, { scroll: false })
  }

  const removeChip = (key: string, value?: string) => {
    if (key === 'category' && value) {
      const next = treeKeys.filter(k => k !== value)
      const p = new URLSearchParams(searchParams.toString())
      if (next.length > 0) p.set('category', next.join(','))
      else p.delete('category')
      p.delete('subcategory')
      p.delete('page')
      router.replace(`/sok?${p.toString()}`, { scroll: false })
    } else {
      setParam({ [key]: '' })
    }
  }

  const chips = [
    ...treeKeys.map(k => ({ key: 'category', value: k, label: CATEGORY_TREE[k]?.label ?? k })),
    subcategory && { key: 'subcategory', value: subcategory, label: (() => {
      for (const node of Object.values(CATEGORY_TREE)) {
        if (node.subcategories[subcategory]) return node.subcategories[subcategory]
      }
      return subcategory
    })() },
    location    && { key: 'location',    value: location,    label: location },
    listingType === 'sale' && { key: 'listingType', value: 'sale', label: 'Til salgs' },
    listingType === 'rent' && { key: 'listingType', value: 'rent', label: 'Til leie' },
    minPrice    && { key: 'minPrice',    value: minPrice,    label: `Fra ${Number(minPrice).toLocaleString('nb-NO')} kr` },
    maxPrice    && { key: 'maxPrice',    value: maxPrice,    label: `Til ${Number(maxPrice).toLocaleString('nb-NO')} kr` },
  ].filter(Boolean) as { key: string; value: string; label: string }[]

  const headingLabel = treeKeys.length > 0
    ? treeKeys.map(k => CATEGORY_TREE[k]?.label ?? k).join(', ')
    : 'Alle maskiner'

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const fromItem   = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const toItem     = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="container-main" style={{ padding: '28px 24px 80px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 26, color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 2 }}>
          {headingLabel}
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: 13 }}>
          {loading
            ? 'Søker...'
            : totalCount === 0
              ? 'Ingen maskiner funnet'
              : `Viser ${formatNumber(fromItem)}–${formatNumber(toItem)} av ${formatNumber(totalCount)} maskiner${totalPages > 1 ? ` — side ${page} av ${totalPages}` : ''}`}
        </p>
      </div>

      {/* Search row */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: chips.length > 0 ? 10 : 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
          <input
            type="text" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Søk etter maskin, merke, modell..."
            className="input-base"
            style={{ paddingLeft: 36, paddingRight: searchInput ? 36 : 12 }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', display: 'flex', padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0 18px', height: 46, flexShrink: 0 }}>Søk</button>
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

      {/* Active chips */}
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

      {/* Mobile collapsible filters */}
      <div className="show-filter-btn">
        {showMobileFilters && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13, color: 'var(--t1)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Filtrer maskiner
              </span>
              <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)' }}>
                <X size={16} />
              </button>
            </div>
            <ListingFilters onClose={() => setShowMobileFilters(false)} resultCount={totalCount} searchParams={searchParams} onFilterChange={setParam} />
          </div>
        )}
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div className="filters-sidebar">
          <ListingFilters searchParams={searchParams} onFilterChange={setParam} />
        </div>

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

          {/* Results */}
          {loading ? (
            <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
            <>
              <div
                className="results-grid"
                style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(3,1fr)' : '1fr', gap: viewMode === 'grid' ? 14 : 10 }}
              >
                {listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}
              </div>

              {/* Pagination */}
              <Pagination page={page} total={totalCount} onPage={goToPage} />
            </>
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
