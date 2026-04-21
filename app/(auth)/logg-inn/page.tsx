'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function LoggInnForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError('Ugyldig e-post eller passord. Sjekk opplysningene og prøv igjen.')
    } else {
      toast.success('Innlogget!')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {/* Card */}
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
            Logg inn
          </h1>
          <p style={{ color: 'var(--t3)', fontSize: 13 }}>
            Tilgang til din bedriftskonto på Anleggstorget
          </p>
        </div>

        {/* URL error (e.g. confirmation_failed) */}
        {urlError === 'confirmation_failed' && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 3, padding: '10px 14px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: '#ef4444', fontSize: 13, lineHeight: 1.5 }}>
              E-postbekreftelse feilet. Prøv å registrere deg på nytt.
            </p>
          </div>
        )}

        {/* Form error */}
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

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>E-post</label>
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
                className="input-base"
                style={{ paddingLeft: 36 }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="label-sm">Passord</label>
              <Link href="/glemt-passord" style={{ fontSize: 12, color: 'var(--t3)', textDecoration: 'none' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--t3)')}
              >
                Glemt passord?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--t3)', pointerEvents: 'none',
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)',
                  padding: 0,
                }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 13 }}
            disabled={loading}
          >
            {loading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--t3)', fontSize: 12 }}>eller</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--t2)' }}>
          Ny bedrift?{' '}
          <Link href="/registrer" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--gold2)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--gold)')}
          >
            Registrer deg gratis
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoggInnPage() {
  return (
    <Suspense>
      <LoggInnForm />
    </Suspense>
  )
}
