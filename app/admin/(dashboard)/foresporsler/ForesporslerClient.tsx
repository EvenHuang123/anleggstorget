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

const th = { padding: '10px 16px', textAlign: 'left' as const, color: '#6B7280', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const }
const td = { padding: '12px 16px', fontSize: 14, color: '#1A1A1A', borderTop: '1px solid #F3F4F6', verticalAlign: 'top' as const }

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'new'
  const cfg =
    s === 'answered' || s === 'replied'
      ? { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'Besvart' }
      : s === 'rejected' || s === 'closed'
      ? { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5', label: 'Avvist' }
      : { bg: '#fef3c7', color: '#B45309', border: '#fde68a', label: 'Ny' }
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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1A1A1A' }}>
          Forespørsler
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>{stats.total} totalt</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Totalt',        value: stats.total.toString(),    color: '#B45309' },
          { label: 'Besvart',       value: stats.answered.toString(), color: '#16a34a' },
          { label: 'Svarprosent',   value: `${stats.rate} %`,         color: '#D97706' },
          { label: 'Snitt responstid', value: stats.avgHours != null ? `${stats.avgHours} t` : '—', color: '#6B7280' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: 0, color: '#6B7280', fontSize: 11, fontWeight: 500 }}>{label}</p>
            <p style={{ margin: '6px 0 0', color, fontSize: 26, fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'new', 'answered', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.12s',
              background: filter === f ? '#FEF3C7' : '#FFFFFF',
              color: filter === f ? '#92400E' : '#6B7280',
              borderColor: filter === f ? '#fde68a' : '#E5E7EB',
            }}>
            { f === 'all' ? 'Alle' : f === 'new' ? 'Ny' : f === 'answered' ? 'Besvart' : 'Avvist' }
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['7d', '30d', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.12s',
                background: period === p ? '#F3F4F6' : '#FFFFFF',
                color: period === p ? '#374151' : '#6B7280',
                borderColor: period === p ? '#D1D5DB' : '#E5E7EB',
              }}>
              { p === 'all' ? 'Alt' : p }
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
              <th style={{ ...th, width: 28 }} />
              <th style={th}>Dato</th>
              <th style={th}>Maskin</th>
              <th style={th}>Kjøper</th>
              <th style={th}>Selger</th>
              <th style={th}>Status</th>
              <th style={th}>Melding</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#6B7280', padding: '32px 16px' }}>
                Ingen forespørsler funnet
              </td></tr>
            )}
            {visible.map(r => (
              <>
                <tr
                  key={r.id}
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...td, paddingLeft: 16, paddingRight: 4 }}>
                    {expandedId === r.id
                      ? <ChevronDown size={13} style={{ color: '#9CA3AF' }} />
                      : <ChevronRight size={13} style={{ color: '#9CA3AF' }} />
                    }
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap', fontSize: 13, color: '#6B7280' }}>{fmtDate(r.created_at)}</td>
                  <td style={td}>
                    {r.listing_id
                      ? <Link href={`/annonse/${r.listing_id}`} target="_blank" onClick={e => e.stopPropagation()}
                          style={{ color: '#B45309', textDecoration: 'none', fontSize: 13 }}>
                          {r.listing_title ?? '—'}
                        </Link>
                      : <span style={{ color: '#6B7280' }}>{r.listing_title ?? '—'}</span>
                    }
                    {r.listing_category && (
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{fmtCategory(r.listing_category)}</div>
                    )}
                  </td>
                  <td style={{ ...td, fontSize: 13 }}>
                    <div>{r.sender_name ?? '—'}</div>
                    {r.email && <div style={{ fontSize: 11, color: '#6B7280' }}>{r.email}</div>}
                  </td>
                  <td style={{ ...td, fontSize: 13 }}>
                    {r.seller_id
                      ? <Link href={`/admin/kunder/${r.seller_id}`} onClick={e => e.stopPropagation()}
                          style={{ color: '#1A1A1A', textDecoration: 'none' }}
                          onMouseOver={e => (e.currentTarget.style.color = '#B45309')}
                          onMouseOut={e => (e.currentTarget.style.color = '#1A1A1A')}>
                          {r.seller_name ?? '—'}
                        </Link>
                      : <span>{r.seller_name ?? '—'}</span>
                    }
                  </td>
                  <td style={td}><StatusBadge status={r.status} /></td>
                  <td style={{ ...td, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#6B7280' }}>
                    {r.message}
                  </td>
                </tr>
                {expandedId === r.id && (
                  <tr key={`${r.id}-detail`}>
                    <td colSpan={7} style={{ padding: '0 16px 16px 48px', background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
                      <div style={{ padding: '14px 16px', background: '#FFFFFF', borderRadius: 8, marginTop: 12, border: '1px solid #E5E7EB' }}>
                        <p style={{ margin: '0 0 6px', color: '#6B7280', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full melding</p>
                        <p style={{ margin: 0, color: '#1A1A1A', fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{r.message}</p>
                        {r.phone && (
                          <p style={{ margin: '8px 0 0', color: '#6B7280', fontSize: 13 }}>Tlf: {r.phone}</p>
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
