'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES } from '@/lib/utils/format'

const QUICK_FILTERS = [
  { label: 'Gravemaskiner', value: 'gravemaskin' },
  { label: 'Traktorer', value: 'traktor' },
  { label: 'Hjullastere', value: 'hjullaster' },
  { label: 'Dumpere', value: 'dumper' },
  { label: 'Kranbiler', value: 'kranbil' },
  { label: 'Skogsutstyr', value: 'skogsutstyr' },
]

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [location, setLocation] = useState('')
  const [catOpen, setCatOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (location) params.set('location', location)
    router.push(`/sok?${params.toString()}`)
  }

  const handleQuickFilter = (cat: string) => {
    router.push(`/sok?category=${cat}`)
  }

  return (
    <section style={{ padding: '64px 0', background: 'var(--bg)', overflowX: 'clip' }}>
      <div className="container-main">
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="section-label" style={{ marginBottom: 10 }}>Søk i markedet</p>
          <h2 className="section-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 14 }}>
            Finn din neste maskin
          </h2>
          <p style={{ color: 'var(--t2)', fontSize: 15 }}>
            Over 1 200 maskiner fra verifiserte norske bedrifter
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: 4,
          padding: 4,
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto auto',
          gap: 4,
          marginBottom: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }} className="search-form">
          {/* Text search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--t3)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Søk etter maskin, merke, modell..."
              className="input-base"
              style={{ paddingLeft: 40, border: 'none', background: 'transparent', height: 52 }}
            />
          </div>

          {/* Category */}
          <div style={{ position: 'relative', minWidth: 170 }}>
            <button
              type="button"
              onClick={() => setCatOpen(!catOpen)}
              style={{
                width: '100%', height: 52,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 3, padding: '0 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                color: category ? 'var(--t1)' : 'var(--t3)',
                fontFamily: 'Barlow', fontSize: 14, cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <span>{category ? CATEGORIES[category]?.label : 'Alle kategorier'}</span>
              <ChevronDown size={14} style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
            </button>
            {catOpen && (
              <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 50 }}>
                <div className="dropdown-item" onClick={() => { setCategory(''); setCatOpen(false) }}>
                  Alle kategorier
                </div>
                {Object.entries(CATEGORIES).map(([key, { label }]) => (
                  <div
                    key={key}
                    className={`dropdown-item ${category === key ? 'selected' : ''}`}
                    onClick={() => { setCategory(key); setCatOpen(false) }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Max price */}
          <input
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Maks pris (NOK)"
            className="input-base"
            style={{ width: 180, height: 52, background: 'var(--bg3)' }}
          />

          {/* Location */}
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Område"
            className="input-base"
            style={{ width: 140, height: 52, background: 'var(--bg3)' }}
          />

          {/* Search button */}
          <button type="submit" className="btn-primary" style={{ height: 52, padding: '0 28px', whiteSpace: 'nowrap', borderRadius: 2 }}>
            Søk
            <Search size={15} />
          </button>
        </form>

        {/* Quick filters */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <SlidersHorizontal size={13} style={{ color: 'var(--t3)' }} />
          <span className="label-sm" style={{ marginRight: 4 }}>Hurtigfilter:</span>
          {QUICK_FILTERS.map(filter => (
            <button
              key={filter.value}
              onClick={() => handleQuickFilter(filter.value)}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--t2)', borderRadius: 20, padding: '5px 14px',
                fontFamily: 'Barlow', fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s ease', whiteSpace: 'nowrap',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'var(--gold)'
                e.currentTarget.style.color = 'var(--gold)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--t2)'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .search-form { grid-template-columns: 1fr auto auto auto auto !important; }
        @media (max-width: 900px) {
          .search-form { grid-template-columns: 1fr !important; }
          .search-form input, .search-form button, .search-form div { width: 100% !important; }
        }
      `}</style>
    </section>
  )
}
