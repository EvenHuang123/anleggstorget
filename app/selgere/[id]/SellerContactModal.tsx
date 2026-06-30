'use client'

import { useState } from 'react'
import { X, MessageSquare, CheckCircle } from 'lucide-react'

interface Props {
  sellerId: string
  sellerName: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 3,
  padding: '9px 12px',
  color: 'var(--t1)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function SellerContactModal({ sellerId, sellerName }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/send-seller-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, ...form }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Noe gikk galt')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setError(null)
    if (sent) {
      setSent(false)
      setForm({ name: '', email: '', company: '', phone: '', message: '' })
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'var(--gold)', color: '#0d0c0a',
          border: 'none', borderRadius: 4, padding: '13px 20px',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 14,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          cursor: 'pointer', transition: 'opacity 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
      >
        <MessageSquare size={14} /> Ta kontakt
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ta kontakt med ${sellerName}`}
          style={{
            position: 'fixed', inset: 0, zIndex: 900,
            background: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div style={{
            background: 'var(--bg2)', borderRadius: 4,
            border: '1px solid var(--border)',
            width: '100%', maxWidth: 480,
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--t3)', marginBottom: 2 }}>
                  Kontakt selger
                </p>
                <h2 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 800, fontSize: 18, color: 'var(--t1)', margin: 0,
                }}>
                  {sellerName}
                </h2>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                  <CheckCircle size={40} style={{ color: 'var(--gold)', marginBottom: 12 }} />
                  <h3 style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700, fontSize: 20, color: 'var(--t1)', marginBottom: 8,
                  }}>
                    Melding sendt!
                  </h3>
                  <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                    {sellerName} vil ta kontakt med deg snarest.
                  </p>
                  <button
                    onClick={handleClose}
                    style={{
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 4, padding: '10px 24px',
                      color: 'var(--t2)', fontSize: 13, cursor: 'pointer',
                      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}
                  >
                    Lukk
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t3)', marginBottom: 5 }}>
                        Navn *
                      </label>
                      <input name="name" value={form.name} onChange={handleChange} required placeholder="Ditt navn" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t3)', marginBottom: 5 }}>
                        Bedrift
                      </label>
                      <input name="company" value={form.company} onChange={handleChange} placeholder="Bedriftnavn" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t3)', marginBottom: 5 }}>
                        E-post *
                      </label>
                      <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="din@bedrift.no" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t3)', marginBottom: 5 }}>
                        Telefon
                      </label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="+47 000 00 000" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t3)', marginBottom: 5 }}>
                      Melding *
                    </label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange}
                      required placeholder={`Hva ønsker du å spørre ${sellerName} om?`}
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                    />
                  </div>

                  {error && <p style={{ fontSize: 13, color: '#e57373', margin: 0 }}>{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: 4,
                      background: loading ? 'var(--bg4)' : 'var(--gold)',
                      color: loading ? 'var(--t3)' : '#0d0c0a',
                      border: 'none', borderRadius: 4, padding: '13px 20px',
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700, fontSize: 14,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {loading ? 'Sender…' : 'Send melding'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
