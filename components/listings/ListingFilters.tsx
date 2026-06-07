'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useRef, useEffect } from 'react'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { CATEGORY_TREE, NORWEGIAN_COUNTIES } from '@/lib/utils/format'

interface Props {
  onClose?: () => void
  resultCount?: number
}

// ── helpers ───────────────────────────────────────────────────────────────────

const PRICE_PRESETS = [
  { label: 'Under 500k', min: '',        max: '500000'  },
  { label: '500k–1M',    min: '500000',  max: '1000000' },
  { label: '1M–2M',      min: '1000000', max: '2000000' },
  { label: '2M–5M',      min: '2000000', max: '5000000' },
  { label: 'Over 5M',    min: '5000000', max: ''        },
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

export default function ListingFilters({ onClose, resultCount }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  // ── Read filter state directly from URL — no shadow state ──────────────────
  const selectedCats = (params.get('category') || '').split(',').filter(Boolean)
  const subcategory  = params.get('subcategory') || ''
  const location     = params.get('location')    || ''
  const listingType  = params.get('listingType') || ''

  // Price inputs need local state so typing feels smooth; debounced push to URL
  const [localMin, setLocalMin] = useState(params.get('minPrice') || '')
  const [localMax, setLocalMax] = useState(params.get('maxPrice') || '')
  useEffect(() => {
    setLocalMin(params.get('minPrice') || '')
    setLocalMax(params.get('maxPrice') || '')
  }, [params])

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    kategori: true, type: true, omrade: true, pris: true,
  })
  const toggleSection = (k: keyof typeof openSections) =>
    setOpenSections(s => ({ ...s, [k]: !s[k] }))

  // ── Instant URL update ────────────────────────────────────────────────────
  const setParam = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v); else p.delete(k)
    }
    router.replace(`/sok?${p.toString()}`, { scroll: false })
  }, [params, router])

  // Toggle a main category (multi-select); also clears subcategory
  const toggleCat = (treeKey: string) => {
    const next = selectedCats.includes(treeKey)
      ? selectedCats.filter(c => c !== treeKey)
      : [...selectedCats, treeKey]
    const p = new URLSearchParams(params.toString())
    if (next.length > 0) p.set('category', next.join(','))
    else p.delete('category')
    p.delete('subcategory')
    router.replace(`/sok?${p.toString()}`, { scroll: false })
  }

  // Toggle subcategory (click same = deselect)
  const toggleSub = (sub: string) =>
    setParam({ subcategory: subcategory === sub ? '' : sub })

  // Debounced price update
  const priceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const handlePrice = (key: 'minPrice' | 'maxPrice', value: string) => {
    if (key === 'minPrice') setLocalMin(value); else setLocalMax(value)
    clearTimeout(priceTimer.current)
    priceTimer.current = setTimeout(() => setParam({ [key]: value }), 400)
  }

  const resetAll = () => {
    const p = new URLSearchParams()
    const q = params.get('q')
    if (q) p.set('q', q)
    router.replace(`/sok?${p.toString()}`, { scroll: false })
    onClose?.()
  }

  const hasFilters = selectedCats.length > 0 || !!(
    subcategory || location || listingType || params.get('minPrice') || params.get('maxPrice')
  )

  // Subcategories to show: only when exactly one main category is selected
  const activeNode = selectedCats.length === 1 ? CATEGORY_TREE[selectedCats[0]] : null

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

                {/* Subcategories — only for this node if it's the single selected cat */}
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
                    {/* Deselect subcategory */}
                    {subcategory && (
                      <button
                        onClick={() => setParam({ subcategory: '' })}
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
              onClick={() => setParam({ listingType: v })}
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
        <select
          value={location}
          onChange={e => setParam({ location: e.target.value })}
          className="input-base"
          style={{ fontSize: 13, padding: '7px 9px', cursor: 'pointer', marginTop: 2, marginBottom: 6 }}
        >
          <option value="">Hele Norge</option>
          {NORWEGIAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}

      {/* ── Pris ───────────────────────────────────────────────────────────── */}
      <Divider />
      <SectionHeader label="Pris (NOK)" active={!!(params.get('minPrice') || params.get('maxPrice'))} open={openSections.pris} onToggle={() => toggleSection('pris')} />
      {openSections.pris && (
        <div style={{ paddingBottom: 6 }}>
          {/* Presets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
            {PRICE_PRESETS.map(p => {
              const curMin = params.get('minPrice') || ''
              const curMax = params.get('maxPrice') || ''
              const active = curMin === p.min && curMax === p.max
              return (
                <button
                  key={p.label}
                  onClick={() => setParam({ minPrice: active ? '' : p.min, maxPrice: active ? '' : p.max })}
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

          {/* Min/max inputs */}
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
