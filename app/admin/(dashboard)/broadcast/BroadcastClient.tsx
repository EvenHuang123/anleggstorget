'use client'

import { useState } from 'react'
import { Send, CheckSquare, Square, CheckCircle, XCircle } from 'lucide-react'

export interface SellerRow {
  id: string
  company_name: string
  email: string
}

const S = {
  label: { display: 'block', color: '#8b949e', fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  input: { width: '100%', padding: '9px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
}

export default function BroadcastClient({ sellers }: { sellers: SellerRow[] }) {
  const [selected, setSelected]   = useState<Set<string>>(() => new Set(sellers.map(s => s.id)))
  const [subject, setSubject]     = useState('')
  const [message, setMessage]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<{ ok: boolean; text: string } | null>(null)

  const toggleSeller = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const selectAll  = () => setSelected(new Set(sellers.map(s => s.id)))
  const selectNone = () => setSelected(new Set())

  const allSelected  = selected.size === sellers.length
  const noneSelected = selected.size === 0

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return
    if (selected.size === 0) return
    if (!confirm(`Send e-post til ${selected.size} mottaker${selected.size !== 1 ? 'e' : ''}?`)) return

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, sellerIds: [...selected] }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, text: `Sendt til ${data.sent} av ${data.total} mottakere` })
        setSubject('')
        setMessage('')
      } else {
        setResult({ ok: false, text: data.error ?? 'Ukjent feil' })
      }
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : 'Nettverksfeil' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

      {/* Left: compose */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 24 }}>
        <p style={{ margin: '0 0 20px', color: '#388bfd', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Skriv melding
        </p>

        {result && (
          <div style={{
            background: result.ok ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
            border: `1px solid ${result.ok ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
            borderRadius: 6, padding: '10px 14px', marginBottom: 18,
            color: result.ok ? '#3fb950' : '#f85149', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {result.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {result.text}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Emne</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="F.eks: Ny funksjon på Anleggstorget"
            style={S.input}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={S.label}>Melding</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={'Hei,\n\nVi vil informere om...'}
            rows={10}
            style={{ ...S.input, height: 'auto', resize: 'vertical', lineHeight: 1.7 }}
          />
          <p style={{ margin: '5px 0 0', color: '#8b949e', fontSize: 11 }}>
            {message.length} tegn · Sendes som HTML-e-post med Anleggstorget-mal
          </p>
        </div>

        <button
          onClick={handleSend}
          disabled={loading || !subject.trim() || !message.trim() || selected.size === 0}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '11px 0', borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 700,
            cursor: loading || !subject.trim() || !message.trim() || selected.size === 0 ? 'not-allowed' : 'pointer',
            background: loading || selected.size === 0 ? '#21262d' : '#388bfd',
            color: '#fff', transition: 'background 0.15s',
          }}
        >
          <Send size={14} />
          {loading ? 'Sender...' : `Send til ${selected.size} mottaker${selected.size !== 1 ? 'e' : ''}`}
        </button>
      </div>

      {/* Right: recipient list */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, color: '#e6edf3', fontSize: 13, fontWeight: 600 }}>Mottakere</p>
            <p style={{ margin: '2px 0 0', color: '#8b949e', fontSize: 12 }}>
              {selected.size} av {sellers.length} valgt
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={selectAll}
              disabled={allSelected}
              style={{ background: 'none', border: '1px solid #30363d', borderRadius: 4, color: allSelected ? '#30363d' : '#8b949e', fontSize: 11, cursor: allSelected ? 'default' : 'pointer', padding: '4px 8px' }}
            >
              Alle
            </button>
            <button
              onClick={selectNone}
              disabled={noneSelected}
              style={{ background: 'none', border: '1px solid #30363d', borderRadius: 4, color: noneSelected ? '#30363d' : '#8b949e', fontSize: 11, cursor: noneSelected ? 'default' : 'pointer', padding: '4px 8px' }}
            >
              Ingen
            </button>
          </div>
        </div>

        <div style={{ maxHeight: 480, overflowY: 'auto' }}>
          {sellers.length === 0 && (
            <p style={{ padding: '24px 16px', color: '#8b949e', fontSize: 13, textAlign: 'center', margin: 0 }}>
              Ingen verifiserte selgere med e-post
            </p>
          )}
          {sellers.map(seller => {
            const checked = selected.has(seller.id)
            return (
              <label
                key={seller.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #21262d11',
                  background: checked ? '#21262d22' : 'transparent',
                  transition: 'background 0.1s',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSeller(seller.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ flexShrink: 0, color: checked ? '#388bfd' : '#30363d', marginTop: 1 }}>
                  {checked ? <CheckSquare size={15} /> : <Square size={15} />}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: checked ? '#e6edf3' : '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {seller.company_name}
                  </p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {seller.email}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

    </div>
  )
}
