'use client'

import { useState } from 'react'
import { RefreshCcw, CheckCircle, XCircle } from 'lucide-react'

interface SyncState {
  loading: boolean
  result: string | null
  ok: boolean | null
}

function SyncButton({ source, label }: { source: 'nasta' | 'hesselberg'; label: string }) {
  const [state, setState] = useState<SyncState>({ loading: false, result: null, ok: null })

  const handleSync = async () => {
    setState({ loading: true, result: null, ok: null })
    try {
      const res = await fetch('/api/admin/trigger-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      const data = await res.json()
      if (res.ok) {
        setState({
          loading: false, ok: true,
          result: `${data.created ?? 0} nye · ${data.updated ?? 0} oppdatert · ${data.removed ?? 0} fjernet · ${data.totalScraped ?? 0} scraped`,
        })
      } else {
        setState({ loading: false, ok: false, result: data.error ?? 'Ukjent feil' })
      }
    } catch (e) {
      setState({ loading: false, ok: false, result: e instanceof Error ? e.message : 'Nettverksfeil' })
    }
  }

  return (
    <div style={{
      background: '#161b22', border: '1px solid #30363d', borderRadius: 8,
      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 140 }}>
        <p style={{ margin: 0, color: '#e6edf3', fontSize: 14, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '2px 0 0', color: '#8b949e', fontSize: 12, fontFamily: 'monospace' }}>source=&quot;{source}&quot;</p>
      </div>

      {state.result && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, flex: '1 1 200px',
          color: state.ok ? '#3fb950' : '#f85149',
        }}>
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
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
