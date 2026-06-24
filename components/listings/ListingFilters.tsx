'use client'

import { useRouter } from 'next/navigation'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { CATEGORY_TREE } from '@/lib/utils/format'

interface Props {
  onClose?: () => void
  resultCount?: number
  searchParams: ReadonlyURLSearchParams
  onFilterChange: (updates: Record<string, string>) => void
  availableBrands?: string[]
  availableLocations?: string[]
}

// ── helpers ───────────────────────────────────────────────────────────────────

// Brands shown directly (rest hidden behind "Vis alle")
const PRIORITY_BRANDS = ['Volvo', 'Cat', 'Komatsu', 'Hitachi', 'JCB', 'Liebherr', 'Kobelco', 'Doosan', 'Hyundai']
const BRANDS_VISIBLE  = 8

const PRICE_PRESETS = [
  { label: 'Under 500k', min: '',        max: '500000'  },
  { label: '500k–1M',    min: '500000',  max: '1000000' },
  { label: '1M–2M',      min: '1000000', max: '2000000' },
  { label: '2M–5M',      min: '2000000', max: '5000000' },
  { label: 'Over 5M',    min: '5000000', max: ''        },
]

const HOURS_PRESETS = [
  { label: 'Under 2 000 t',  min: '',      max: '2000'  },
  { label: '2 000–5 000 t',  min: '2000',  max: '5000'  },
  { label: '5 000–10 000 t', min: '5000',  max: '10000' },
  { label: 'Over 10 000 t',  min: '10000', max: ''       },
]

const LISTED_WITHIN_OPTIONS = [
  { label: 'Alle',          value: ''   },
  { label: 'Siste 7 dager', value: '7'  },
  { label: 'Siste 30 dager',value: '30' },
]

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
}

function SectionHeader({ label, active, open, onToggle }: {
  label: string; active?: boolean; open: boolean; onToggle: () => void
}) {
  return (
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
        {label}{active ? ' ●' : ''}
      </span>
      <ChevronDown size={12} style={{ color: 'var(--t3)', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
    </button>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ListingFilters({ onClose, resultCount, searchParams, onFilterChange, availableBrands = [], availableLocations = [] }: Props) {
  const router = useRouter()

  // ── Read filter state from URL ────────────────────────────────────────────
  const selectedCats   = (searchParams.get('category')      || '').split(',').filter(Boolean)
  const subcategory    = searchParams.get('subcategory')    || ''
  const location       = searchParams.get('location')       || ''
  const listingType    = searchParams.get('listingType')    || ''
  const selectedBrands = (searchParams.get('brand')         || '').split(',').filter(Boolean)
  const listedWithin   = searchParams.get('listed_within')  || ''
  const hoursMin       = searchParams.get('hours_min')      || ''
  const hoursMax       = searchParams.get('hours_max')      || ''

  // Price + year need local state so typing feels smooth; debounced push to URL
  const [localMin, setLocalMin]     = useState(searchParams.get('minPrice')  || '')
  const [localMax, setLocalMax]     = useState(searchParams.get('maxPrice')  || '')
  const [localYearFrom, setLocalYearFrom] = useState(searchParams.get('year_from') || '')
  const [localYearTo,   setLocalYearTo]   = useState(searchParams.get('year_to')   || '')
  useEffect(() => {
    setLocalMin(searchParams.get('minPrice')  || '')
    setLocalMax(searchParams.get('maxPrice')  || '')
    setLocalYearFrom(searchParams.get('year_from') || '')
    setLocalYearTo(searchParams.get('year_to')     || '')
  }, [searchParams])

  // Collapsible sections — new ones default open so they're discoverable
  const [openSections, setOpenSections] = useState({
    merke:      true,
    kategori:   true,
    aarsmodell: false,
    timer:      false,
    siste:      false,
    type:       true,
    omrade:     true,
    pris:       true,
  })
  const toggleSection = (k: keyof typeof openSections) =>
    setOpenSections(s => ({ ...s, [k]: !s[k] }))

  // "Vis alle merker" toggle
  const [showAllBrands, setShowAllBrands] = useState(false)

  // ── Brand ordering: priority brands first (if present in DB), then rest ──
  const sortedBrands = (() => {
    if (availableBrands.length === 0) return PRIORITY_BRANDS
    const available = new Set(availableBrands)
    const priority  = PRIORITY_BRANDS.filter(b => available.has(b))
    const others    = availableBrands.filter(b => !PRIORITY_BRANDS.includes(b)).sort()
    // Also include any selected brands not in available list (stale selection)
    const stale = selectedBrands.filter(b => !available.has(b))
    return [...stale, ...priority, ...others]
  })()

  const visibleBrands = showAllBrands ? sortedBrands : sortedBrands.slice(0, BRANDS_VISIBLE)
  const hiddenCount   = sortedBrands.length - BRANDS_VISIBLE

  // ── Category helpers ──────────────────────────────────────────────────────
  const toggleCat = (treeKey: string) => {
    const next = selectedCats.includes(treeKey)
      ? selectedCats.filter(c => c !== treeKey)
      : [...selectedCats, treeKey]
    onFilterChange({ category: next.join(','), subcategory: '' })
  }

  const toggleSub = (sub: string) =>
    onFilterChange({ subcategory: subcategory === sub ? '' : sub })

  // ── Brand toggle ──────────────────────────────────────────────────────────
  const toggleBrand = (b: string) => {
    const next = selectedBrands.includes(b)
      ? selectedBrands.filter(x => x !== b)
      : [...selectedBrands, b]
    onFilterChange({ brand: next.join(',') })
  }

  // ── Debounced inputs ──────────────────────────────────────────────────────
  const onFilterChangeRef = useRef(onFilterChange)
  useEffect(() => { onFilterChangeRef.current = onFilterChange }, [onFilterChange])

  const priceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const handlePrice = (key: 'minPrice' | 'maxPrice', value: string) => {
    if (key === 'minPrice') setLocalMin(value); else setLocalMax(value)
    clearTimeout(priceTimer.current)
    priceTimer.current = setTimeout(() => onFilterChangeRef.current({ [key]: value }), 400)
  }

  const yearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const handleYear = (key: 'year_from' | 'year_to', value: string) => {
    if (key === 'year_from') setLocalYearFrom(value); else setLocalYearTo(value)
    clearTimeout(yearTimer.current)
    yearTimer.current = setTimeout(() => onFilterChangeRef.current({ [key]: value }), 400)
  }

  // ── Hours preset toggle (click same = deselect) ───────────────────────────
  const toggleHoursPreset = (min: string, max: string) => {
    const isActive = hoursMin === min && hoursMax === max
    onFilterChange({ hours_min: isActive ? '' : min, hours_max: isActive ? '' : max })
  }

  // ── Reset all ─────────────────────────────────────────────────────────────
  const resetAll = () => {
    const q = new URLSearchParams(window.location.search).get('q')
    router.replace(q ? `/sok?q=${encodeURIComponent(q)}` : '/sok', { scroll: false })
    onClose?.()
  }

  const hasFilters = selectedCats.length > 0 || selectedBrands.length > 0 || !!(
    subcategory || location || listingType ||
    searchParams.get('minPrice') || searchParams.get('maxPrice') ||
    searchParams.get('year_from') || searchParams.get('year_to') ||
    hoursMin || hoursMax || listedWithin
  )

  const activeNode = selectedCats.length === 1 ? CATEGORY_TREE[selectedCats[0]] : null

  const currentYear = new Date().getFullYear()

  return (
    <aside style={{
      width: onClose ? '100%' : 260,
      flexShrink: 0,
      background: 'var(--bg2)',
      border: onClose ? 'none' : '1px solid var(--border)',
      borderRadius: onClose ? 0 : 4,
      padding: onClose ? '4px 20px 88px' : '14px 16px',
      position: onClose ? 'static' : 'sticky',
      top: onClose ? undefined : 100,
      maxHeight: onClose ? 'none' : 'calc(100vh - 120px)',
      overflowY: onClose ? 'visible' : 'auto',
    }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13, color: 'var(--t1)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Filtre
        </span>
        {hasFilters && (
          <button onClick={resetAll} style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
            <X size={10} /> Nullstill alle
          </button>
        )}
      </div>

      {/* ── Merke ─────────────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Merke" active={selectedBrands.length > 0} open={openSections.merke} onToggle={() => toggleSection('merke')} />
      {openSections.merke && (
        <div style={{ paddingBottom: 4 }}>
          {visibleBrands.map(b => {
            const checked = selectedBrands.includes(b)
            return (
              <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 3, background: checked ? 'var(--gold4)' : 'transparent', transition: 'background 0.1s' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBrand(b)}
                  style={{ accentColor: 'var(--gold)', width: 14, height: 14, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: checked ? 'var(--t1)' : 'var(--t2)', fontWeight: checked ? 600 : 400 }}>
                  {b}
                </span>
              </label>
            )
          })}
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAllBrands(s => !s)}
              style={{ fontSize: 11, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', textDecoration: 'underline', width: '100%', textAlign: 'left' }}
            >
              {showAllBrands ? 'Vis færre' : `Vis alle (${hiddenCount} til)`}
            </button>
          )}
        </div>
      )}

      {/* ── Kategori ──────────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Kategori" active={selectedCats.length > 0} open={openSections.kategori} onToggle={() => toggleSection('kategori')} />
      {openSections.kategori && (
        <div style={{ paddingBottom: 4 }}>
          {Object.entries(CATEGORY_TREE).map(([key, node]) => {
            const checked = selectedCats.includes(key)
            return (
              <div key={key}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 3, background: checked ? 'var(--gold4)' : 'transparent', transition: 'background 0.1s' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCat(key)}
                    style={{ accentColor: 'var(--gold)', width: 14, height: 14, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: checked ? 'var(--t1)' : 'var(--t2)', fontWeight: checked ? 600 : 400 }}>
                    {node.label}
                  </span>
                  {node.subcategories && Object.keys(node.subcategories).length > 0 && (
                    <ChevronRight size={11} style={{ color: 'var(--t3)', marginLeft: 'auto', transform: checked ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                  )}
                </label>

                {checked && activeNode === node && (
                  <div style={{ marginLeft: 22, marginBottom: 4 }}>
                    {Object.entries(node.subcategories).map(([subKey, subLabel]) => {
                      const subActive = subcategory === subKey
                      return (
                        <label key={subKey} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 6px', cursor: 'pointer', borderRadius: 3, background: subActive ? 'var(--gold4)' : 'transparent' }}>
                          <input
                            type="radio"
                            name="subcategory"
                            checked={subActive}
                            onChange={() => toggleSub(subKey)}
                            style={{ accentColor: 'var(--gold)', width: 13, height: 13, flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 12, color: subActive ? 'var(--gold)' : 'var(--t3)', fontWeight: subActive ? 600 : 400 }}>{subLabel}</span>
                        </label>
                      )
                    })}
                    {subcategory && (
                      <button
                        onClick={() => onFilterChange({ subcategory: '' })}
                        style={{ fontSize: 11, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', textDecoration: 'underline' }}
                      >
                        Alle {node.label.toLowerCase()}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Årsmodell ─────────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Årsmodell" active={!!(searchParams.get('year_from') || searchParams.get('year_to'))} open={openSections.aarsmodell} onToggle={() => toggleSection('aarsmodell')} />
      {openSections.aarsmodell && (
        <div style={{ paddingBottom: 6 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            <input
              type="number" value={localYearFrom}
              onChange={e => handleYear('year_from', e.target.value)}
              placeholder="Fra år" min="1990" max={currentYear}
              className="input-base"
              style={{ fontSize: 12, padding: '6px 8px' }}
            />
            <span style={{ color: 'var(--t3)', fontSize: 11, flexShrink: 0 }}>–</span>
            <input
              type="number" value={localYearTo}
              onChange={e => handleYear('year_to', e.target.value)}
              placeholder="Til år" min="1990" max={currentYear}
              className="input-base"
              style={{ fontSize: 12, padding: '6px 8px' }}
            />
          </div>
        </div>
      )}

      {/* ── Driftstimer ───────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Driftstimer" active={!!(hoursMin || hoursMax)} open={openSections.timer} onToggle={() => toggleSection('timer')} />
      {openSections.timer && (
        <div style={{ paddingBottom: 4 }}>
          {HOURS_PRESETS.map(p => {
            const active = hoursMin === p.min && hoursMax === p.max
            return (
              <label key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 3, background: active ? 'var(--gold4)' : 'transparent', transition: 'background 0.1s' }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleHoursPreset(p.min, p.max)}
                  style={{ accentColor: 'var(--gold)', width: 14, height: 14, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: active ? 'var(--t1)' : 'var(--t2)', fontWeight: active ? 600 : 400 }}>
                  {p.label}
                </span>
              </label>
            )
          })}
        </div>
      )}

      {/* ── Nyeste annonser ────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Lagt ut" active={!!listedWithin} open={openSections.siste} onToggle={() => toggleSection('siste')} />
      {openSections.siste && (
        <div style={{ display: 'flex', gap: 4, paddingBottom: 6, paddingTop: 2, flexWrap: 'wrap' }}>
          {LISTED_WITHIN_OPTIONS.map(({ label, value }) => (
            <button
              key={value || 'all'}
              onClick={() => onFilterChange({ listed_within: value })}
              style={{
                flex: 1, minWidth: 60, padding: '7px 4px', borderRadius: 3,
                border: `1px solid ${listedWithin === value ? 'rgba(200,149,58,0.5)' : 'var(--border)'}`,
                background: listedWithin === value ? 'var(--gold3)' : 'var(--bg3)',
                color: listedWithin === value ? 'var(--gold)' : 'var(--t2)',
                fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 11,
                cursor: 'pointer', transition: 'all 0.1s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Type annonse ───────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Type annonse" active={!!listingType} open={openSections.type} onToggle={() => toggleSection('type')} />
      {openSections.type && (
        <div style={{ display: 'flex', gap: 6, paddingBottom: 6, paddingTop: 2 }}>
          {[
            { v: '',     l: 'Alle' },
            { v: 'sale', l: 'Til salgs' },
            { v: 'rent', l: 'Til leie' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => onFilterChange({ listingType: v })}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: 3,
                border: `1px solid ${listingType === v ? 'rgba(200,149,58,0.5)' : 'var(--border)'}`,
                background: listingType === v ? 'var(--gold3)' : 'var(--bg3)',
                color: listingType === v ? 'var(--gold)' : 'var(--t2)',
                fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 12,
                cursor: 'pointer', transition: 'all 0.1s',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* ── Område ─────────────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Område" active={!!location} open={openSections.omrade} onToggle={() => toggleSection('omrade')} />
      {openSections.omrade && (
        <div style={{ paddingBottom: 4 }}>
          {availableLocations.length === 0 ? (
            <select
              value={location}
              onChange={e => onFilterChange({ location: e.target.value })}
              className="input-base"
              style={{ fontSize: 13, padding: '7px 9px', cursor: 'pointer', marginTop: 2, marginBottom: 6 }}
            >
              <option value="">Hele Norge</option>
            </select>
          ) : (
            <>
              {location && !availableLocations.includes(location) && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 3, background: 'var(--gold4)' }}>
                  <input type="radio" name="location" checked readOnly style={{ accentColor: 'var(--gold)', width: 13, height: 13, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 600 }}>{location}</span>
                </label>
              )}
              <label
                onClick={() => onFilterChange({ location: '' })}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 3, background: !location ? 'var(--gold4)' : 'transparent' }}
              >
                <input type="radio" name="location" checked={!location} readOnly style={{ accentColor: 'var(--gold)', width: 13, height: 13, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: !location ? 'var(--t1)' : 'var(--t2)', fontWeight: !location ? 600 : 400 }}>Hele Norge</span>
              </label>
              {availableLocations.map(loc => {
                const active = location === loc
                return (
                  <label
                    key={loc}
                    onClick={() => onFilterChange({ location: active ? '' : loc })}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', borderRadius: 3, background: active ? 'var(--gold4)' : 'transparent', transition: 'background 0.1s' }}
                  >
                    <input type="radio" name="location" checked={active} readOnly style={{ accentColor: 'var(--gold)', width: 13, height: 13, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: active ? 'var(--t1)' : 'var(--t2)', fontWeight: active ? 600 : 400 }}>{loc}</span>
                  </label>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ── Pris ───────────────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Pris (NOK)" active={!!(searchParams.get('minPrice') || searchParams.get('maxPrice'))} open={openSections.pris} onToggle={() => toggleSection('pris')} />
      {openSections.pris && (
        <div style={{ paddingBottom: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
            {PRICE_PRESETS.map(p => {
              const curMin = searchParams.get('minPrice') || ''
              const curMax = searchParams.get('maxPrice') || ''
              const active = curMin === p.min && curMax === p.max
              return (
                <button
                  key={p.label}
                  onClick={() => onFilterChange({ minPrice: active ? '' : p.min, maxPrice: active ? '' : p.max })}
                  style={{
                    background: active ? 'var(--gold3)' : 'var(--bg3)',
                    border: `1px solid ${active ? 'rgba(200,149,58,0.5)' : 'var(--border)'}`,
                    borderRadius: 3, padding: '5px 6px',
                    fontSize: 10, color: active ? 'var(--gold)' : 'var(--t2)',
                    cursor: 'pointer', fontFamily: 'Barlow Condensed', fontWeight: 600,
                    transition: 'all 0.1s', textAlign: 'left',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="number" value={localMin}
              onChange={e => handlePrice('minPrice', e.target.value)}
              placeholder="Min kr" min="0"
              className="input-base"
              style={{ fontSize: 12, padding: '6px 8px' }}
            />
            <span style={{ color: 'var(--t3)', fontSize: 11, flexShrink: 0 }}>–</span>
            <input
              type="number" value={localMax}
              onChange={e => handlePrice('maxPrice', e.target.value)}
              placeholder="Maks kr" min="0"
              className="input-base"
              style={{ fontSize: 12, padding: '6px 8px' }}
            />
          </div>
        </div>
      )}

      {/* ── Mobile CTA (sticky bottom) ─────────────────────────────────────── */}
      {onClose && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg2)', padding: '12px 20px',
          borderTop: '1px solid var(--border)', zIndex: 10,
        }}>
          <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 13 }}>
            {resultCount !== undefined ? `Vis ${resultCount.toLocaleString('nb-NO')} maskiner` : 'Lukk filtre'}
          </button>
        </div>
      )}
    </aside>
  )
}
