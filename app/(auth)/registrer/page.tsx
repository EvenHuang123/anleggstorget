'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye, EyeOff, AlertCircle, CheckCircle2, Building2, Hash,
  User, Phone, Mail, Lock, Loader2, Shield, FileCheck,
} from 'lucide-react'
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

const STEPS = [
  { num: 1, label: 'Verifiser' },
  { num: 2, label: 'Bedrift' },
  { num: 3, label: 'Konto' },
]

export default function RegistrerPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [orgNumber, setOrgNumber] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [orgVerified, setOrgVerified] = useState(false)
  const [orgChecking, setOrgChecking] = useState(false)
  const [orgError, setOrgError] = useState('')

  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
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
          bio: bio || null,
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

  const goToStep2 = () => {
    if (!orgVerified) { setOrgError('Verifiser org.nr. først'); return }
    setError('')
    setStep(2)
  }

  const goToStep3 = () => {
    setError('')
    setStep(3)
  }

  const passwordStrength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : password.length < 14 ? 3
    : 4

  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
        {STEPS.map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: step > s.num ? 'var(--gold)' : step === s.num ? 'var(--gold)' : 'var(--bg3)',
                border: step >= s.num ? 'none' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 15,
                color: step >= s.num ? '#0d0c0a' : 'var(--t3)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}>
                {step > s.num ? <CheckCircle2 size={17} /> : s.num}
              </div>
              <span style={{
                fontFamily: 'Barlow Condensed', fontSize: 11,
                fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: step >= s.num ? 'var(--gold)' : 'var(--t3)',
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 80, height: 2, marginTop: 17, flexShrink: 0,
                background: step > s.num ? 'var(--gold)' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 4, padding: '40px 40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Step heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{
            fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: 8,
          }}>
            Trinn {step} av 3
          </p>
          <h1 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 28,
            color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            {step === 1 && 'Verifiser bedrift'}
            {step === 2 && 'Bedriftsinformasjon'}
            {step === 3 && 'Opprett konto'}
          </h1>
          <p style={{ color: 'var(--t3)', fontSize: 13 }}>
            {step === 1 && 'Vi sjekker mot Brønnøysundregisteret automatisk'}
            {step === 2 && 'Kontaktinformasjon for din bedrift'}
            {step === 3 && 'E-post og passord for innlogging'}
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
            <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>
          </div>
        )}

        {/* ── STEP 1: Brønnøysund verification ── */}
        {step === 1 && (
          <div>
            {/* Verification badge */}
            <div style={{
              background: 'var(--bg3)',
              border: '1px solid rgba(200,149,58,0.25)',
              borderRadius: 4,
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 28,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 4, flexShrink: 0,
                background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileCheck size={20} style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <p style={{
                  fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--t1)', marginBottom: 2,
                }}>
                  Brønnøysundregisteret
                </p>
                <p style={{ color: 'var(--t3)', fontSize: 12, lineHeight: 1.4 }}>
                  Alle bedrifter verifiseres mot offentlig register. Kun aktive norske bedrifter godkjennes.
                </p>
              </div>
            </div>

            {/* Org number input */}
            <div style={{ marginBottom: 20 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>
                Organisasjonsnummer *
              </label>
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
                      if (orgNumber.replace(/\s/g, '').length === 9 && !orgVerified) handleOrgLookup()
                    }}
                    placeholder="123 456 789"
                    className="input-base"
                    style={{
                      paddingLeft: 36, height: 48,
                      borderColor: orgVerified ? 'rgba(74,222,128,0.4)' : orgError ? 'rgba(239,68,68,0.4)' : undefined,
                    }}
                    maxLength={11}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleOrgLookup}
                  disabled={orgChecking || orgNumber.replace(/\s/g, '').length < 9}
                  className="btn-secondary"
                  style={{ padding: '0 20px', flexShrink: 0, height: 48 }}
                >
                  {orgChecking
                    ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Sjekker</>
                    : 'Verifiser'}
                </button>
              </div>
              {orgError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <AlertCircle size={12} style={{ color: '#ef4444' }} />
                  <p style={{ color: '#ef4444', fontSize: 12 }}>{orgError}</p>
                </div>
              )}
            </div>

            {/* Success state */}
            {orgVerified && (
              <div style={{
                background: 'rgba(74,222,128,0.07)',
                border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 4, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 24,
              }}>
                <CheckCircle2 size={22} style={{ color: '#4ade80', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: '#4ade80', marginBottom: 2 }}>
                    Bedrift verifisert
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--t1)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                    {companyName}
                  </p>
                </div>
              </div>
            )}

            {/* Trust signals */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12,
              marginBottom: 28,
              padding: '20px 0 0',
              borderTop: '1px solid var(--border)',
            }}>
              {[
                { icon: Shield, label: '100%', sub: 'Verifiserte bedrifter' },
                { icon: Lock, label: 'GDPR', sub: 'Compliant' },
                { icon: FileCheck, label: 'Gratis', sub: 'Ingen provisjon' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px',
                  }}>
                    <Icon size={16} style={{ color: 'var(--gold)' }} />
                  </div>
                  <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 11, color: 'var(--t3)' }}>{sub}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={goToStep2}
              className="btn-primary"
              disabled={!orgVerified || orgChecking}
              style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 14, opacity: (!orgVerified || orgChecking) ? 0.45 : 1 }}
            >
              Neste: Bedriftsinformasjon →
            </button>
          </div>
        )}

        {/* ── STEP 2: Contact info ── */}
        {step === 2 && (
          <div>
            {/* Auto-filled company name display */}
            <div style={{
              background: 'var(--bg3)', border: '1px solid rgba(200,149,58,0.2)',
              borderRadius: 4, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 28,
            }}>
              <Building2 size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 1 }}>Verifisert bedrift</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', fontFamily: 'Barlow Condensed' }}>{companyName}</p>
              </div>
              <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Kontaktperson</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="Ola Nordmann"
                  className="input-base"
                  style={{ paddingLeft: 36, height: 48 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Telefon</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+47 000 00 000"
                  className="input-base"
                  style={{ paddingLeft: 36, height: 48 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>
                Om bedriften <span style={{ color: 'var(--t3)', fontWeight: 400 }}>(valgfritt)</span>
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Fortell kort om bedriften din, hva dere spesialiserer dere på, erfaring, osv..."
                className="input-base"
                rows={4}
                maxLength={500}
                style={{ resize: 'vertical', minHeight: 96, paddingTop: 12, paddingBottom: 12, fontFamily: 'Barlow, sans-serif', lineHeight: 1.5 }}
              />
              <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4, textAlign: 'right' }}>{bio.length}/500</p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flexShrink: 0, height: 48, padding: '0 20px' }}>
                ← Tilbake
              </button>
              <button type="button" onClick={goToStep3} className="btn-primary" style={{ flex: 1, justifyContent: 'center', height: 48, fontSize: 14 }}>
                Neste: Opprett konto →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Credentials ── */}
        {step === 3 && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: 18 }}>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>E-post *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="bedrift@eksempel.no"
                  className="input-base"
                  style={{ paddingLeft: 36, height: 48 }}
                  required
                  autoComplete="email"
                />
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
                  style={{ paddingLeft: 36, paddingRight: 44, height: 48 }}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4 }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: passwordStrength >= i
                          ? i <= 1 ? '#ef4444' : i <= 2 ? 'var(--gold)' : i <= 3 ? 'var(--gold)' : '#4ade80'
                          : 'var(--bg4)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--t3)' }}>
                    {passwordStrength <= 1 ? 'For svakt' : passwordStrength === 2 ? 'Middels' : passwordStrength === 3 ? 'Bra' : 'Sterkt passord'}
                  </p>
                </div>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 28, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                className="checkbox-gold"
                style={{ marginTop: 2 }}
              />
              <span style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
                Jeg godtar{' '}
                <Link href="/vilkar" style={{ color: 'var(--gold)', textDecoration: 'none' }}>vilkårene</Link>
                {' '}og{' '}
                <Link href="/personvern" style={{ color: 'var(--gold)', textDecoration: 'none' }}>personvernerklæringen</Link>
              </span>
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ flexShrink: 0, height: 48, padding: '0 20px' }}>
                ← Tilbake
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', height: 48, fontSize: 14 }}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Oppretter konto...</>
                  : 'Opprett bedriftskonto'}
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
