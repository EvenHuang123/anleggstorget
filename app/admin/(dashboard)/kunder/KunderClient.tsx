'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, CheckCircle, XCircle, X, Copy, Check, RefreshCcw, Pencil, Eye, EyeOff, Trash2, AlertTriangle, Send } from 'lucide-react'

export interface CustomerRow {
  id: string
  company_name: string
  org_number: string
  email: string
  contact_person: string | null
  phone: string | null
  verified: boolean
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string | null
  activeListings: number
}

interface CreateForm {
  companyName: string; orgNumber: string; email: string
  password: string; contactPerson: string; phone: string
}

interface EditForm {
  companyName: string; orgNumber: string; email: string
  contactPerson: string; phone: string
  verified: boolean; active: boolean
  notes: string
  newPassword: string; confirmPassword: string
}

const EMPTY_CREATE: CreateForm = { companyName: '', orgNumber: '', email: '', password: '', contactPerson: '', phone: '' }

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#'
  return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }
function validateOrg(o: string) { return /^\d{9}$/.test(o.replace(/\s/g, '')) }

// ── Shared style tokens ───────────────────────────────────────────────────────

const S = {
  th:    { padding: '10px 16px', textAlign: 'left' as const, color: '#6B7280', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const },
  td:    { padding: '12px 16px', fontSize: 14, color: '#1A1A1A', borderTop: '1px solid #F3F4F6' },
  label: { display: 'block', color: '#6B7280', fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  input: { width: '100%', height: 38, padding: '0 12px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, color: '#1A1A1A', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  err:   { color: '#dc2626', fontSize: 12, marginTop: 4 },
}

// ── Form field wrapper — must be at module level, NOT inside any component ────
// Defining this inside a component causes React to treat it as a new type on
// every render, unmounting and remounting children (inputs lose focus).
function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
      {error && <p style={S.err}>{error}</p>}
    </div>
  )
}

// ── Modal backdrop ────────────────────────────────────────────────────────────

function Backdrop({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({ row, onClose, onSaved }: {
  row: CustomerRow
  onClose: () => void
  onSaved: (updated: Partial<CustomerRow>) => void
}) {
  const [form, setForm] = useState<EditForm>({
    companyName: row.company_name,
    orgNumber: row.org_number,
    email: row.email,
    contactPerson: row.contact_person ?? '',
    phone: row.phone ?? '',
    verified: row.verified,
    active: row.active,
    notes: row.notes ?? '',
    newPassword: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (key: keyof EditForm, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }))

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.companyName.trim()) errs.companyName = 'Påkrevd'
    if (!validateOrg(form.orgNumber)) errs.orgNumber = 'Må være 9 siffer'
    if (!validateEmail(form.email)) errs.email = 'Ugyldig e-postformat'
    if (form.newPassword && form.newPassword.length < 8) errs.newPassword = 'Minimum 8 tegn'
    if (form.newPassword && form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passordene stemmer ikke'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setApiError('')
    setLoading(true)

    const payload: Record<string, unknown> = {
      userId: row.id,
      companyName: form.companyName.trim(),
      orgNumber: form.orgNumber.replace(/\s/g, ''),
      contactPerson: form.contactPerson.trim() || null,
      phone: form.phone.trim() || null,
      verified: form.verified,
      active: form.active,
      notes: form.notes.trim() || null,
    }
    if (form.email !== row.email) payload.email = form.email.trim()
    if (form.newPassword) payload.password = form.newPassword

    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setApiError(data.error ?? 'Ukjent feil'); return }
      setSaved(true)
      onSaved({
        company_name: form.companyName.trim(),
        org_number: form.orgNumber.replace(/\s/g, ''),
        email: form.email.trim(),
        contact_person: form.contactPerson.trim() || null,
        phone: form.phone.trim() || null,
        verified: form.verified,
        active: form.active,
        notes: form.notes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      setTimeout(onClose, 1200)
    } catch {
      setApiError('Nettverksfeil')
    } finally {
      setLoading(false)
    }
  }

  const divider = <div style={{ height: 1, background: '#F3F4F6', margin: '16px 0' }} />

  return (
    <Backdrop onClose={onClose}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>
              {row.company_name}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 12 }}>
              Registrert: {fmtDate(row.created_at)}
              {row.updated_at && ` · Oppdatert: ${fmtDate(row.updated_at)}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {divider}

        <form onSubmit={handleSave} style={{ padding: '0 24px 24px' }}>
          {apiError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 18, color: '#dc2626', fontSize: 13 }}>
              {apiError}
            </div>
          )}

          {saved && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 18, color: '#16a34a', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle size={14} /> Endringer lagret
            </div>
          )}

          {/* Section: Bedriftsinformasjon */}
          <p style={{ margin: '0 0 12px', color: '#B45309', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Bedriftsinformasjon</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <F label="Bedriftsnavn *" error={fieldErrors.companyName}>
              <input value={form.companyName} onChange={e => set('companyName', e.target.value)}
                style={{ ...S.input, borderColor: fieldErrors.companyName ? '#fca5a5' : '#E5E7EB' }} />
            </F>
            <F label="Organisasjonsnummer *" error={fieldErrors.orgNumber}>
              <input value={form.orgNumber} onChange={e => set('orgNumber', e.target.value)}
                placeholder="123456789"
                style={{ ...S.input, fontFamily: 'monospace', borderColor: fieldErrors.orgNumber ? '#fca5a5' : '#E5E7EB' }} />
            </F>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <F label="Kontaktperson">
              <input value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)}
                placeholder="Ola Nordmann" style={S.input} />
            </F>
            <F label="Telefon">
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+47 99 99 99 99" style={S.input} />
            </F>
          </div>

          <div style={{ marginBottom: 20 }}>
            <F label="E-postadresse *" error={fieldErrors.email}>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                style={{ ...S.input, borderColor: fieldErrors.email ? '#fca5a5' : '#E5E7EB' }} />
            </F>
          </div>

          {divider}

          {/* Section: Kontostatus */}
          <p style={{ margin: '0 0 12px', color: '#B45309', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Kontostatus</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* Verifisert toggle */}
            <div>
              <label style={S.label}>Verifisert</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[true, false].map(v => (
                  <button key={String(v)} type="button" onClick={() => set('verified', v)}
                    style={{
                      flex: 1, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s',
                      background: form.verified === v ? (v ? '#f0fdf4' : '#fef2f2') : '#F9FAFB',
                      border: `1px solid ${form.verified === v ? (v ? '#86efac' : '#fca5a5') : '#E5E7EB'}`,
                      color: form.verified === v ? (v ? '#16a34a' : '#dc2626') : '#6B7280',
                    }}>
                    {v ? 'Ja' : 'Nei'}
                  </button>
                ))}
              </div>
            </div>

            {/* Aktiv toggle */}
            <div>
              <label style={S.label}>Konto aktiv</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[true, false].map(v => (
                  <button key={String(v)} type="button" onClick={() => set('active', v)}
                    style={{
                      flex: 1, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s',
                      background: form.active === v ? (v ? '#f0fdf4' : '#fef2f2') : '#F9FAFB',
                      border: `1px solid ${form.active === v ? (v ? '#86efac' : '#fca5a5') : '#E5E7EB'}`,
                      color: form.active === v ? (v ? '#16a34a' : '#dc2626') : '#6B7280',
                    }}>
                    {v ? 'Aktiv' : 'Deaktivert'}
                  </button>
                ))}
              </div>
              {!form.active && (
                <p style={{ margin: '5px 0 0', color: '#D97706', fontSize: 11 }}>Kunden kan ikke logge inn</p>
              )}
            </div>
          </div>

          {divider}

          {/* Section: Passord */}
          <p style={{ margin: '0 0 12px', color: '#B45309', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Passord <span style={{ color: '#9CA3AF', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— la stå tomt for å beholde</span>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <F label="Nytt passord" error={fieldErrors.newPassword}>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'}
                  value={form.newPassword} onChange={e => set('newPassword', e.target.value)}
                  placeholder="Minst 8 tegn"
                  style={{ ...S.input, paddingRight: 64, borderColor: fieldErrors.newPassword ? '#fca5a5' : '#E5E7EB' }} />
                <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => set('newPassword', generatePassword())}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 10, padding: '2px 4px' }}
                    title="Generer passord">gen</button>
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px 2px' }}>
                    {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>
            </F>
            <F label="Bekreft passord" error={fieldErrors.confirmPassword}>
              <input type={showPass ? 'text' : 'password'}
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                placeholder="Gjenta passord"
                style={{ ...S.input, borderColor: fieldErrors.confirmPassword ? '#fca5a5' : '#E5E7EB' }} />
            </F>
          </div>

          {divider}

          {/* Section: Interne notater */}
          <p style={{ margin: '0 0 12px', color: '#B45309', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Interne notater</p>

          <div style={{ marginBottom: 24 }}>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder='F.eks: "Ringte 08.06.2026, gratis tidlig-bruker, kontakt: Bjørkar"'
              rows={3}
              style={{ ...S.input, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '10px 0' }}>
              Avbryt
            </button>
            <button type="submit" disabled={loading || saved}
              style={{
                flex: 2,
                background: saved ? '#16a34a' : loading ? '#F3F4F6' : '#B45309',
                border: 'none', borderRadius: 8, color: saved || !loading ? '#fff' : '#9CA3AF',
                fontSize: 13, fontWeight: 600,
                cursor: loading || saved ? 'not-allowed' : 'pointer', padding: '10px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.15s',
              }}>
              {saved ? <><Check size={14} /> Lagret</> : loading ? 'Lagrer...' : 'Lagre endringer'}
            </button>
          </div>
        </form>
      </div>
    </Backdrop>
  )
}

// ── Delete confirmation modal ─────────────────────────────────────────────────

function DeleteModal({ row, onClose, onDeleted }: {
  row: CustomerRow
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/customers/${row.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Ukjent feil'); setLoading(false); return }
      onDeleted(row.id)
      onClose()
    } catch {
      setError('Nettverksfeil')
      setLoading(false)
    }
  }

  return (
    <Backdrop onClose={onClose}>
      <div style={{ background: '#FFFFFF', border: '1px solid #fca5a5', borderRadius: 12, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: 10, flexShrink: 0 }}>
            <AlertTriangle size={20} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>
              Slett kunde
            </h2>
            <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize: 13, lineHeight: 1.5 }}>
              Er du sikker på at du vil slette <strong style={{ color: '#1A1A1A' }}>{row.company_name}</strong>?
              Annonser beholdes men kobles fra selgeren. Dette kan ikke angres.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '9px 13px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={loading}
            style={{ flex: 1, background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '10px 0' }}>
            Avbryt
          </button>
          <button onClick={handleDelete} disabled={loading}
            style={{ flex: 1, background: loading ? '#fca5a5' : '#dc2626', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s' }}>
            <Trash2 size={13} />
            {loading ? 'Sletter...' : 'Slett kunde'}
          </button>
        </div>
      </div>
    </Backdrop>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KunderClient({ initialRows }: { initialRows: CustomerRow[] }) {
  const [rows, setRows]           = useState(initialRows)
  const [search, setSearch]       = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editRow, setEditRow]     = useState<CustomerRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null)
  const [form, setForm]           = useState<CreateForm>(EMPTY_CREATE)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied]       = useState(false)
  const [orgLoading, setOrgLoading] = useState(false)
  const [, startTransition]       = useTransition()

  // Broadcast state
  const [showBroadcast, setShowBroadcast]   = useState(false)
  const [bcSubject, setBcSubject]           = useState('')
  const [bcMessage, setBcMessage]           = useState('')
  const [bcLoading, setBcLoading]           = useState(false)
  const [bcResult, setBcResult]             = useState<{ sent: number; total: number } | null>(null)
  const [bcError, setBcError]               = useState('')
  const [bcConfirm, setBcConfirm]           = useState(false)

  const verifiedCount = rows.filter(r => r.verified).length

  const handleBroadcast = async () => {
    if (!bcSubject.trim() || !bcMessage.trim()) return
    setBcLoading(true); setBcError('')
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: bcSubject.trim(), message: bcMessage.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setBcError(data.error ?? 'Feil under sending'); return }
      setBcResult({ sent: data.sent, total: data.total })
    } catch { setBcError('Nettverksfeil') }
    finally { setBcLoading(false); setBcConfirm(false) }
  }

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
      if (res.ok) { const d = await res.json(); if (d.navn) setForm(f => ({ ...f, companyName: d.navn })) }
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
        body: JSON.stringify({ email: form.email, password: form.password, companyName: form.companyName, orgNumber: form.orgNumber, contactPerson: form.contactPerson || undefined, phone: form.phone || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error); return }
      setRows(r => [{ id: data.userId, company_name: form.companyName, org_number: form.orgNumber, email: form.email, contact_person: form.contactPerson || null, phone: form.phone || null, verified: true, active: true, notes: null, created_at: new Date().toISOString(), updated_at: null, activeListings: 0 }, ...r])
      setCreateSuccess({ email: form.email, password: form.password })
      setForm(EMPTY_CREATE)
    } catch { setFormError('Nettverksfeil') }
    finally { setFormLoading(false) }
  }

  const copyCredentials = () => {
    if (!createSuccess) return
    navigator.clipboard.writeText(`E-post: ${createSuccess.email}\nPassord: ${createSuccess.password}\nURL: https://anleggstorget.no/logg-inn`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleEditSaved = useCallback((id: string, patch: Partial<CustomerRow>) => {
    setRows(rows => rows.map(r => r.id === id ? { ...r, ...patch } : r))
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setRows(rows => rows.filter(r => r.id !== id))
  }, [])

  void startTransition

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#1A1A1A' }}>Kunder</h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 13 }}>{rows.length} registrerte bedrifter</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowBroadcast(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 14px', transition: 'all 0.12s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#B45309' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}>
            <Send size={13} /> Send melding
          </button>
          <button onClick={() => { setShowCreate(true); setCreateSuccess(null); setFormError('') }}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#16a34a', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 16px' }}>
            <Plus size={14} /> Opprett ny kunde
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        <input type="text" placeholder="Søk på navn, org.nr eller e-post..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...S.input, paddingLeft: 34 }} />
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
              {['Bedrift', 'Org.nr', 'E-post', 'Status', 'Annonser', 'Registrert', 'Handlinger'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#6B7280', padding: '32px 16px' }}>
                {search ? 'Ingen treff' : 'Ingen kunder ennå'}
              </td></tr>
            )}
            {filtered.map(row => (
              <tr key={row.id}
                onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={S.td}>
                  <Link href={`/admin/kunder/${row.id}`} style={{ fontWeight: 600, color: '#1A1A1A', textDecoration: 'none' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#B45309')}
                    onMouseOut={e => (e.currentTarget.style.color = '#1A1A1A')}>
                    {row.company_name}
                  </Link>
                  {row.contact_person && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{row.contact_person}</div>}
                </td>
                <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 13, color: '#6B7280' }}>{row.org_number}</td>
                <td style={{ ...S.td, color: '#6B7280' }}>{row.email}</td>
                <td style={S.td}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: row.verified ? '#f0fdf4' : '#fef2f2', color: row.verified ? '#16a34a' : '#dc2626', border: `1px solid ${row.verified ? '#86efac' : '#fca5a5'}`, borderRadius: 4, fontSize: 11, fontWeight: 600, padding: '2px 7px', width: 'fit-content' }}>
                      {row.verified ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {row.verified ? 'Verifisert' : 'Ikke verifisert'}
                    </span>
                    {!row.active && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fffbeb', color: '#D97706', border: '1px solid #fde68a', borderRadius: 4, fontSize: 11, fontWeight: 600, padding: '2px 7px', width: 'fit-content' }}>
                        Deaktivert
                      </span>
                    )}
                    {row.notes && (
                      <span title={row.notes} style={{ color: '#9CA3AF', fontSize: 11, cursor: 'help' }}>📝 Har notater</span>
                    )}
                  </div>
                </td>
                <td style={{ ...S.td, color: row.activeListings > 0 ? '#1A1A1A' : '#9CA3AF' }}>{row.activeListings}</td>
                <td style={{ ...S.td, color: '#6B7280', fontSize: 13 }}>{fmtDate(row.created_at)}</td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditRow(row)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, color: '#6B7280', fontSize: 12, cursor: 'pointer', padding: '4px 10px', transition: 'all 0.12s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.color = '#B45309' }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
                    >
                      <Pencil size={11} /> Rediger
                    </button>
                    <button onClick={() => setDeleteTarget(row)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, color: '#6B7280', fontSize: 12, cursor: 'pointer', padding: '4px 10px', transition: 'all 0.12s' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626' }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
                    >
                      <Trash2 size={11} /> Slett
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editRow && (
        <EditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={patch => { handleEditSaved(editRow.id, patch); setEditRow(prev => prev ? { ...prev, ...patch } : null) }}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          row={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <Backdrop onClose={() => { setShowCreate(false); setCreateSuccess(null) }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>Opprett ny kunde</h2>
              <button onClick={() => { setShowCreate(false); setCreateSuccess(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}><X size={18} /></button>
            </div>

            {createSuccess ? (
              <div>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                  <p style={{ color: '#16a34a', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={16} /> Kunde opprettet</p>
                  <p style={{ color: '#1A1A1A', fontSize: 13, marginBottom: 4 }}>E-post: <strong>{createSuccess.email}</strong></p>
                  <p style={{ color: '#1A1A1A', fontSize: 13, margin: 0 }}>Passord: <strong style={{ fontFamily: 'monospace' }}>{createSuccess.password}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={copyCredentials} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: copied ? '#f0fdf4' : '#F9FAFB', border: `1px solid ${copied ? '#86efac' : '#E5E7EB'}`, borderRadius: 8, color: copied ? '#16a34a' : '#1A1A1A', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '9px 0' }}>
                    {copied ? <><Check size={13} /> Kopiert!</> : <><Copy size={13} /> Kopier innloggingsdetaljer</>}
                  </button>
                  <button onClick={() => { setCreateSuccess(null); setShowCreate(false) }} style={{ flex: 1, background: '#B45309', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '9px 0' }}>Ferdig</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate}>
                {formError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>{formError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 14 }}>
                  <div>
                    <label style={S.label}>Organisasjonsnummer *</label>
                    <input value={form.orgNumber} onChange={e => setForm(f => ({ ...f, orgNumber: e.target.value }))} placeholder="123 456 789" style={S.input} required minLength={9} />
                  </div>
                  <div style={{ alignSelf: 'flex-end' }}>
                    <button type="button" onClick={handleVerifyOrg} disabled={orgLoading} style={{ height: 38, padding: '0 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6B7280', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {orgLoading ? <RefreshCcw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : null} Hent navn
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Bedriftsnavn *</label>
                  <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="AS Eksempel" style={S.input} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={S.label}>Kontaktperson</label>
                    <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Ola Nordmann" style={S.input} />
                  </div>
                  <div>
                    <label style={S.label}>Telefon</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+47 99 99 99 99" style={S.input} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>E-postadresse *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="kontakt@bedrift.no" style={S.input} required />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={S.label}>Midlertidig passord *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minst 8 tegn" style={{ ...S.input, flex: 1 }} required minLength={8} />
                    <button type="button" onClick={() => setForm(f => ({ ...f, password: generatePassword() }))} style={{ padding: '0 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6B7280', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Generer</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '9px 0' }}>Avbryt</button>
                  <button type="submit" disabled={formLoading} style={{ flex: 2, background: formLoading ? '#F3F4F6' : '#16a34a', border: 'none', borderRadius: 8, color: formLoading ? '#9CA3AF' : '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', padding: '9px 0' }}>
                    {formLoading ? 'Oppretter...' : 'Opprett kunde'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Backdrop>
      )}

      {/* Broadcast modal */}
      {showBroadcast && (
        <Backdrop onClose={() => { setShowBroadcast(false); setBcResult(null); setBcError(''); setBcConfirm(false) }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>Send melding til selgere</h2>
                <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 12 }}>{verifiedCount} verifiserte mottakere</p>
              </div>
              <button onClick={() => { setShowBroadcast(false); setBcResult(null); setBcError(''); setBcConfirm(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}><X size={18} /></button>
            </div>

            {bcResult ? (
              <div>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: '#16a34a', fontWeight: 700, fontSize: 20, margin: '0 0 6px', fontFamily: 'Barlow Condensed, sans-serif' }}>
                    Sendt til {bcResult.sent} av {bcResult.total} selgere
                  </p>
                  {bcResult.sent < bcResult.total && (
                    <p style={{ color: '#D97706', fontSize: 13, margin: 0 }}>{bcResult.total - bcResult.sent} feilet</p>
                  )}
                </div>
                <button onClick={() => { setShowBroadcast(false); setBcResult(null); setBcSubject(''); setBcMessage('') }}
                  style={{ marginTop: 16, width: '100%', background: '#16a34a', border: 'none', borderRadius: 8, color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '10px 0' }}>
                  Lukk
                </button>
              </div>
            ) : (
              <>
                {bcError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
                    {bcError}
                  </div>
                )}

                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Emne</label>
                  <input value={bcSubject} onChange={e => setBcSubject(e.target.value)}
                    placeholder="F.eks: Viktig oppdatering fra Anleggstorget"
                    style={S.input} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Melding</label>
                  <textarea value={bcMessage} onChange={e => setBcMessage(e.target.value)}
                    placeholder="Skriv meldingen her..."
                    rows={6}
                    style={{ ...S.input, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.6 }} />
                </div>

                {/* Preview */}
                {(bcSubject.trim() || bcMessage.trim()) && (
                  <div style={{ marginBottom: 20, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '14px 16px' }}>
                    <p style={{ margin: '0 0 8px', color: '#B45309', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Preview</p>
                    <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: 12 }}>Emne: <span style={{ color: '#1A1A1A' }}>{bcSubject || '—'}</span></p>
                    <p style={{ margin: '0 0 8px', color: '#6B7280', fontSize: 12 }}>Fra: <span style={{ color: '#1A1A1A' }}>Anleggstorget &lt;kontakt@anleggstorget.no&gt;</span></p>
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 10, color: '#1A1A1A', fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                      {bcMessage || '—'}
                    </div>
                  </div>
                )}

                {bcConfirm ? (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
                    <p style={{ margin: '0 0 12px', color: '#D97706', fontSize: 13 }}>
                      Send til <strong>{verifiedCount}</strong> verifiserte selgere? Dette kan ikke angres.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setBcConfirm(false)}
                        style={{ flex: 1, background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '8px 0' }}>
                        Avbryt
                      </button>
                      <button onClick={handleBroadcast} disabled={bcLoading}
                        style={{ flex: 2, background: bcLoading ? '#F3F4F6' : '#B45309', border: 'none', borderRadius: 8, color: bcLoading ? '#9CA3AF' : '#fff', fontSize: 13, fontWeight: 600, cursor: bcLoading ? 'not-allowed' : 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Send size={13} />
                        {bcLoading ? 'Sender...' : `Send til ${verifiedCount} selgere`}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setBcConfirm(true)}
                    disabled={!bcSubject.trim() || !bcMessage.trim()}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: (!bcSubject.trim() || !bcMessage.trim()) ? '#F3F4F6' : '#B45309', border: 'none', borderRadius: 8, color: (!bcSubject.trim() || !bcMessage.trim()) ? '#9CA3AF' : '#fff', fontSize: 13, fontWeight: 600, cursor: (!bcSubject.trim() || !bcMessage.trim()) ? 'not-allowed' : 'pointer', padding: '10px 0' }}>
                    <Send size={13} /> Send til {verifiedCount} selgere
                  </button>
                )}
              </>
            )}
          </div>
        </Backdrop>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
