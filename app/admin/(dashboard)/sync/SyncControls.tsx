'use client'

import { useState } from 'react'
import { RefreshCcw, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react'

interface ListingDetail {
  externalId:  string
  title:       string
  hours:       number | null
  weightClass: string | null
  status:      'created' | 'updated' | 'unchanged'
}

interface SyncState {
  loading:  boolean
  result:   string | null
  ok:       boolean | null
  details:  ListingDetail[] | null
  showDetails: boolean
}

function SyncButton({ source, label }: { source: 'nasta' | 'hesselberg' | 'rockmann' | 'oslomaskin'; label: string }) {
  const [state, setState] = useState<SyncState>({ loading: false, result: null, ok: null, details: null, showDetails: false })

  const handleSync = async () => {
    setState({ loading: true, result: null, ok: null, details: null, showDetails: false })
    try {
      const res = await fetch('/api/admin/trigger-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      const data = await res.json()
      if (res.ok) {
        setState({
          loading: false, ok: true, showDetails: false,
          result: `${data.created ?? 0} nye · ${data.updated ?? 0} oppdatert · ${data.removed ?? 0} fjernet · ${data.totalScraped ?? 0} scraped`,
          details: data.details ?? null,
        })
      } else {
        setState({ loading: false, ok: false, result: data.error ?? 'Ukjent feil', details: null, showDetails: false })
      }
    } catch (e) {
      setState({ loading: false, ok: false, result: e instanceof Error ? e.message : 'Nettverksfeil', details: null, showDetails: false })
    }
  }

  const missingHours   = state.details?.filter(d => d.hours       === null).length ?? 0
  const missingWeight  = state.details?.filter(d => d.weightClass === null).length ?? 0

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <p style={{ margin: 0, color: '#1A1A1A', fontSize: 14, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: '2px 0 0', color: '#9CA3AF', fontSize: 11, fontFamily: 'monospace' }}>source=&quot;{source}&quot;</p>
        </div>

        {state.result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, flex: '1 1 200px', color: state.ok ? '#16a34a' : '#dc2626' }}>
            {state.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
            {state.result}
          </div>
        )}

        <button
          onClick={handleSync}
          disabled={state.loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 8, border: 'none',
            background: state.loading ? '#F3F4F6' : '#B45309',
            color: state.loading ? '#9CA3AF' : '#FFFFFF',
            fontSize: 13, fontWeight: 600,
            cursor: state.loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
          onMouseOver={e => { if (!state.loading) e.currentTarget.style.opacity = '0.88' }}
          onMouseOut={e => { e.currentTarget.style.opacity = '1' }}
        >
          <RefreshCcw size={13} style={state.loading ? { animation: 'spin 1s linear infinite' } : undefined} />
          {state.loading ? 'Synkroniserer...' : 'Synkroniser nå'}
        </button>
      </div>

      {state.details && state.details.length > 0 && (
        <>
          <button
            onClick={() => setState(s => ({ ...s, showDetails: !s.showDetails }))}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 20px', background: 'none', border: 'none',
              borderTop: '1px solid #F3F4F6',
              color: '#6B7280', fontSize: 12, cursor: 'pointer', textAlign: 'left',
            }}
          >
            {state.showDetails ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {state.details.length} maskiner
            {missingHours  > 0 && <span style={{ color: '#D97706', marginLeft: 8 }}>{missingHours} uten timer</span>}
            {missingWeight > 0 && <span style={{ color: '#9CA3AF', marginLeft: 8 }}>{missingWeight} uten vektklasse</span>}
          </button>

          {state.showDetails && (
            <div style={{ borderTop: '1px solid #F3F4F6', maxHeight: 320, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    <th style={{ padding: '6px 20px', color: '#6B7280', fontWeight: 500, textAlign: 'left' }}>Tittel</th>
                    <th style={{ padding: '6px 12px', color: '#6B7280', fontWeight: 500, textAlign: 'right', whiteSpace: 'nowrap' }}>Timer</th>
                    <th style={{ padding: '6px 12px', color: '#6B7280', fontWeight: 500, textAlign: 'right', whiteSpace: 'nowrap' }}>Vektklasse</th>
                    <th style={{ padding: '6px 20px', color: '#6B7280', fontWeight: 500, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.details.map(d => (
                    <tr key={d.externalId} style={{ borderTop: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '5px 20px', color: '#1A1A1A', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</td>
                      <td style={{ padding: '5px 12px', textAlign: 'right', color: d.hours !== null ? '#16a34a' : '#D97706', fontFamily: 'monospace' }}>
                        {d.hours !== null ? d.hours.toLocaleString('nb-NO') : '—'}
                      </td>
                      <td style={{ padding: '5px 12px', textAlign: 'right', color: d.weightClass !== null ? '#16a34a' : '#9CA3AF' }}>
                        {d.weightClass ?? '—'}
                      </td>
                      <td style={{ padding: '5px 20px', textAlign: 'right' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: 3, fontSize: 11, fontWeight: 600,
                          background: d.status === 'created' ? '#f0fdf4' : d.status === 'updated' ? '#eff6ff' : 'transparent',
                          color:      d.status === 'created' ? '#16a34a' : d.status === 'updated' ? '#1d4ed8' : '#9CA3AF',
                        }}>
                          {d.status === 'created' ? 'Ny' : d.status === 'updated' ? 'Oppdatert' : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SyncControls() {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ margin: '0 0 10px', color: '#6B7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Manuell synkronisering
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SyncButton source="nasta"      label="NASTA AS" />
        <SyncButton source="hesselberg" label="Hesselberg Maskin AS" />
        <SyncButton source="rockmann"   label="Rockmann AS (Finn.no)" />
        <SyncButton source="oslomaskin" label="Oslo Maskin AS" />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
