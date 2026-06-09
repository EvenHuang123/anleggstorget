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
  // New TEXT values
  'Gravemaskiner':          'Gravemaskiner',
  'Hjullastere':            'Hjullastere',
  'Dumpers':                'Dumpers',
  'Kompaktmaskiner':        'Kompaktmaskiner',
  'Kraner og løft':         'Kraner og løft',
  'Komprimering og asfalt': 'Komprimering og asfalt',
  'Annet':                  'Annet',
  // Legacy enum fallbacks
  gravemaskin: 'Gravemaskiner', hjullaster: 'Hjullastere', dumper: 'Dumpers',
  traktor: 'Annet', kranbil: 'Kraner og løft', skogsutstyr: 'Annet',
  betong: 'Komprimering og asfalt', kompaktlaster: 'Kompaktmaskiner', annet: 'Annet',
  // Truck-legacy → Annet
  'Truck og lager': 'Annet', gaffeltruck: 'Annet', lagertruck: 'Annet', trekktruck: 'Annet',
}

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
    { key: 'all', label: 'Alle' },
    { key: 'active', label: 'Aktive' },
    { key: 'inactive', label: 'Inaktive' },
    { key: 'nasta', label: 'NASTA' },
    { key: 'manual', label: 'Manuelle' },
  ]

  const s = {
    th: { padding: '10px 16px', textAlign: 'left' as const, color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const },
    td: { padding: '11px 16px', fontSize: 14, color: '#e6edf3', borderTop: '1px solid #21262d', verticalAlign: 'middle' as const },
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Maskiner
        </h1>
        <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: 13 }}>{listings.length} listings totalt</p>
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: 3 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '5px 12px', borderRadius: 4, border: 'none', fontSize: 13,
              background: filter === f.key ? '#21262d' : 'transparent',
              color: filter === f.key ? '#e6edf3' : '#8b949e',
              cursor: 'pointer', fontWeight: filter === f.key ? 600 : 400,
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Søk på tittel eller selger..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 38, paddingLeft: 34, paddingRight: 12, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d' }}>
              <th style={s.th}>Tittel</th>
              <th style={s.th}>Selger</th>
              <th style={s.th}>Pris</th>
              <th style={s.th}>Kategori</th>
              <th style={s.th}>Kilde</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Dato</th>
              <th style={s.th}>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#8b949e', padding: '32px 16px' }}>
                Ingen listings funnet
              </td></tr>
            )}
            {filtered.map(l => {
              const isActive = l.status === 'active'
              return (
                <tr key={l.id}
                  onMouseOver={e => (e.currentTarget.style.background = '#21262d22')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...s.td, maxWidth: 240 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                  </td>
                  <td style={{ ...s.td, color: '#8b949e', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {l.profiles?.company_name ?? '—'}
                  </td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15 }}>
                    {fmtPrice(l.price)}
                  </td>
                  <td style={{ ...s.td, color: '#8b949e', fontSize: 13 }}>
                    {CATEGORY_LABELS[l.category] ?? l.category}
                  </td>
                  <td style={s.td}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                      background: l.source === 'nasta' ? 'rgba(240,136,62,0.15)' : 'rgba(139,148,158,0.15)',
                      color: l.source === 'nasta' ? '#f0883e' : '#8b949e',
                      border: `1px solid ${l.source === 'nasta' ? 'rgba(240,136,62,0.3)' : 'rgba(139,148,158,0.3)'}`,
                    }}>
                      {l.source === 'nasta' ? 'NASTA' : 'Manuell'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      background: isActive ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
                      color: isActive ? '#3fb950' : '#f85149',
                      border: `1px solid ${isActive ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
                    }}>
                      {isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: '#8b949e', fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(l.created_at)}</td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        href={`/annonse/${l.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', background: 'none', border: '1px solid #30363d', borderRadius: 5, color: '#8b949e', fontSize: 12, textDecoration: 'none', cursor: 'pointer' }}
                        title="Åpne annonsesiden"
                      >
                        <ExternalLink size={11} /> Se
                      </a>
                      <button
                        onClick={() => handleToggle(l.id, l.status)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', background: 'none', border: `1px solid ${isActive ? 'rgba(248,81,73,0.3)' : 'rgba(63,185,80,0.3)'}`, borderRadius: 5, color: isActive ? '#f85149' : '#3fb950', fontSize: 12, cursor: 'pointer' }}
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
