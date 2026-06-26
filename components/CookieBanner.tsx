'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cookie-consent-v2'

interface ConsentState {
  analytics: boolean
  marketing: boolean
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export default function CookieBanner() {
  const [visible, setVisible]         = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent]         = useState<ConsentState>({ analytics: false, marketing: false })

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch { /* private mode */ }
  }, [])

  function save(c: ConsentState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...c, timestamp: new Date().toISOString() }))
    } catch { /* ignore */ }

    // Aktiver GA4 kun hvis analytics er godtatt — ekomloven § 3-15
    window.gtag?.('consent', 'update', {
      analytics_storage: c.analytics  ? 'granted' : 'denied',
      ad_storage:        c.marketing  ? 'granted' : 'denied',
    })
    setVisible(false)
  }

  if (!visible) return null

  const btnBase: React.CSSProperties = {
    flex: '1 1 120px',
    padding: '11px 20px',
    borderRadius: 3,
    fontFamily: 'Barlow Condensed, sans-serif',
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cookie-innstillinger"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 9999,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border2)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.35)',
        padding: '20px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Tekst */}
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 15, color: 'var(--t1)',
            marginBottom: 4, letterSpacing: '0.02em', textTransform: 'uppercase',
          }}>
            Vi bruker informasjonskapsler
          </p>
          <p style={{ color: 'var(--t3)', fontSize: 13, lineHeight: 1.6 }}>
            Nødvendige informasjonskapsler er alltid aktive. Med ditt samtykke bruker vi også
            Google Analytics for å forstå trafikkmønstre anonymt.{' '}
            <Link href="/personvern#cookies" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>
              Les vår cookie-erklæring
            </Link>.
          </p>
        </div>

        {/* Detaljpanel */}
        {showDetails && (
          <div style={{
            marginBottom: 16,
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '16px 20px',
            background: 'var(--bg3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* Nødvendige */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>Nødvendige</p>
                <p style={{ fontSize: 12, color: 'var(--t3)' }}>Kreves for at siden skal fungere. Kan ikke avslås.</p>
              </div>
              <span style={{ fontSize: 12, color: 'var(--t3)', flexShrink: 0, paddingTop: 2 }}>Alltid aktiv</span>
            </div>

            {/* Analyse */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>Analyse (Google Analytics)</p>
                <p style={{ fontSize: 12, color: 'var(--t3)' }}>Hjelper oss å forstå besøksmønstre anonymt.</p>
              </div>
              <input
                type="checkbox"
                checked={consent.analytics}
                onChange={e => setConsent(c => ({ ...c, analytics: e.target.checked }))}
                aria-label="Godta analyse-cookies"
                style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, accentColor: 'var(--gold)', cursor: 'pointer' }}
              />
            </div>

            {/* Markedsføring */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 2 }}>Markedsføring</p>
                <p style={{ fontSize: 12, color: 'var(--t3)' }}>Brukes for målrettet annonsering.</p>
              </div>
              <input
                type="checkbox"
                checked={consent.marketing}
                onChange={e => setConsent(c => ({ ...c, marketing: e.target.checked }))}
                aria-label="Godta markedsføringscookies"
                style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, accentColor: 'var(--gold)', cursor: 'pointer' }}
              />
            </div>

            <button
              onClick={() => save(consent)}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: 'var(--gold)', textDecoration: 'underline', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Lagre mine valg
            </button>
          </div>
        )}

        {/* Knapper — lik visuell vekt: GDPR-krav */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => save({ analytics: false, marketing: false })}
            style={{ ...btnBase, background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)' }}
          >
            Avvis alle
          </button>
          <button
            onClick={() => setShowDetails(v => !v)}
            style={{ ...btnBase, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--t2)' }}
          >
            {showDetails ? 'Skjul detaljer' : 'Tilpass'}
          </button>
          <button
            onClick={() => save({ analytics: true, marketing: true })}
            style={{ ...btnBase, background: 'var(--gold)', border: '1px solid var(--gold)', color: '#0d0c0a' }}
          >
            Godta alle
          </button>
        </div>
      </div>
    </div>
  )
}
