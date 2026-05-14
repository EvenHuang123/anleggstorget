'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { CATEGORIES, NORWEGIAN_COUNTIES, POPULAR_BRANDS } from '@/lib/utils/format'

const YEAR_PRESETS = [
  { label: '2020–i dag', min: '2020', max: '' },
  { label: '2015–2019', min: '2015', max: '2019' },
  { label: '2010–2014', min: '2010', max: '2014' },
  { label: 'Før 2010',  min: '',     max: '2009' },
]

const HOURS_PRESETS = [
  { label: 'Under 1 000',  min: '0',     max: '1000'  },
  { label: '1 000–3 000',  min: '1000',  max: '3000'  },
  { label: '3 000–5 000',  min: '3000',  max: '5000'  },
  { label: '5 000–10 000', min: '5000',  max: '10000' },
  { label: '10 000+',      min: '10000', max: ''      },
]

const PRICE_PRESETS = [
  { label: 'Under 500k', min: '',        max: '500000'  },
  { label: '500k–1M',    min: '500000',  max: '1000000' },
  { label: '1M–2M',      min: '1000000', max: '2000000' },
  { label: '2M–5M',      min: '2000000', max: '5000000' },
  { label: 'Over 5M',    min: '5000000', max: ''        },
]

const WEIGHT_OPTIONS = [
  { label: 'Under 5 tonn',  value: 'Under 5 tonn' },
  { label: '5–10 tonn',     value: '5–10 tonn'    },
  { label: '10–20 tonn',    value: '10–20 tonn'   },
  { label: '20–40 tonn',    value: '20–40 tonn'   },
  { label: 'Over 40 tonn',  value: 'Over 40 tonn' },
]

const QUICK_BRANDS = ['Volvo', 'CAT', 'Komatsu', 'Hitachi', 'JCB', 'John Deere', 'Liebherr', 'Doosan']

function Section({
  title, isOpen, onToggle, active, children,
}: {
  title: string; isOpen: boolean; onToggle: () => void; active?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 0', cursor: 'pointer',
        }}
      >
        <span style={{
          fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 11,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: active ? 'var(--gold)' : 'var(--t2)',
        }}>
          {title}{active ? ' ●' : ''}
        </span>
        <ChevronDown
          size={12}
          style={{ color: 'var(--t3)', transition: 'transform 0.15s', transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {isOpen && <div style={{ paddingBottom: 8 }}>{children}</div>}
    </div>
  )
}

function Presets({
  presets, minVal, maxVal, onSelect,
}: {
  presets: { label: string; min: string; max: string }[]
  minVal: string; maxVal: string
  onSelect: (min: string, max: string) => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
      {presets.map(p => {
        const active = minVal === p.min && maxVal === p.max
        return (
          <button
            key={p.label}
            onClick={() => onSelect(active ? '' : p.min, active ? '' : p.max)}
            style={{
              background: active ? 'var(--gold3)' : 'var(--bg3)',
              border: `1px solid ${active ? 'rgba(200,149,58,0.5)' : 'var(--border)'}`,
              borderRadius: 3, padding: '5px 7px',
              fontSize: 11, color: active ? 'var(--gold)' : 'var(--t2)',
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Barlow Condensed', fontWeight: 600,
              transition: 'all 0.1s', lineHeight: 1.3,
            }}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

const divider = <div style={{ height: 1, background: 'var(--border)' }} />

export default function ListingFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const [category,   setCategory]   = useState(params.get('category')   || '')
  const [brand,      setBrand]      = useState(params.get('brand')      || '')
  const [minYear,    setMinYear]    = useState(params.get('minYear')    || '')
  const [maxYear,    setMaxYear]    = useState(params.get('maxYear')    || '')
  const [minHours,   setMinHours]   = useState(params.get('minHours')   || '')
  const [maxHours,   setMaxHours]   = useState(params.get('maxHours')   || '')
  const [weightClass,setWeightClass]= useState(params.get('weightClass')|| '')
  const [minPrice,   setMinPrice]   = useState(params.get('minPrice')   || '')
  const [maxPrice,   setMaxPrice]   = useState(params.get('maxPrice')   || '')
  const [location,   setLocation]   = useState(params.get('location')   || '')
  const [priceType,  setPriceType]  = useState(params.get('priceType')  || '')

  const [open, setOpen] = useState({
    kategori: true,
    omrade: true,
    merke: false,
    aar: false,
    timer: false,
    vekt: false,
    pris: true,
  })
  const toggle = (k: keyof typeof open) => setOpen(o => ({ ...o, [k]: !o[k] }))

  const apply = () => {
    const p = new URLSearchParams()
    const q = params.get('q')
    if (q)          p.set('q', q)
    if (category)   p.set('category', category)
    if (brand)      p.set('brand', brand)
    if (minYear)    p.set('minYear', minYear)
    if (maxYear)    p.set('maxYear', maxYear)
    if (minHours)   p.set('minHours', minHours)
    if (maxHours)   p.set('maxHours', maxHours)
    if (weightClass)p.set('weightClass', weightClass)
    if (minPrice)   p.set('minPrice', minPrice)
    if (maxPrice)   p.set('maxPrice', maxPrice)
    if (location)   p.set('location', location)
    if (priceType)  p.set('priceType', priceType)
    router.push(`/sok?${p.toString()}`)
  }

  const reset = () => {
    setCategory(''); setBrand(''); setMinYear(''); setMaxYear('')
    setMinHours(''); setMaxHours(''); setWeightClass('')
    setMinPrice(''); setMaxPrice(''); setLocation(''); setPriceType('')
    router.push('/sok')
  }

  const hasFilters = !!(category || brand || minYear || maxYear || minHours || maxHours ||
    weightClass || minPrice || maxPrice || location || priceType)

  const inputStyle: React.CSSProperties = { fontSize: 12, padding: '7px 9px', width: '100%' }
  const halfInput: React.CSSProperties = { fontSize: 11, padding: '6px 8px', width: '100%' }

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '16px 18px',
      height: 'fit-content',
      position: 'sticky', top: 100,
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <SlidersHorizontal size={13} style={{ color: 'var(--gold)' }} />
          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--t1)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Filtre
          </span>
        </div>
        {hasFilters && (
          <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <X size={10} /> Nullstill
          </button>
        )}
      </div>

      {/* Kategori */}
      <Section title="Kategori" isOpen={open.kategori} onToggle={() => toggle('kategori')} active={!!category}>
        {Object.entries(CATEGORIES).map(([key, { label }]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', cursor: 'pointer' }}>
            <input
              type="radio" name="category"
              checked={category === key}
              onChange={() => setCategory(category === key ? '' : key)}
              style={{ accentColor: 'var(--gold)', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: category === key ? 'var(--t1)' : 'var(--t2)' }}>{label}</span>
          </label>
        ))}
      </Section>

      {divider}

      {/* Område */}
      <Section title="Område" isOpen={open.omrade} onToggle={() => toggle('omrade')} active={!!location}>
        <select
          value={location} onChange={e => setLocation(e.target.value)}
          className="input-base" style={{ ...inputStyle, cursor: 'pointer', marginTop: 4 }}
        >
          <option value="">Hele Norge</option>
          {NORWEGIAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Section>

      {divider}

      {/* Merke */}
      <Section title="Merke" isOpen={open.merke} onToggle={() => toggle('merke')} active={!!brand}>
        <div style={{ marginTop: 4 }}>
          <input
            type="text" value={brand} onChange={e => setBrand(e.target.value)}
            placeholder="Søk merke..." list="brands-filter"
            className="input-base" style={inputStyle}
          />
          <datalist id="brands-filter">{POPULAR_BRANDS.map(b => <option key={b} value={b} />)}</datalist>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 7 }}>
            {QUICK_BRANDS.map(b => (
              <button
                key={b}
                onClick={() => setBrand(brand === b ? '' : b)}
                style={{
                  background: brand === b ? 'var(--gold3)' : 'var(--bg3)',
                  border: `1px solid ${brand === b ? 'rgba(200,149,58,0.5)' : 'var(--border)'}`,
                  borderRadius: 3, padding: '3px 7px',
                  fontSize: 10, color: brand === b ? 'var(--gold)' : 'var(--t3)',
                  cursor: 'pointer', fontFamily: 'Barlow Condensed', fontWeight: 600,
                  transition: 'all 0.1s',
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {divider}

      {/* Årsmodell */}
      <Section title="Årsmodell" isOpen={open.aar} onToggle={() => toggle('aar')} active={!!(minYear || maxYear)}>
        <div style={{ marginTop: 6 }}>
          <Presets
            presets={YEAR_PRESETS} minVal={minYear} maxVal={maxYear}
            onSelect={(min, max) => { setMinYear(min); setMaxYear(max) }}
          />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={minYear} onChange={e => setMinYear(e.target.value)} placeholder="Fra" min="1970" max="2026" className="input-base" style={halfInput} />
            <span style={{ color: 'var(--t3)', fontSize: 11, flexShrink: 0 }}>–</span>
            <input type="number" value={maxYear} onChange={e => setMaxYear(e.target.value)} placeholder="Til" min="1970" max="2026" className="input-base" style={halfInput} />
          </div>
        </div>
      </Section>

      {divider}

      {/* Driftstimer */}
      <Section title="Driftstimer" isOpen={open.timer} onToggle={() => toggle('timer')} active={!!(minHours || maxHours)}>
        <div style={{ marginTop: 6 }}>
          <Presets
            presets={HOURS_PRESETS} minVal={minHours} maxVal={maxHours}
            onSelect={(min, max) => { setMinHours(min); setMaxHours(max) }}
          />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" value={minHours} onChange={e => setMinHours(e.target.value)} placeholder="Min" min="0" className="input-base" style={halfInput} />
            <span style={{ color: 'var(--t3)', fontSize: 11, flexShrink: 0 }}>–</span>
            <input type="number" value={maxHours} onChange={e => setMaxHours(e.target.value)} placeholder="Maks" min="0" className="input-base" style={halfInput} />
          </div>
        </div>
      </Section>

      {divider}

      {/* Vektklasse */}
      <Section title="Vekt / størrelse" isOpen={open.vekt} onToggle={() => toggle('vekt')} active={!!weightClass}>
        <div style={{ marginTop: 4 }}>
          {WEIGHT_OPTIONS.map(w => (
            <label key={w.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', cursor: 'pointer' }}>
              <input
                type="radio" name="weight"
                checked={weightClass === w.value}
                onChange={() => setWeightClass(weightClass === w.value ? '' : w.value)}
                style={{ accentColor: 'var(--gold)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: weightClass === w.value ? 'var(--t1)' : 'var(--t2)' }}>{w.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {divider}

      {/* Pris */}
      <Section title="Pris (NOK)" isOpen={open.pris} onToggle={() => toggle('pris')} active={!!(minPrice || maxPrice || priceType)}>
        <div style={{ marginTop: 6 }}>
          <Presets
            presets={PRICE_PRESETS} minVal={minPrice} maxVal={maxPrice}
            onSelect={(min, max) => { setMinPrice(min); setMaxPrice(max) }}
          />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min kr" min="0" className="input-base" style={halfInput} />
            <span style={{ color: 'var(--t3)', fontSize: 11, flexShrink: 0 }}>–</span>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Maks kr" min="0" className="input-base" style={halfInput} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 0' }}>
            <input
              type="checkbox"
              checked={priceType === 'negotiable'}
              onChange={e => setPriceType(e.target.checked ? 'negotiable' : '')}
              style={{ accentColor: 'var(--gold)', flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: 'var(--t2)' }}>Kun forhandlingsbar</span>
          </label>
        </div>
      </Section>

      <div style={{ marginTop: 14 }}>
        <button onClick={apply} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 40, fontSize: 12 }}>
          Bruk filtre
        </button>
      </div>
    </aside>
  )
}
