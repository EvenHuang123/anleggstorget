'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) setVisible(true)
    } catch {
      // localStorage unavailable (private mode etc.) — don't show banner
    }
  }, [])

  const decide = (accepted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        decided:    true,
        necessary:  true,
        analytics:  accepted,
        timestamp:  new Date().toISOString(),
      }))
    } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Informasjonskapsler"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border2)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.35)',
        padding: '20px 24px',
      }}
    >
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--t1)',
            marginBottom: 4,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}>
            Vi bruker informasjonskapsler
          </p>
          <p style={{ color: 'var(--t3)', fontSize: 13, lineHeight: 1.6 }}>
            Vi bruker nødvendige informasjonskapsler for at siden skal fungere.{' '}
            <Link href="/personvern" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
              Les mer i vår personvernerklæring.
            </Link>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() => decide(false)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border2)',
              color: 'var(--t2)',
              borderRadius: 3,
              padding: '10px 20px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            Avvis alle
          </button>
          <button
            onClick={() => decide(true)}
            style={{
              background: 'var(--gold)',
              border: '1px solid var(--gold)',
              color: '#0d0c0a',
              borderRadius: 3,
              padding: '10px 20px',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            Godta alle
          </button>
        </div>
      </div>
    </div>
  )
}
