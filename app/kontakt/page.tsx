'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'

interface FormState {
  name: string
  email: string
  company: string
  phone: string
  message: string
}

export default function KontaktPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ name: '', email: '', company: '', phone: '', message: '' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!sent) return
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    const redirect = setTimeout(() => router.push('/'), 5000)
    return () => { clearInterval(t); clearTimeout(redirect) }
  }, [sent, router])

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Navn, e-post og melding er påkrevd.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Skriv inn en gyldig e-postadresse.')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Noe gikk galt. Prøv igjen.'); return }
      setSent(true)
    } catch {
      setError('Nettverksfeil. Sjekk internett og prøv igjen.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>

        {/* Hero header */}
        <div style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '48px 24px',
        }}>
          <div className="container-main" style={{ maxWidth: 1000 }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>
              Kontakt
            </p>
            <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,5vw,42px)', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--t1)', margin: 0 }}>
              Kontakt oss
            </h1>
          </div>
        </div>

        <div className="container-main" style={{ maxWidth: 1000, padding: '56px 24px 100px' }}>
          {sent ? (
            <SuccessState countdown={countdown} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 56 }} className="contact-grid">

              {/* Left: contact info */}
              <div>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--t1)', marginBottom: 24 }}>
                  Kom i kontakt
                </h2>
                <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                  Har du spørsmål om Anleggstorget, teknisk support, eller ønsker du å samarbeide? Vi hjelper gjerne!
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                  <ContactRow icon={Mail} label="E-post" value="kontakt@anleggstorget.no" href="mailto:kontakt@anleggstorget.no" />
                  <ContactRow icon={MapPin} label="Sted" value="Oslo, Norge" />
                </div>

                <div style={{
                  background: 'var(--bg2)', border: '1px solid rgba(200,149,58,0.3)',
                  borderLeft: '3px solid var(--gold)',
                  borderRadius: '0 4px 4px 0', padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Clock size={13} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)' }}>
                      Svartid
                    </span>
                  </div>
                  <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    Vi svarer som regel innen <strong style={{ color: 'var(--t1)' }}>24 timer</strong> på hverdager.
                  </p>
                </div>
              </div>

              {/* Right: form */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '32px 28px' }}>
                <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--t1)', marginBottom: 24 }}>
                  Send en melding
                </h2>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 3, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-row">
                    <Field label="Navn *" type="text" value={form.name} onChange={set('name')} placeholder="Ola Nordmann" required />
                    <Field label="E-post *" type="email" value={form.email} onChange={set('email')} placeholder="ola@bedrift.no" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-row">
                    <Field label="Bedrift" type="text" value={form.company} onChange={set('company')} placeholder="Bedrift AS" />
                    <Field label="Telefon" type="tel" value={form.phone} onChange={set('phone')} placeholder="+47 000 00 000" />
                  </div>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Melding *</label>
                    <textarea
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Skriv din melding her..."
                      rows={6}
                      required
                      style={{
                        width: '100%', resize: 'vertical', minHeight: 140,
                        background: 'var(--bg3)', border: '1px solid var(--border2)',
                        borderRadius: 3, padding: '12px 14px',
                        color: 'var(--t1)', fontSize: 14, fontFamily: 'Barlow, sans-serif',
                        lineHeight: 1.6, outline: 'none', boxSizing: 'border-box',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,149,58,0.5)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border2)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary"
                    style={{ justifyContent: 'center', height: 48, fontSize: 14, opacity: sending ? 0.7 : 1 }}
                  >
                    <Send size={15} />
                    {sending ? 'Sender...' : 'Send melding'}
                  </button>

                  <p style={{ color: 'var(--t3)', fontSize: 12, textAlign: 'center', margin: 0 }}>
                    Vi behandler dine data i henhold til vår{' '}
                    <Link href="/personvern" style={{ color: 'var(--gold)', textDecoration: 'none' }}>personvernerklæring</Link>.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}

function Field({ label, type, value, onChange, placeholder, required }: {
  label: string; type: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input-base"
      />
    </div>
  )
}

function ContactRow({ icon: Icon, label, value, href }: {
  icon: typeof Mail; label: string; value: string; href?: string
}) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 4, flexShrink: 0,
        background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color: 'var(--gold)' }} />
      </div>
      <div>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--t3)', margin: '0 0 2px' }}>{label}</p>
        {href
          ? <a href={href} style={{ color: 'var(--t1)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>{value}</a>
          : <p style={{ color: 'var(--t1)', fontSize: 14, fontWeight: 500, margin: 0 }}>{value}</p>
        }
      </div>
    </div>
  )
}

function SuccessState({ countdown }: { countdown: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <CheckCircle2 size={38} style={{ color: '#4ade80' }} />
      </div>
      <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 28, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--t1)', marginBottom: 12 }}>
        Melding sendt!
      </h2>
      <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 8 }}>
        Takk for at du tok kontakt. Vi svarer som regel innen 24 timer.
      </p>
      <p style={{ color: 'var(--t3)', fontSize: 13 }}>
        Sender deg til forsiden om {countdown} sekund{countdown !== 1 ? 'er' : ''}...
      </p>
      <style>{`@keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  )
}
