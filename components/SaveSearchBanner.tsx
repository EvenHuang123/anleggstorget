'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

interface SaveSearchBannerProps {
  currentParams: {
    query?: string
    category?: string
    brand?: string
    maxPrice?: string
  }
}

export function SaveSearchBanner({ currentParams }: SaveSearchBannerProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || loading) return
    setLoading(true)
    try {
      await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          query:     currentParams.query     || null,
          category:  currentParams.category  || null,
          brand:     currentParams.brand     || null,
          max_price: currentParams.maxPrice  ? parseInt(currentParams.maxPrice, 10) : null,
        }),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{
        border: '1px solid rgba(74,222,128,0.25)',
        borderRadius: 4, padding: '16px 20px', marginTop: 32,
        background: 'rgba(74,222,128,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Bell size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: '#4ade80' }}>
          Takk! Vi varsler deg når nye maskiner matcher søket ditt.
        </span>
      </div>
    )
  }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '20px 24px',
      marginTop: 32,
      background: 'var(--bg2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <Bell size={16} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: 'var(--t1)', marginBottom: 4 }}>
            Finner du ikke det du leter etter?
          </p>
          <p style={{ fontSize: 13, color: 'var(--t3)', margin: 0 }}>
            Legg igjen e-posten din, så varsler vi deg når nye maskiner matcher søket ditt.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          placeholder="din@epost.no"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-base"
          style={{ flex: '1 1 200px', height: 40, minWidth: 0 }}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-secondary"
          style={{ height: 40, fontSize: 13, padding: '0 18px', whiteSpace: 'nowrap' }}
        >
          {loading ? 'Lagrer…' : 'Bli varslet'}
        </button>
      </form>
    </div>
  )
}
