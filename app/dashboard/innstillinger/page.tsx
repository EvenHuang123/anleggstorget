'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, Save, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile } from '@/lib/supabase/types'

export default function InnstillingerPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/logg-inn'; return }
      setEmail(session.user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
      if (data) setProfile(data as Profile)
      setLoading(false)
    }
    load()
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('profiles').update({
      company_name: profile.company_name,
      contact_person: profile.contact_person,
      phone: profile.phone,
    }).eq('user_id', session.user.id)

    setSaving(false)
    if (error) {
      toast.error('Feil ved lagring av profil')
    } else {
      toast.success('Profil oppdatert!')
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('Passordene stemmer ikke overens'); return }
    if (newPassword.length < 8) { toast.error('Passordet må være minst 8 tegn'); return }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error('Kunne ikke oppdatere passord')
    } else {
      toast.success('Passord oppdatert!')
      setNewPassword(''); setConfirmPassword('')
    }
  }

  if (loading) return <div className="card shimmer" style={{ height: 400 }} />

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 26, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 32 }}>
        Innstillinger
      </h1>

      {/* Profile form */}
      <form onSubmit={saveProfile}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--t1)', letterSpacing: '0.02em' }}>
              Bedriftsinformasjon
            </h2>
            {profile.verified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.3)', borderRadius: 20, padding: '2px 10px' }}>
                <Shield size={10} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verifisert</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Bedriftsnavn</label>
              <input
                type="text"
                value={profile.company_name || ''}
                onChange={e => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Organisasjonsnummer</label>
              <input
                type="text"
                value={profile.org_number || ''}
                className="input-base"
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                <CheckCircle size={11} style={{ color: 'var(--gold)' }} />
                <p style={{ fontSize: 11, color: 'var(--t3)' }}>Verifisert mot Brønnøysundregistrene</p>
              </div>
            </div>

            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Kontaktperson</label>
              <input
                type="text"
                value={profile.contact_person || ''}
                onChange={e => setProfile(prev => ({ ...prev, contact_person: e.target.value }))}
                className="input-base"
              />
            </div>

            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Telefon</label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="input-base"
              />
            </div>

            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>E-post</label>
              <input
                type="email"
                value={email}
                className="input-base"
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary" style={{ marginBottom: 24 }}>
          <Save size={14} />
          {saving ? 'Lagrer...' : 'Lagre profil'}
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={changePassword}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '24px', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--t1)', letterSpacing: '0.02em', marginBottom: 20 }}>
            Endre passord
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Nytt passord</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minst 8 tegn" className="input-base" minLength={8} />
            </div>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Bekreft nytt passord</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Gjenta passord" className="input-base" />
            </div>
          </div>
        </div>
        <button type="submit" className="btn-secondary">
          Oppdater passord
        </button>
      </form>

      {/* Danger zone */}
      <div style={{ marginTop: 40, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <AlertCircle size={14} style={{ color: '#ef4444' }} />
          <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Farlig sone</h3>
        </div>
        <p style={{ color: 'var(--t3)', fontSize: 13, marginBottom: 14 }}>
          Sletting av konto er permanent og kan ikke angres. Alle annonser og data vil bli slettet.
        </p>
        <button
          type="button"
          onClick={() => toast.error('Kontakt support for å slette kontoen din')}
          style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', fontFamily: 'Barlow Condensed', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '8px 16px', borderRadius: 3, cursor: 'pointer',
          }}
        >
          Slett konto
        </button>
      </div>
    </div>
  )
}
