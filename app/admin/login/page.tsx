'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, User, ShieldCheck } from 'lucide-react'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        router.push(from)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Innlogging feilet')
      }
    } catch {
      setError('Nettverksfeil, prøv igjen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Barlow, system-ui, sans-serif',
    }}>
      <meta name="robots" content="noindex" />
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, background: '#388bfd',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <ShieldCheck size={24} color="#fff" />
          </div>
          <h1 style={{
            color: '#e6edf3', fontSize: 22, fontWeight: 700,
            letterSpacing: '0.03em', textTransform: 'uppercase', margin: 0,
            fontFamily: 'Barlow Condensed, sans-serif',
          }}>
            Anleggstorget Admin
          </h1>
          <p style={{ color: '#8b949e', fontSize: 13, marginTop: 6 }}>
            Intern administrasjon
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#161b22', border: '1px solid #30363d',
          borderRadius: 8, padding: '32px 28px',
        }}>
          {error && (
            <div style={{
              background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)',
              borderRadius: 6, padding: '10px 14px', marginBottom: 20,
              color: '#f85149', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#8b949e', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Brukernavn
              </label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="brukernavn"
                  autoComplete="username"
                  required
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: 12, height: 40,
                    background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
                    color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#388bfd')}
                  onBlur={e => (e.target.style.borderColor = '#30363d')}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#8b949e', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Passord
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%', paddingLeft: 36, paddingRight: 40, height: 40,
                    background: '#0d1117', border: '1px solid #30363d', borderRadius: 6,
                    color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#388bfd')}
                  onBlur={e => (e.target.style.borderColor = '#30363d')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 0 }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 40, background: loading ? '#21262d' : '#238636',
                border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6,
                color: '#e6edf3', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => { if (!loading) (e.currentTarget.style.background = '#2ea043') }}
              onMouseOut={e => { if (!loading) (e.currentTarget.style.background = '#238636') }}
            >
              {loading ? 'Logger inn...' : 'Logg inn'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  )
}
