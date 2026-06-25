'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      flexDirection: 'column',
      gap: 20,
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 4,
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        ⚠️
      </div>
      <div>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 28, color: 'var(--t1)', marginBottom: 8 }}>
          Noe gikk galt
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: 14 }}>En uventet feil har oppstått. Prøv igjen.</p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={reset} className="btn-primary">Prøv igjen</button>
        <Link href="/" className="btn-secondary">Til forsiden</Link>
      </div>
    </div>
  )
}
