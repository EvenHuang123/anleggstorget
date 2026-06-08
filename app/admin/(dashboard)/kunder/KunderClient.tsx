'use client'

import { useState, useTransition } from 'react'
import { Search, Plus, CheckCircle, XCircle, X, Copy, Check, RefreshCcw } from 'lucide-react'

interface CustomerRow {
  id: string
  company_name: string
  org_number: string
  email: string
  contact_person: string | null
  phone: string | null
  verified: boolean
  created_at: string
  activeListings: number
}

interface CreateForm {
  companyName: string
  orgNumber: string
  email: string
  password: string
  contactPerson: string
  phone: string
}

const EMPTY_FORM: CreateForm = { companyName: '', orgNumber: '', email: '', password: '', contactPerson: '', phone: '' }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#'
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function KunderClient({ initialRows }: { initialRows: CustomerRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [success, setSuccess] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [orgLoading, setOrgLoading] = useState(false)
  const [, startTransition] = useTransition()

  const filtered = rows.filter(r =>
    r.company_name.toLowerCase().includes(search.toLowerCase()) ||
    r.org_number.includes(search) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleVerifyOrg = async () => {
    if (form.orgNumber.replace(/\s/g, '').length < 9) return
    setOrgLoading(true)
    try {
      const res = await fetch(`/api/verify-org?org=${form.orgNumber.replace(/\s/g, '')}`)
      if (res.ok) {
        const data = await res.json()
        if (data.navn) setForm(f => ({ ...f, companyName: data.navn }))
      }
    } catch { /* ignore */ }
    setOrgLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email, password: form.password,
          companyName: form.companyName, orgNumber: form.orgNumber,
          contactPerson: form.contactPerson || undefined,
          phone: form.phone || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); return }

      // Add to local rows
      const newRow: CustomerRow = {
        id: data.userId, company_name: form.companyName, org_number: form.orgNumber,
        email: form.email, contact_person: form.contactPerson || null,
        phone: form.phone || null, verified: true,
        created_at: new Date().toISOString(), activeListings: 0,
      }
      setRows(r => [newRow, ...r])
      setSuccess({ email: form.email, password: form.password })
      setForm(EMPTY_FORM)
    } catch {
      setFormError('Nettverksfeil')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleVerified = async (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await fetch('/api/admin/toggle-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, verified: !current }),
      })
      if (res.ok) setRows(rows => rows.map(r => r.id === id ? { ...r, verified: !current } : r))
    })
  }

  const copyCredentials = () => {
    if (!success) return
    navigator.clipboard.writeText(`E-post: ${success.email}\nPassord: ${success.password}\nURL: https://anleggstorget.no/logg-inn`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const s = {
    th: { padding: '10px 16px', textAlign: 'left' as const, color: '#8b949e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const },
    td: { padding: '12px 16px', fontSize: 14, color: '#e6edf3', borderTop: '1px solid #21262d' },
    label: { display: 'block', color: '#8b949e', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
    input: { width: '100%', height: 38, padding: '0 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Kunder
          </h1>
          <p style={{ margin: '4px 0 0', color: '#8b949e', fontSize: 13 }}>{rows.length} registrerte bedrifter</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setSuccess(null); setFormError('') }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#238636', border: '1px solid rgba(240,246,252,0.1)', borderRadius: 6, color: '#e6edf3', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 16px' }}
        >
          <Plus size={14} /> Opprett ny kunde
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', pointerEvents: 'none' }} />
        <input
          type="text" placeholder="Søk på navn, org.nr eller e-post..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...s.input, paddingLeft: 34, height: 38 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d' }}>
              <th style={s.th}>Bedrift</th>
              <th style={s.th}>Org.nr</th>
              <th style={s.th}>E-post</th>
              <th style={s.th}>Verifisert</th>
              <th style={s.th}>Aktive annonser</th>
              <th style={s.th}>Registrert</th>
              <th style={s.th}>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#8b949e', padding: '32px 16px' }}>
                {search ? 'Ingen treff' : 'Ingen kunder ennå'}
              </td></tr>
            )}
            {filtered.map(row => (
              <tr key={row.id} style={{ transition: 'background 0.1s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#21262d22')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{row.company_name}</div>
                  {row.contact_person && <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{row.contact_person}</div>}
                </td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 13 }}>{row.org_number}</td>
                <td style={{ ...s.td, color: '#8b949e' }}>{row.email}</td>
                <td style={s.td}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: row.verified ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
                    color: row.verified ? '#3fb950' : '#f85149',
                    border: `1px solid ${row.verified ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
                    borderRadius: 4, fontSize: 12, fontWeight: 600, padding: '3px 8px',
                  }}>
                    {row.verified ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {row.verified ? 'Ja' : 'Nei'}
                  </span>
                </td>
                <td style={{ ...s.td, color: row.activeListings > 0 ? '#e6edf3' : '#8b949e' }}>{row.activeListings}</td>
                <td style={{ ...s.td, color: '#8b949e', fontSize: 13 }}>{fmtDate(row.created_at)}</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleToggleVerified(row.id, row.verified)}
                      style={{
                        background: 'none', border: '1px solid #30363d', borderRadius: 5,
                        color: '#8b949e', fontSize: 12, cursor: 'pointer', padding: '4px 10px',
                      }}
                      title={row.verified ? 'Fjern verifisering' : 'Verifiser'}
                    >
                      {row.verified ? 'Avverifiser' : 'Verifiser'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(1,4,9,0.8)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setSuccess(null) } }}
        >
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 10,
            padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e6edf3', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase' }}>
                Opprett ny kunde
              </h2>
              <button onClick={() => { setShowModal(false); setSuccess(null) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div>
                <div style={{ background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                  <p style={{ color: '#3fb950', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={16} /> Kunde opprettet
                  </p>
                  <p style={{ color: '#e6edf3', fontSize: 13, marginBottom: 4 }}>E-post: <strong>{success.email}</strong></p>
                  <p style={{ color: '#e6edf3', fontSize: 13, margin: 0 }}>Passord: <strong style={{ fontFamily: 'monospace' }}>{success.password}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={copyCredentials} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: copied ? '#238636' : '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '9px 0' }}>
                    {copied ? <><Check size={13} /> Kopiert!</> : <><Copy size={13} /> Kopier innloggingsdetaljer</>}
                  </button>
                  <button onClick={() => { setSuccess(null); setShowModal(false) }} style={{ flex: 1, background: '#388bfd', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '9px 0' }}>
                    Ferdig
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                {formError && (
                  <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 6, padding: '10px 14px', marginBottom: 16, color: '#f85149', fontSize: 13 }}>
                    {formError}
                  </div>
                )}

                {/* Org nr row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 14 }}>
                  <div>
                    <label style={s.label}>Organisasjonsnummer *</label>
                    <input value={form.orgNumber} onChange={e => setForm(f => ({ ...f, orgNumber: e.target.value }))}
                      placeholder="123 456 789" style={s.input} required minLength={9} />
                  </div>
                  <div style={{ alignSelf: 'flex-end' }}>
                    <button type="button" onClick={handleVerifyOrg} disabled={orgLoading}
                      style={{ height: 38, padding: '0 12px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {orgLoading ? <RefreshCcw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                      Hent navn
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>Bedriftsnavn *</label>
                  <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                    placeholder="AS Eksempel" style={s.input} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={s.label}>Kontaktperson</label>
                    <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                      placeholder="Ola Nordmann" style={s.input} />
                  </div>
                  <div>
                    <label style={s.label}>Telefon</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+47 99 99 99 99" style={s.input} />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>E-postadresse *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="kontakt@bedrift.no" style={s.input} required />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={s.label}>Midlertidig passord *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Minst 8 tegn" style={{ ...s.input, flex: 1 }} required minLength={8} />
                    <button type="button" onClick={() => setForm(f => ({ ...f, password: generatePassword() }))}
                      style={{ padding: '0 12px', background: '#21262d', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Generer
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ flex: 1, background: 'none', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 13, cursor: 'pointer', padding: '9px 0' }}>
                    Avbryt
                  </button>
                  <button type="submit" disabled={formLoading}
                    style={{ flex: 2, background: formLoading ? '#21262d' : '#238636', border: 'none', borderRadius: 6, color: '#e6edf3', fontSize: 13, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', padding: '9px 0' }}>
                    {formLoading ? 'Oppretter...' : 'Opprett kunde'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
