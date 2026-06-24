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

function SyncButton({ source, label }: { source: 'nasta' | 'hesselberg' | 'rockmann'; label: string }) {
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
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <p style={{ margin: 0, color: '#e6edf3', fontSize: 14, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: '2px 0 0', color: '#8b949e', fontSize: 12, fontFamily: 'monospace' }}>source=&quot;{source}&quot;</p>
        </div>

        {state.result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, flex: '1 1 200px', color: state.ok ? '#3fb950' : '#f85149' }}>
            {state.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
            {state.result}
          </div>
        )}

        <button
          onClick={handleSync}
          disabled={state.loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 6, border: '1px solid #388bfd44',
            background: state.loading ? '#21262d' : '#388bfd1a',
            color: '#388bfd', fontSize: 13, fontWeight: 600,
            cursor: state.loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
          }}
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
              padding: '6px 20px', background: 'none', border: 'none',
              borderTop: '1px solid #21262d',
              color: '#8b949e', fontSize: 12, cursor: 'pointer', textAlign: 'left',
            }}
          >
            {state.showDetails ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {state.details.length} maskiner
            {missingHours  > 0 && <span style={{ color: '#f0883e', marginLeft: 8 }}>{missingHours} uten timer</span>}
            {missingWeight > 0 && <span style={{ color: '#8b949e',  marginLeft: 8 }}>{missingWeight} uten vektklasse</span>}
          </button>

          {state.showDetails && (
            <div style={{ borderTop: '1px solid #21262d', maxHeight: 320, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#0d1117' }}>
                    <th style={{ padding: '6px 20px', color: '#8b949e', fontWeight: 600, textAlign: 'left' }}>Tittel</th>
                    <th style={{ padding: '6px 12px', color: '#8b949e', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Timer</th>
                    <th style={{ padding: '6px 12px', color: '#8b949e', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Vektklasse</th>
                    <th style={{ padding: '6px 20px', color: '#8b949e', fontWeight: 600, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.details.map(d => (
                    <tr key={d.externalId} style={{ borderTop: '1px solid #21262d10' }}>
                      <td style={{ padding: '5px 20px', color: '#e6edf3', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</td>
                      <td style={{ padding: '5px 12px', textAlign: 'right', color: d.hours !== null ? '#3fb950' : '#f0883e', fontFamily: 'monospace' }}>
                        {d.hours !== null ? d.hours.toLocaleString('nb-NO') : '—'}
                      </td>
                      <td style={{ padding: '5px 12px', textAlign: 'right', color: d.weightClass !== null ? '#3fb950' : '#8b949e' }}>
                        {d.weightClass ?? '—'}
                      </td>
                      <td style={{ padding: '5px 20px', textAlign: 'right' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: 3, fontSize: 11, fontWeight: 700,
                          background: d.status === 'created' ? 'rgba(63,185,80,0.1)' : d.status === 'updated' ? 'rgba(56,139,253,0.1)' : 'transparent',
                          color:      d.status === 'created' ? '#3fb950'             : d.status === 'updated' ? '#388bfd'             : '#8b949e',
                        }}>
                          {d.status === 'created' ? 'NY' : d.status === 'updated' ? 'OPPDATERT' : '—'}
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
      <p style={{ margin: '0 0 10px', color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Manuell synkronisering
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SyncButton source="nasta" label="NASTA AS" />
        <SyncButton source="hesselberg" label="Hesselberg Maskin AS" />
        <SyncButton source="rockmann" label="Rockmann AS (Finn.no)" />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
