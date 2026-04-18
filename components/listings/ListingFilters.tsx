'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES, WEIGHT_CLASSES, NORWEGIAN_COUNTIES, POPULAR_BRANDS, formatNumber } from '@/lib/utils/format'

export default function ListingFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const [category, setCategory] = useState(params.get('category') || '')
  const [brand, setBrand] = useState(params.get('brand') || '')
  const [minYear, setMinYear] = useState(params.get('minYear') || '')
  const [maxYear, setMaxYear] = useState(params.get('maxYear') || '')
  const [maxHours, setMaxHours] = useState(params.get('maxHours') || '')
  const [weightClass, setWeightClass] = useState(params.get('weightClass') || '')
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '')
  const [location, setLocation] = useState(params.get('location') || '')

  const apply = () => {
    const p = new URLSearchParams()
    const q = params.get('q')
    if (q) p.set('q', q)
    if (category) p.set('category', category)
    if (brand) p.set('brand', brand)
    if (minYear) p.set('minYear', minYear)
    if (maxYear) p.set('maxYear', maxYear)
    if (maxHours) p.set('maxHours', maxHours)
    if (weightClass) p.set('weightClass', weightClass)
    if (minPrice) p.set('minPrice', minPrice)
    if (maxPrice) p.set('maxPrice', maxPrice)
    if (location) p.set('location', location)
    router.push(`/sok?${p.toString()}`)
  }

  const reset = () => {
    setCategory(''); setBrand(''); setMinYear(''); setMaxYear('')
    setMaxHours(''); setWeightClass(''); setMinPrice(''); setMaxPrice(''); setLocation('')
    router.push('/sok')
  }

  const hasFilters = category || brand || minYear || maxYear || maxHours || weightClass || minPrice || maxPrice || location

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: 20,
      height: 'fit-content',
      position: 'sticky', top: 80,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--gold)' }} />
          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--t1)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Filtre</span>
        </div>
        {hasFilters && (
          <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <X size={10} /> Nullstill
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Category */}
        <div>
          <label className="label-sm" style={{ display: 'block', marginBottom: 8 }}>Kategori</label>
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer' }}>
              <input
                type="radio"
                name="category"
                value={key}
                checked={category === key}
                onChange={() => setCategory(key === category ? '' : key)}
                style={{ accentColor: 'var(--gold)' }}
              />
              <span style={{ fontSize: 13, color: category === key ? 'var(--t1)' : 'var(--t2)' }}>{label}</span>
            </label>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Location */}
        <div>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Område</label>
          <select value={location} onChange={e => setLocation(e.target.value)} className="input-base" style={{ fontSize: 13, padding: '8px 10px', cursor: 'pointer' }}>
            <option value="">Alle områder</option>
            {NORWEGIAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Merke</label>
          <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Søk merke..." list="brands-filter" className="input-base" style={{ fontSize: 13, padding: '8px 10px' }} />
          <datalist id="brands-filter">{POPULAR_BRANDS.map(b => <option key={b} value={b} />)}</datalist>
        </div>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Year range */}
        <div>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Årsmodell</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" value={minYear} onChange={e => setMinYear(e.target.value)} placeholder="Fra" min="1970" max="2026" className="input-base" style={{ fontSize: 13, padding: '8px 10px' }} />
            <input type="number" value={maxYear} onChange={e => setMaxYear(e.target.value)} placeholder="Til" min="1970" max="2026" className="input-base" style={{ fontSize: 13, padding: '8px 10px' }} />
          </div>
        </div>

        {/* Max hours */}
        <div>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Maks driftstimer</label>
          <input type="number" value={maxHours} onChange={e => setMaxHours(e.target.value)} placeholder="f.eks. 5000" min="0" className="input-base" style={{ fontSize: 13, padding: '8px 10px' }} />
        </div>

        {/* Weight class */}
        <div>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Vektklasse</label>
          <select value={weightClass} onChange={e => setWeightClass(e.target.value)} className="input-base" style={{ fontSize: 13, padding: '8px 10px', cursor: 'pointer' }}>
            <option value="">Alle</option>
            {WEIGHT_CLASSES.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Price range */}
        <div>
          <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Prisintervall (NOK)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" min="0" className="input-base" style={{ fontSize: 13, padding: '8px 10px' }} />
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Maks" min="0" className="input-base" style={{ fontSize: 13, padding: '8px 10px' }} />
          </div>
        </div>

        <button onClick={apply} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 42, fontSize: 12 }}>
          Bruk filtre
        </button>
      </div>
    </aside>
  )
}
