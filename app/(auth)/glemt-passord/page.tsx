'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function GlemtPassordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/oppdater-passord`,
    })

    setLoading(false)
    if (error) {
      setError('Noe gikk galt. Sjekk at e-postadressen er riktig.')
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 4, padding: '48px 40px', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--gold3)', border: '2px solid rgba(200,149,58,0.4)',
            margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle2 size={28} style={{ color: 'var(--gold)' }} />
          </div>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 24, color: 'var(--t1)', marginBottom: 12,
          }}>
            Sjekk innboksen din
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Vi har sendt en lenke til <strong style={{ color: 'var(--t1)' }}>{email}</strong> for å tilbakestille passordet ditt.
          </p>
          <Link href="/logg-inn" className="btn-secondary" style={{ justifyContent: 'center' }}>
            Tilbake til innlogging
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 4, padding: '48px 40px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.3)',
          margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mail size={22} style={{ color: 'var(--gold)' }} />
        </div>

        <h1 style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 26, color: 'var(--t1)',
          textAlign: 'center', marginBottom: 8,
        }}>
          Glemt passord?
        </h1>
        <p style={{ color: 'var(--t2)', fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
          Skriv inn e-postadressen din, så sender vi deg en lenke for å tilbakestille passordet.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label className="label-sm" style={{ marginBottom: 6, display: 'block' }}>E-postadresse</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--t3)', pointerEvents: 'none',
              }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="bedrift@eksempel.no"
                required
                className="input"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
          >
            {loading ? 'Sender…' : 'Send tilbakestillingslenke'}
          </button>

          <Link
            href="/logg-inn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 13, color: 'var(--t3)', textDecoration: 'none',
            }}
          >
            <ArrowLeft size={13} /> Tilbake til innlogging
          </Link>
        </form>
      </div>
    </div>
  )
}
