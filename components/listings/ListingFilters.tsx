'use client'

import { useRouter } from 'next/navigation'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, useMemo } from 'react'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { CATEGORY_TREE } from '@/lib/utils/format'
import { FYLKE_MAP } from '@/lib/constants/fylke-map'

interface Props {
  onClose?: () => void
  resultCount?: number
  searchParams: ReadonlyURLSearchParams
  onFilterChange: (updates: Record<string, string>) => void
  availableBrands?: string[]
  availableLocations?: string[]
  locationCounts?: Record<string, number>
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

function SectionHeader({ label, active, count, open, onToggle }: {
  label: string; active?: boolean; count?: number; open: boolean; onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={open}
      style={{
        width: '100%', background: 'none', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 12,
          letterSpacing: '0.02em',
          color: active ? 'var(--gold)' : 'var(--t2)',
        }}>
          {label}
        </span>
        {active && count != null && count > 0 && (
          <span style={{
            background: 'var(--gold)', color: '#0d0c0a',
            borderRadius: 10, padding: '1px 6px',
            fontSize: 9, fontWeight: 800, fontFamily: 'Barlow Condensed', letterSpacing: '0.04em',
            lineHeight: 1.4,
          }}>
            {count}
          </span>
        )}
        {active && (count == null || count === 0) && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--gold)', display: 'inline-block', flexShrink: 0,
          }} />
        )}
      </span>
      <ChevronDown size={12} style={{ color: 'var(--t3)', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
    </button>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ListingFilters({ onClose, resultCount, searchParams, onFilterChange, availableBrands = [], availableLocations = [], locationCounts = {} }: Props) {
  const router = useRouter()

  // ── Read filter state from URL ────────────────────────────────────────────
  const selectedCats   = (searchParams.get('category')      || '').split(',').filter(Boolean)
  const subcategory    = searchParams.get('subcategory')    || ''
  const location       = searchParams.get('location')       || ''
  const fylke          = searchParams.get('fylke')          || ''
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

  // ── Fylke accordion state ─────────────────────────────────────────────────
  const [expandedFylker, setExpandedFylker] = useState<string[]>(() => {
    const initial: string[] = []
    if (location) { const f = FYLKE_MAP[location]; if (f) initial.push(f) }
    if (fylke) initial.push(fylke)
    return initial
  })

  // Auto-expand when URL changes (e.g. chip click, back/forward nav)
  useEffect(() => {
    if (location) {
      const f = FYLKE_MAP[location]
      if (f) setExpandedFylker(prev => prev.includes(f) ? prev : [...prev, f])
    }
    if (fylke) {
      setExpandedFylker(prev => prev.includes(fylke) ? prev : [...prev, fylke])
    }
  }, [location, fylke])

  const toggleFylkeExpand = (fylkeName: string) =>
    setExpandedFylker(prev =>
      prev.includes(fylkeName) ? prev.filter(f => f !== fylkeName) : [...prev, fylkeName]
    )

  // ── Group locations by fylke, sorted by count desc ────────────────────────
  const fylkeGroups = useMemo(() => {
    if (availableLocations.length === 0) return []
    const groups: Record<string, { steder: string[]; count: number }> = {}
    for (const loc of availableLocations) {
      const f = FYLKE_MAP[loc] ?? 'Annet'
      if (!groups[f]) groups[f] = { steder: [], count: 0 }
      groups[f].steder.push(loc)
      groups[f].count += locationCounts[loc] ?? 0
    }
    return Object.entries(groups)
      .sort(([a, da], [b, db]) => {
        if (a === 'Annet') return 1
        if (b === 'Annet') return -1
        return db.count - da.count
      })
      .map(([name, { steder, count }]) => ({ name, steder: steder.sort(), count }))
  }, [availableLocations, locationCounts])

  // "Vis alle"-toggle for brands
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
    subcategory || location || fylke || listingType ||
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
      alignSelf: 'flex-start',
    }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--t1)', letterSpacing: '0.02em' }}>
          Filtre
        </span>
        {hasFilters && (
          <button onClick={resetAll} style={{
            background: 'none', border: '1px solid var(--border2)',
            color: 'var(--t2)', fontSize: 11, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 3,
            borderRadius: 4, padding: '3px 8px',
          }}>
            <X size={9} /> Nullstill alle
          </button>
        )}
      </div>

      {/* ── Merke ─────────────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Merke" active={selectedBrands.length > 0} count={selectedBrands.length} open={openSections.merke} onToggle={() => toggleSection('merke')} />
      {openSections.merke && (
        <div style={{ paddingBottom: 4 }}>
          {visibleBrands.map(b => {
            const checked = selectedBrands.includes(b)
            return (
              <label key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px', cursor: 'pointer', borderRadius: 3, background: checked ? 'var(--gold4)' : 'transparent', transition: 'background 0.1s' }}>
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
      <SectionHeader label="Kategori" active={selectedCats.length > 0} count={selectedCats.length + (subcategory ? 1 : 0)} open={openSections.kategori} onToggle={() => toggleSection('kategori')} />
      {openSections.kategori && (
        <div style={{ paddingBottom: 4 }}>
          {Object.entries(CATEGORY_TREE).map(([key, node]) => {
            const checked = selectedCats.includes(key)
            return (
              <div key={key}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px', cursor: 'pointer', borderRadius: 3, background: checked ? 'var(--gold4)' : 'transparent', transition: 'background 0.1s' }}>
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
                        <label key={subKey} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 6px', cursor: 'pointer', borderRadius: 3, background: subActive ? 'var(--gold4)' : 'transparent' }}>
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
              <label key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px', cursor: 'pointer', borderRadius: 3, background: active ? 'var(--gold4)' : 'transparent', transition: 'background 0.1s' }}>
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
      <SectionHeader label="Område" active={!!location || !!fylke} open={openSections.omrade} onToggle={() => toggleSection('omrade')} />
      {openSections.omrade && (
        <div style={{ paddingBottom: 4 }}>
          {/* Hele Norge */}
          <label
            onClick={() => onFilterChange({ location: '', fylke: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px', cursor: 'pointer', borderRadius: 3, background: !location && !fylke ? 'var(--gold4)' : 'transparent' }}
          >
            <input type="radio" name="area" checked={!location && !fylke} readOnly style={{ accentColor: 'var(--gold)', width: 13, height: 13, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: !location && !fylke ? 'var(--t1)' : 'var(--t2)', fontWeight: !location && !fylke ? 600 : 400 }}>Hele Norge</span>
          </label>

          {/* Fylker */}
          {fylkeGroups.map(({ name: fylkeName, steder, count }) => {
            const isFylkeSelected = fylke === fylkeName
            const isExpanded = expandedFylker.includes(fylkeName)
            const hasCitySelected = steder.includes(location)

            return (
              <div key={fylkeName}>
                <div style={{
                  display: 'flex', alignItems: 'center', borderRadius: 3,
                  background: isFylkeSelected ? 'var(--gold4)' : hasCitySelected ? 'var(--bg4)' : 'transparent',
                  transition: 'background 0.1s',
                }}>
                  <label
                    onClick={() => onFilterChange({ fylke: isFylkeSelected ? '' : fylkeName, location: '' })}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px', cursor: 'pointer' }}
                  >
                    <input type="radio" name="area" checked={isFylkeSelected} readOnly style={{ accentColor: 'var(--gold)', width: 13, height: 13, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: isFylkeSelected || hasCitySelected ? 'var(--t1)' : 'var(--t2)', fontWeight: isFylkeSelected || hasCitySelected ? 600 : 400 }}>
                      {fylkeName}
                    </span>
                    {count > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 'auto', paddingRight: 2 }}>
                        {count}
                      </span>
                    )}
                  </label>
                  {steder.length > 0 && (
                    <button
                      onClick={() => toggleFylkeExpand(fylkeName)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: '8px 8px', flexShrink: 0, display: 'flex' }}
                    >
                      <ChevronRight size={11} style={{ transition: 'transform 0.15s', transform: isExpanded ? 'rotate(90deg)' : 'none' }} />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ marginLeft: 22, marginBottom: 2 }}>
                    {steder.map(sted => {
                      const active = location === sted
                      return (
                        <label
                          key={sted}
                          onClick={() => onFilterChange({ location: active ? '' : sted, fylke: '' })}
                          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 6px', cursor: 'pointer', borderRadius: 3, background: active ? 'var(--gold4)' : 'transparent', transition: 'background 0.1s' }}
                        >
                          <input type="radio" name="area" checked={active} readOnly style={{ accentColor: 'var(--gold)', width: 12, height: 12, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: active ? 'var(--gold)' : 'var(--t3)', fontWeight: active ? 600 : 400 }}>
                            {sted}
                          </span>
                          {locationCounts[sted] != null && (
                            <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 'auto' }}>
                              {locationCounts[sted]}
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
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
