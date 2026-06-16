'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPassordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [ready, setReady]           = useState(false)
  const [expired, setExpired]       = useState(false)
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState('')

  // Supabase automatically exchanges the #access_token hash when the page loads.
  // PASSWORD_RECOVERY fires once the session is established from the reset link.
  useEffect(() => {
    let recovered = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string) => {
        if (event === 'PASSWORD_RECOVERY') {
          recovered = true
          setReady(true)
        }
      }
    )

    // In case the hash was already exchanged before the listener attached
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { recovered = true; setReady(true) }
    })

    // If no recovery event within 5 seconds, assume link is invalid/expired
    const timer = setTimeout(() => {
      if (!recovered) setExpired(true)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Passordet må være minst 8 tegn.')
      return
    }
    if (password !== confirm) {
      setError('Passordene stemmer ikke overens.')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError('Kunne ikke oppdatere passordet. Lenken kan ha utløpt — be om en ny.')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/logg-inn'), 2000)
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (success) {
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
            fontWeight: 700, fontSize: 26, color: 'var(--t1)', marginBottom: 10,
          }}>
            Passord oppdatert!
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6 }}>
            Du blir sendt til innloggingssiden…
          </p>
        </div>
      </div>
    )
  }

  // ── Expired / invalid link ────────────────────────────────────────────────

  if (expired) {
    return (
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 4, padding: '48px 40px', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.25)',
            margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertCircle size={28} style={{ color: '#ef4444' }} />
          </div>
          <h1 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 26, color: 'var(--t1)', marginBottom: 10,
          }}>
            Lenken er ugyldig
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Tilbakestillingslenken er utløpt eller allerede brukt. Be om en ny lenke.
          </p>
          <Link href="/glemt-passord" className="btn-primary" style={{ justifyContent: 'center', display: 'flex' }}>
            Be om ny lenke
          </Link>
        </div>
      </div>
    )
  }

  // ── Loading (waiting for token exchange) ──────────────────────────────────

  if (!ready) {
    return (
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 4, padding: '48px 40px', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            width: 32, height: 32, border: '3px solid var(--border)',
            borderTopColor: 'var(--gold)', borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--t3)', fontSize: 14 }}>Verifiserer lenke…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Reset form ────────────────────────────────────────────────────────────

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 4, padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, background: 'var(--gold)',
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 22, color: '#0d0c0a' }}>M</span>
          </div>
          <h1 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 26,
            color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            Nytt passord
          </h1>
          <p style={{ color: 'var(--t3)', fontSize: 13 }}>
            Velg et nytt passord for din konto
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 3, padding: '10px 14px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: '#ef4444', fontSize: 13, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New password */}
          <div style={{ marginBottom: 16 }}>
            <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Nytt passord</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--t3)', pointerEvents: 'none',
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minst 8 tegn"
                className="input-base"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                required
                minLength={8}
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 0,
                }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div style={{ marginBottom: 24 }}>
            <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Bekreft passord</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--t3)', pointerEvents: 'none',
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Gjenta passordet"
                className="input-base"
                style={{ paddingLeft: 36 }}
                required
                autoComplete="new-password"
              />
            </div>
            {confirm && password !== confirm && (
              <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>Passordene stemmer ikke</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 13 }}
            disabled={loading}
          >
            {loading ? 'Oppdaterer…' : 'Oppdater passord'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link
            href="/logg-inn"
            style={{ fontSize: 13, color: 'var(--t3)', textDecoration: 'none' }}
          >
            Tilbake til innlogging
          </Link>
        </div>
      </div>
    </div>
  )
}
