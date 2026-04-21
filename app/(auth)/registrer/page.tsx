'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, CheckCircle, Building2, Hash, User, Phone, Mail, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

async function lookupOrgNumber(orgNr: string): Promise<{ name: string; valid: boolean; error?: string }> {
  const cleaned = orgNr.replace(/\s/g, '')
  if (!/^\d{9}$/.test(cleaned)) {
    return { name: '', valid: false, error: 'Organisasjonsnummer må være nøyaktig 9 siffer' }
  }
  try {
    const res = await fetch('/api/verify-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgNumber: cleaned }),
    })
    const data = await res.json()
    return { name: data.name ?? '', valid: data.valid, error: data.error }
  } catch {
    return { name: '', valid: false, error: 'Kunne ikke verifisere. Prøv igjen.' }
  }
}

export default function RegistrerPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [orgNumber, setOrgNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [orgVerified, setOrgVerified] = useState(false)
  const [orgChecking, setOrgChecking] = useState(false)
  const [orgError, setOrgError] = useState('')

  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOrgLookup = async () => {
    setOrgError('')
    setOrgVerified(false)
    setCompanyName('')
    setOrgChecking(true)
    const result = await lookupOrgNumber(orgNumber)
    setOrgChecking(false)
    if (result.valid) {
      setCompanyName(result.name)
      setOrgVerified(true)
      toast.success(`Fant: ${result.name}`)
    } else {
      setOrgError(result.error || 'Ugyldig organisasjonsnummer')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgVerified) { setError('Verifiser organisasjonsnummeret først.'); return }
    if (!agree) { setError('Du må godta vilkårene for å fortsette.'); return }
    setError('')
    setLoading(true)

    const { error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          company_name: companyName,
          org_number: orgNumber.replace(/\s/g, ''),
          contact_person: contactPerson || null,
          phone: phone || null,
        },
      },
    })

    setLoading(false)

    if (authErr) {
      setError(authErr.message || 'Registrering feilet. Prøv igjen.')
      return
    }

    router.push('/registrer/bekreft')
  }

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 4, padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 26,
            color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            Registrer bedrift
          </h1>
          <p style={{ color: 'var(--t3)', fontSize: 13 }}>
            Opprett din bedriftskonto på Anleggstorget
          </p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`step-indicator ${s === step ? 'step-active' : s < step ? 'step-done' : 'step-pending'}`}>
                {s}
              </div>
              <span style={{ fontSize: 12, color: s === step ? 'var(--t1)' : 'var(--t3)' }}>
                {s === 1 ? 'Bedrift' : 'Konto'}
              </span>
              {s < 2 && <div style={{ width: 24, height: 1, background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 3, padding: '10px 14px', marginBottom: 20,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>
          </div>
        )}

        {step === 1 ? (
          <div>
            {/* Org number lookup */}
            <div style={{ marginBottom: 20 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Organisasjonsnummer *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Hash size={14} style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--t3)', pointerEvents: 'none',
                  }} />
                  <input
                    type="text"
                    value={orgNumber}
                    onChange={e => { setOrgNumber(e.target.value); setOrgVerified(false); setOrgError('') }}
                    onBlur={() => {
                      if (orgNumber.replace(/\s/g, '').length === 9 && !orgVerified) {
                        handleOrgLookup()
                      }
                    }}
                    placeholder="123 456 789"
                    className="input-base"
                    style={{ paddingLeft: 36 }}
                    maxLength={11}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleOrgLookup}
                  disabled={orgChecking || orgNumber.replace(/\s/g, '').length < 9}
                  className="btn-secondary"
                  style={{ padding: '0 16px', flexShrink: 0, height: 44 }}
                >
                  {orgChecking
                    ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Sjekker...</>
                    : 'Verifiser'
                  }
                </button>
              </div>
              {orgError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{orgError}</p>}
            </div>

            {/* Company name (auto-filled) */}
            <div style={{ marginBottom: 20 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Bedriftsnavn</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={14} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: orgVerified ? 'var(--gold)' : 'var(--t3)', pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Automatisk utfylt ved verifisering"
                  className="input-base"
                  style={{
                    paddingLeft: 36,
                    borderColor: orgVerified ? 'rgba(200,149,58,0.4)' : undefined,
                  }}
                />
                {orgVerified && (
                  <CheckCircle size={14} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--gold)', pointerEvents: 'none',
                  }} />
                )}
              </div>
              {orgVerified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <CheckCircle size={12} style={{ color: '#4ade80' }} />
                  <p style={{ color: '#4ade80', fontSize: 12 }}>Verifisert mot Brønnøysundregistrene</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Kontaktperson</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Ola Nordmann" className="input-base" style={{ paddingLeft: 36 }} />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Telefon</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+47 000 00 000" className="input-base" style={{ paddingLeft: 36 }} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => { if (!orgVerified) { setError('Verifiser org.nr. først'); return }; setError(''); setStep(2) }}
              className="btn-primary"
              disabled={orgChecking || !orgVerified}
              style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 13, opacity: (!orgVerified || orgChecking) ? 0.5 : 1 }}
            >
              Neste →
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: 16 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>E-post *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="bedrift@eksempel.no" className="input-base" style={{ paddingLeft: 36 }} required autoComplete="email" />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Passord *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minst 8 tegn"
                  className="input-base"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  required minLength={8}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 0 }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 6, display: 'flex', gap: 3 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 2, borderRadius: 1,
                      background: password.length >= (i + 1) * 2
                        ? i < 2 ? '#ef4444' : i < 3 ? 'var(--gold)' : '#4ade80'
                        : 'var(--bg5)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                className="checkbox-gold"
                style={{ marginTop: 2 }}
              />
              <span style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>
                Jeg godtar{' '}
                <Link href="/vilkar" style={{ color: 'var(--gold)', textDecoration: 'none' }}>vilkårene</Link>
                {' '}og{' '}
                <Link href="/personvern" style={{ color: 'var(--gold)', textDecoration: 'none' }}>personvernerklæringen</Link>
              </span>
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: '0 0 auto', height: 46 }}>
                ← Tilbake
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', height: 46, fontSize: 13 }}
                disabled={loading}
              >
                {loading ? 'Oppretter konto...' : 'Opprett bedriftskonto'}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--t2)', marginTop: 24 }}>
          Har du konto?{' '}
          <Link href="/logg-inn" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>
            Logg inn
          </Link>
        </p>
      </div>
    </div>
  )
}
