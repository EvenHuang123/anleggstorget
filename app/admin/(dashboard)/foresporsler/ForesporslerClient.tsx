'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, ChevronDown, ChevronRight } from 'lucide-react'
import type { InquiryRow } from './page'

interface Stats {
  total: number
  answered: number
  rate: number
  avgHours: number | null
}

const S = {
  th: { padding: '10px 16px', textAlign: 'left' as const, color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const },
  td: { padding: '12px 16px', fontSize: 14, color: '#e6edf3', borderTop: '1px solid #21262d', verticalAlign: 'top' as const },
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'new'
  const cfg =
    s === 'answered' || s === 'replied'
      ? { bg: 'rgba(63,185,80,0.1)', color: '#3fb950', border: 'rgba(63,185,80,0.3)', label: 'Besvart' }
      : s === 'rejected' || s === 'closed'
      ? { bg: 'rgba(248,81,73,0.1)', color: '#f85149', border: 'rgba(248,81,73,0.3)', label: 'Avvist' }
      : { bg: 'rgba(240,200,62,0.1)', color: '#e3b341', border: 'rgba(240,200,62,0.3)', label: 'Ny' }
  return (
    <span style={{ padding: '3px 9px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtCategory(cat: string | null) {
  if (!cat) return '—'
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export default function ForesporslerClient({ rows, stats }: { rows: InquiryRow[]; stats: Stats }) {
  const [filter, setFilter]         = useState<'all' | 'new' | 'answered' | 'rejected'>('all')
  const [period, setPeriod]         = useState<'7d' | '30d' | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const cutoff = period === '7d'
    ? Date.now() - 7 * 86_400_000
    : period === '30d'
    ? Date.now() - 30 * 86_400_000
    : 0

  const visible = rows.filter(r => {
    if (cutoff > 0 && new Date(r.created_at).getTime() < cutoff) return false
    if (filter === 'new' && (r.status ?? 'new') !== 'new') return false
    if (filter === 'answered' && r.status !== 'answered' && r.status !== 'replied') return false
    if (filter === 'rejected' && r.status !== 'rejected' && r.status !== 'closed') return false
    return true
  })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Forespørsler
        </h1>
        <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: 13 }}>{stats.total} totalt</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Totalt', value: stats.total.toString(),         color: '#388bfd', icon: MessageSquare },
          { label: 'Besvart',value: stats.answered.toString(),      color: '#3fb950', icon: MessageSquare },
          { label: 'Svarprosent', value: `${stats.rate} %`,         color: '#f0883e', icon: MessageSquare },
          { label: 'Snitt responstid', value: stats.avgHours != null ? `${stats.avgHours} t` : '—', color: '#8b949e', icon: MessageSquare },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '16px 20px' }}>
            <p style={{ margin: 0, color: '#8b949e', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
            <p style={{ margin: '6px 0 0', color, fontSize: 26, fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'new', 'answered', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.12s',
              background: filter === f ? '#21262d' : 'transparent',
              color: filter === f ? '#e6edf3' : '#8b949e',
              borderColor: filter === f ? '#8b949e44' : '#30363d',
            }}>
            { f === 'all' ? 'Alle' : f === 'new' ? 'Ny' : f === 'answered' ? 'Besvart' : 'Avvist' }
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['7d', '30d', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.12s',
                background: period === p ? '#21262d' : 'transparent',
                color: period === p ? '#e6edf3' : '#8b949e',
                borderColor: period === p ? '#8b949e44' : '#30363d',
              }}>
              { p === 'all' ? 'Alt' : p }
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d' }}>
              <th style={{ ...S.th, width: 28 }} />
              <th style={S.th}>Dato</th>
              <th style={S.th}>Maskin</th>
              <th style={S.th}>Kjøper</th>
              <th style={S.th}>Selger</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Melding</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#8b949e', padding: '32px 16px' }}>
                Ingen forespørsler funnet
              </td></tr>
            )}
            {visible.map(r => (
              <>
                <tr
                  key={r.id}
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#21262d44')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...S.td, paddingLeft: 16, paddingRight: 4 }}>
                    {expandedId === r.id
                      ? <ChevronDown size={13} style={{ color: '#8b949e' }} />
                      : <ChevronRight size={13} style={{ color: '#8b949e' }} />
                    }
                  </td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap', fontSize: 13, color: '#8b949e' }}>{fmtDate(r.created_at)}</td>
                  <td style={S.td}>
                    {r.listing_id
                      ? <Link href={`/annonse/${r.listing_id}`} target="_blank" onClick={e => e.stopPropagation()}
                          style={{ color: '#388bfd', textDecoration: 'none', fontSize: 13 }}>
                          {r.listing_title ?? '—'}
                        </Link>
                      : <span style={{ color: '#8b949e' }}>{r.listing_title ?? '—'}</span>
                    }
                    {r.listing_category && (
                      <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>{fmtCategory(r.listing_category)}</div>
                    )}
                  </td>
                  <td style={{ ...S.td, fontSize: 13 }}>
                    <div>{r.sender_name ?? '—'}</div>
                    {r.email && <div style={{ fontSize: 11, color: '#8b949e' }}>{r.email}</div>}
                  </td>
                  <td style={{ ...S.td, fontSize: 13 }}>
                    {r.seller_id
                      ? <Link href={`/admin/kunder/${r.seller_id}`} onClick={e => e.stopPropagation()}
                          style={{ color: '#e6edf3', textDecoration: 'none' }}>
                          {r.seller_name ?? '—'}
                        </Link>
                      : <span>{r.seller_name ?? '—'}</span>
                    }
                  </td>
                  <td style={S.td}><StatusBadge status={r.status} /></td>
                  <td style={{ ...S.td, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#8b949e' }}>
                    {r.message}
                  </td>
                </tr>
                {expandedId === r.id && (
                  <tr key={`${r.id}-detail`}>
                    <td colSpan={7} style={{ padding: '0 16px 16px 48px', background: '#0d1117', borderTop: '1px solid #21262d' }}>
                      <div style={{ padding: '14px 16px', background: '#161b22', borderRadius: 6, marginTop: 12, border: '1px solid #30363d' }}>
                        <p style={{ margin: '0 0 6px', color: '#8b949e', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full melding</p>
                        <p style={{ margin: 0, color: '#e6edf3', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{r.message}</p>
                        {r.phone && (
                          <p style={{ margin: '8px 0 0', color: '#8b949e', fontSize: 13 }}>Tlf: {r.phone}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
