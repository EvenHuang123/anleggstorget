'use client'

import { useState, useTransition } from 'react'
import { Search, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react'

interface Listing {
  id: string
  title: string
  category: string
  price: number
  source: string
  status: string
  created_at: string
  slug: string
  seller_id: string
  profiles: { company_name: string } | null
}

type FilterKey = 'all' | 'active' | 'inactive' | 'nasta' | 'manual'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtPrice(n: number) {
  return n ? n.toLocaleString('nb-NO') + ' kr' : '—'
}

const CATEGORY_LABELS: Record<string, string> = {
  'Gravemaskiner':          'Gravemaskiner',
  'Hjullastere':            'Hjullastere',
  'Dumpers':                'Dumpers',
  'Kompaktmaskiner':        'Kompaktmaskiner',
  'Kraner og løft':         'Kraner og løft',
  'Annet':                  'Annet',
  'Komprimering og asfalt': 'Annet',
  gravemaskin: 'Gravemaskiner', hjullaster: 'Hjullastere', dumper: 'Dumpers',
  traktor: 'Annet', kranbil: 'Kraner og løft', skogsutstyr: 'Annet',
  betong: 'Annet', kompaktlaster: 'Kompaktmaskiner', annet: 'Annet',
  'Truck og lager': 'Annet', gaffeltruck: 'Annet', lagertruck: 'Annet', trekktruck: 'Annet',
}

const th = { padding: '10px 16px', textAlign: 'left' as const, color: '#6B7280', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const }
const td = { padding: '11px 16px', fontSize: 14, color: '#1A1A1A', borderTop: '1px solid #F3F4F6', verticalAlign: 'middle' as const }

export default function MaskinerClient({ initialListings }: { initialListings: Listing[] }) {
  const [listings, setListings] = useState(initialListings)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [, startTransition] = useTransition()

  const filtered = listings.filter(l => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.profiles?.company_name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? l.status === 'active' :
      filter === 'inactive' ? l.status !== 'active' :
      filter === 'nasta' ? l.source === 'nasta' :
      l.source === 'manual'
    return matchSearch && matchFilter
  })

  const handleToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active'
    startTransition(async () => {
      const res = await fetch('/api/admin/toggle-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id, status: newStatus }),
      })
      if (res.ok) setListings(ls => ls.map(l => l.id === id ? { ...l, status: newStatus } : l))
    })
  }

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all',      label: 'Alle' },
    { key: 'active',   label: 'Aktive' },
    { key: 'inactive', label: 'Inaktive' },
    { key: 'nasta',    label: 'NASTA' },
    { key: 'manual',   label: 'Manuelle' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1A1A1A' }}>
          Maskiner
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>{listings.length} annonser totalt</p>
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 3 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 13,
              background: filter === f.key ? '#FEF3C7' : 'transparent',
              color: filter === f.key ? '#92400E' : '#6B7280',
              cursor: 'pointer', fontWeight: filter === f.key ? 600 : 400,
              transition: 'all 0.12s',
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Søk på tittel eller selger..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 38, paddingLeft: 34, paddingRight: 12, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, color: '#1A1A1A', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
              <th style={th}>Tittel</th>
              <th style={th}>Selger</th>
              <th style={th}>Pris</th>
              <th style={th}>Kategori</th>
              <th style={th}>Kilde</th>
              <th style={th}>Status</th>
              <th style={th}>Dato</th>
              <th style={th}>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#6B7280', padding: '32px 16px' }}>
                Ingen annonser funnet
              </td></tr>
            )}
            {filtered.map(l => {
              const isActive = l.status === 'active'
              return (
                <tr key={l.id}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...td, maxWidth: 240 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                  </td>
                  <td style={{ ...td, color: '#6B7280', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {l.profiles?.company_name ?? '—'}
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15 }}>
                    {fmtPrice(l.price)}
                  </td>
                  <td style={{ ...td, color: '#6B7280', fontSize: 13 }}>
                    {CATEGORY_LABELS[l.category] ?? l.category}
                  </td>
                  <td style={td}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: l.source === 'nasta' ? '#fffbeb' : '#F3F4F6',
                      color: l.source === 'nasta' ? '#B45309' : '#6B7280',
                      border: `1px solid ${l.source === 'nasta' ? '#fde68a' : '#E5E7EB'}`,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: l.source === 'nasta' ? '#D97706' : '#9CA3AF' }} />
                      {l.source === 'nasta' ? 'NASTA' : 'Manuell'}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: isActive ? '#f0fdf4' : '#fef2f2',
                      color: isActive ? '#16a34a' : '#dc2626',
                      border: `1px solid ${isActive ? '#86efac' : '#fca5a5'}`,
                    }}>
                      {isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#6B7280', fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(l.created_at)}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        href={`/annonse/${l.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, color: '#6B7280', fontSize: 12, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.12s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#B45309' }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
                        title="Åpne annonsesiden"
                      >
                        <ExternalLink size={11} /> Se
                      </a>
                      <button
                        onClick={() => handleToggle(l.id, l.status)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', background: 'none', border: `1px solid ${isActive ? '#fca5a5' : '#86efac'}`, borderRadius: 6, color: isActive ? '#dc2626' : '#16a34a', fontSize: 12, cursor: 'pointer', transition: 'all 0.12s' }}
                        title={isActive ? 'Deaktiver' : 'Aktiver'}
                      >
                        {isActive ? <><ToggleLeft size={11} /> Deaktiver</> : <><ToggleRight size={11} /> Aktiver</>}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
