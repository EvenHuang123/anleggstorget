'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { Upload, X, ChevronRight, ChevronLeft, Check, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, WEIGHT_CLASSES, NORWEGIAN_COUNTIES, POPULAR_BRANDS } from '@/lib/utils/format'
import toast from 'react-hot-toast'
import type { Category, PriceType } from '@/lib/supabase/types'

const STEPS = [
  { id: 1, label: 'Kategori' },
  { id: 2, label: 'Info' },
  { id: 3, label: 'Teknisk' },
  { id: 4, label: 'Pris' },
  { id: 5, label: 'Bilder' },
  { id: 6, label: 'Publiser' },
]

interface FormState {
  category: Category | ''
  title: string
  description: string
  brand: string
  model: string
  year: string
  operating_hours: string
  weight_class: string
  location: string
  price: string
  price_type: PriceType
  images: File[]
  imagePreviewUrls: string[]
}

const INIT: FormState = {
  category: '',
  title: '',
  description: '',
  brand: '',
  model: '',
  year: '',
  operating_hours: '',
  weight_class: '',
  location: '',
  price: '',
  price_type: 'fast_price',
  images: [],
  imagePreviewUrls: [],
}

const CATEGORY_LIST = Object.entries(CATEGORIES) as [Category, { label: string; icon: string }][]

export default function NyAnnonsePage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INIT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const set = (field: keyof FormState, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const existing = form.images.length
    const allowed = Math.min(files.length, 8 - existing)
    const newFiles = Array.from(files).slice(0, allowed)
    const newUrls = newFiles.map(f => URL.createObjectURL(f))
    set('images', [...form.images, ...newFiles])
    set('imagePreviewUrls', [...form.imagePreviewUrls, ...newUrls])
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(form.imagePreviewUrls[i])
    set('images', form.images.filter((_, idx) => idx !== i))
    set('imagePreviewUrls', form.imagePreviewUrls.filter((_, idx) => idx !== i))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [form.images, form.imagePreviewUrls])

  const validateStep = (): boolean => {
    if (step === 1 && !form.category) { setError('Velg en kategori'); return false }
    if (step === 2 && !form.title.trim()) { setError('Tittel er påkrevd'); return false }
    if (step === 4 && !form.price) { setError('Pris er påkrevd'); return false }
    setError('')
    return true
  }

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 6) as typeof step) }
  const prev = () => setStep(s => Math.max(s - 1, 1) as typeof step)

  const publishListing = async (status: 'active' | 'draft') => {
    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        router.push('/logg-inn')
        return
      }

      const price = Number(form.price)
      if (!form.price || isNaN(price) || price <= 0) {
        setError('Ugyldig pris. Gå tilbake og fyll inn et gyldig beløp.')
        setLoading(false)
        return
      }

      // Ensure profile exists (foreign key requirement for listings.seller_id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingProfile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle() as { data: { id: string } | null }

      if (!existingProfile) {
        const meta = session.user.user_metadata ?? {}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileErr } = await (supabase as any).from('profiles').insert({
          id: session.user.id,
          company_name: meta.company_name ?? session.user.email?.split('@')[0] ?? 'Ukjent bedrift',
          org_number: meta.org_number ?? null,
          contact_person: meta.contact_person ?? null,
          phone: meta.phone ?? null,
        })
        if (profileErr) {
          console.error('Profile creation failed:', profileErr.message)
          setError('Profil mangler. Gå til Innstillinger og fyll inn bedriftsinfo.')
          setLoading(false)
          return
        }
      }

      // Upload images
      const uploadedUrls: string[] = []
      for (const file of form.images) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('listing-images')
          .upload(path, file, { contentType: file.type, upsert: false })
        if (uploadErr) {
          console.warn('Image upload failed:', uploadErr.message)
        } else {
          uploadedUrls.push(path)
        }
      }

      // Insert listing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newListing, error: insertErr } = await (supabase as any)
        .from('listings')
        .insert({
          seller_id: session.user.id,
          category: form.category as Category,
          title: form.title,
          description: form.description || null,
          brand: form.brand || null,
          model: form.model || null,
          year: form.year ? parseInt(form.year) : null,
          operating_hours: form.operating_hours ? parseInt(form.operating_hours) : null,
          weight_class: form.weight_class || null,
          price,
          price_type: form.price_type,
          location: form.location || null,
          status,
          images: uploadedUrls,
        })
        .select('id')
        .single() as { data: { id: string } | null; error: { message: string; code: string } | null }

      setLoading(false)

      if (insertErr) {
        console.error('Listing insert error:', insertErr.code, insertErr.message)
        setError(`Publisering feilet: ${insertErr.message}`)
        return
      }

      toast.success(status === 'active' ? 'Annonsen er publisert!' : 'Lagret som kladd.')
      router.push(status === 'active' && newListing?.id ? `/annonse/${newListing.id}` : '/dashboard/annonser')
    } catch (err) {
      console.error('Unexpected error in publishListing:', err)
      setError('En uventet feil oppstod. Sjekk konsollen og prøv igjen.')
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
        <div className="container-main" style={{ padding: '48px 24px' }}>
          {/* Page header */}
          <div style={{ marginBottom: 40 }}>
            <p className="section-label" style={{ marginBottom: 8 }}>Ny annonse</p>
            <h1 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
              Legg ut maskin til salgs
            </h1>
          </div>

          {/* Steps indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48, overflowX: 'auto', paddingBottom: 4 }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div className={`step-indicator ${s.id === step ? 'step-active' : s.id < step ? 'step-done' : 'step-pending'}`}>
                    {s.id < step ? <Check size={12} /> : s.id}
                  </div>
                  <span style={{ fontSize: 11, color: s.id === step ? 'var(--gold)' : s.id < step ? 'var(--t2)' : 'var(--t3)', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 48, height: 1, background: step > s.id ? 'var(--gold)' : 'var(--border)', margin: '0 8px', marginBottom: 20, transition: 'background 0.3s', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 3, padding: '10px 14px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={14} style={{ color: '#ef4444' }} />
              <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>
            </div>
          )}

          {/* Step content */}
          <div style={{ maxWidth: 640, margin: '0 auto' }}>

            {/* Step 1: Category */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)', marginBottom: 24 }}>
                  Velg kategori
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {CATEGORY_LIST.map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() => set('category', key)}
                      style={{
                        background: form.category === key ? 'var(--gold3)' : 'var(--bg2)',
                        border: `1px solid ${form.category === key ? 'rgba(200,149,58,0.4)' : 'var(--border)'}`,
                        borderRadius: 4, padding: '16px 20px',
                        textAlign: 'left', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{key === 'gravemaskin' ? '🏗️' : key === 'traktor' ? '🚜' : key === 'hjullaster' ? '🚛' : key === 'dumper' ? '🚧' : key === 'kranbil' ? '🏗️' : key === 'skogsutstyr' ? '🌲' : '⚙️'}</span>
                      <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 15, color: form.category === key ? 'var(--gold)' : 'var(--t1)' }}>
                        {label}
                      </span>
                      {form.category === key && <Check size={14} style={{ color: 'var(--gold)', marginLeft: 'auto' }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Basic info */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)' }}>
                  Grunnleggende informasjon
                </h2>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Tittel *</label>
                  <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="f.eks. Volvo EC480E Gravemaskin 2021" className="input-base" maxLength={100} />
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Beskrivelse</label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Beskriv maskinen, service-historikk, utstyr, tilstand..."
                    className="input-base"
                    rows={5}
                    style={{ resize: 'vertical', minHeight: 120 }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Merke</label>
                    <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Volvo, Caterpillar..." list="brands-list" className="input-base" />
                    <datalist id="brands-list">{POPULAR_BRANDS.map(b => <option key={b} value={b} />)}</datalist>
                  </div>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Modell</label>
                    <input type="text" value={form.model} onChange={e => set('model', e.target.value)} placeholder="EC480E, D6T..." className="input-base" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Technical */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)' }}>
                  Tekniske detaljer
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Årsmodell</label>
                    <input type="number" value={form.year} onChange={e => set('year', e.target.value)} placeholder="2021" min="1970" max={new Date().getFullYear()} className="input-base" />
                  </div>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Driftstimer</label>
                    <input type="number" value={form.operating_hours} onChange={e => set('operating_hours', e.target.value)} placeholder="3 200" min="0" className="input-base" />
                  </div>
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Vektklasse</label>
                  <select value={form.weight_class} onChange={e => set('weight_class', e.target.value)} className="input-base" style={{ cursor: 'pointer' }}>
                    <option value="">Velg vektklasse</option>
                    {WEIGHT_CLASSES.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Lokasjon</label>
                  <select value={form.location} onChange={e => set('location', e.target.value)} className="input-base" style={{ cursor: 'pointer' }}>
                    <option value="">Velg fylke</option>
                    {NORWEGIAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Price */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)' }}>
                  Prissetting
                </h2>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Pris (NOK) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--t3)', fontSize: 14, pointerEvents: 'none',
                    }}>kr</span>
                    <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" min="0" className="input-base" style={{ paddingLeft: 36 }} required />
                  </div>
                  {form.price && (
                    <p style={{ fontSize: 13, color: 'var(--gold)', marginTop: 6, fontFamily: 'Barlow Condensed', fontWeight: 600 }}>
                      {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(Number(form.price))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 10 }}>Pristype</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {([
                      { value: 'fast_price', label: 'Fast pris', desc: 'Pris er ikke forhandlingsbar' },
                      { value: 'negotiable', label: 'Forhandlingsbar', desc: 'Åpent for pristilbud' },
                      { value: 'auction', label: 'Auksjon', desc: 'Høyeste bud vinner' },
                    ] as const).map(pt => (
                      <label key={pt.value} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: form.price_type === pt.value ? 'var(--gold4)' : 'var(--bg3)',
                        border: `1px solid ${form.price_type === pt.value ? 'rgba(200,149,58,0.3)' : 'var(--border)'}`,
                        borderRadius: 4, padding: '14px 16px', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}>
                        <input
                          type="radio"
                          name="price_type"
                          value={pt.value}
                          checked={form.price_type === pt.value}
                          onChange={() => set('price_type', pt.value)}
                          style={{ accentColor: 'var(--gold)' }}
                        />
                        <div>
                          <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 15, color: form.price_type === pt.value ? 'var(--gold)' : 'var(--t1)' }}>{pt.label}</p>
                          <p style={{ fontSize: 12, color: 'var(--t3)' }}>{pt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Images */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)' }}>
                  Bilder ({form.images.length}/8)
                </h2>

                {/* Drop zone */}
                <div
                  ref={dragRef}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--gold)' : 'var(--border2)'}`,
                    borderRadius: 4, padding: '40px 24px',
                    textAlign: 'center', cursor: 'pointer',
                    background: isDragging ? 'var(--gold4)' : 'var(--bg3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handleFiles(e.target.files)}
                    style={{ display: 'none' }}
                  />
                  <Upload size={28} style={{ color: isDragging ? 'var(--gold)' : 'var(--t3)', marginBottom: 12 }} />
                  <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 16, color: 'var(--t1)', marginBottom: 6 }}>
                    Dra og slipp bilder her
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--t3)' }}>
                    eller klikk for å velge · JPEG, PNG, WebP · Maks 8 bilder
                  </p>
                </div>

                {/* Preview grid */}
                {form.imagePreviewUrls.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {form.imagePreviewUrls.map((url, i) => (
                      <div key={url} style={{ position: 'relative', aspectRatio: '1', borderRadius: 3, overflow: 'hidden' }}>
                        <img src={url} alt={`Bilde ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && (
                          <div style={{ position: 'absolute', bottom: 4, left: 4 }}>
                            <span className="tag tag-gold" style={{ fontSize: 9 }}>Hovedbilde</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeImage(i)}
                          style={{
                            position: 'absolute', top: 4, right: 4,
                            background: 'rgba(0,0,0,0.7)', border: 'none',
                            borderRadius: '50%', width: 22, height: 22,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {form.images.length < 8 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          aspectRatio: '1', borderRadius: 3,
                          border: '2px dashed var(--border)', background: 'var(--bg3)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', gap: 4, color: 'var(--t3)',
                        }}
                      >
                        <ImageIcon size={18} />
                        <span style={{ fontSize: 11 }}>Legg til</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Preview & publish */}
            {step === 6 && (
              <div>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)', marginBottom: 24 }}>
                  Forhåndsvisning & publisering
                </h2>

                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 4, overflow: 'hidden', marginBottom: 28 }}>
                  {/* Preview image */}
                  {form.imagePreviewUrls[0] ? (
                    <img src={form.imagePreviewUrls[0]} alt={form.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 140, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={32} style={{ color: 'var(--t3)' }} />
                    </div>
                  )}
                  <div style={{ padding: '20px 24px' }}>
                    <div className="tag tag-gold" style={{ marginBottom: 10 }}>{CATEGORIES[form.category]?.label}</div>
                    <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)', marginBottom: 12 }}>{form.title || 'Uten tittel'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                      {[
                        { label: 'Årsmodell', value: form.year || '—' },
                        { label: 'Timer', value: form.operating_hours ? `${Number(form.operating_hours).toLocaleString('nb-NO')} t` : '—' },
                        { label: 'Lokasjon', value: form.location || '—' },
                        { label: 'Merke', value: form.brand || '—' },
                        { label: 'Modell', value: form.model || '—' },
                        { label: 'Vektklasse', value: form.weight_class || '—' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="label-sm" style={{ marginBottom: 2 }}>{label}</p>
                          <p style={{ color: 'var(--t1)', fontSize: 13 }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <p className="label-sm" style={{ marginBottom: 4 }}>Pris</p>
                      <p className="price-display" style={{ fontSize: 24 }}>
                        {form.price ? new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(Number(form.price)) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                  <button
                    onClick={() => publishListing('active')}
                    disabled={loading}
                    className="btn-primary"
                    style={{ justifyContent: 'center', height: 50, fontSize: 14 }}
                  >
                    {loading ? 'Publiserer...' : 'Publiser annonse nå'}
                  </button>
                  <button
                    onClick={() => publishListing('draft')}
                    disabled={loading}
                    className="btn-secondary"
                    style={{ justifyContent: 'center', height: 46 }}
                  >
                    Lagre som kladd
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{
              display: 'flex', gap: 12, marginTop: 40, paddingTop: 24,
              borderTop: '1px solid var(--border)',
              justifyContent: step === 1 ? 'flex-end' : 'space-between',
            }}>
              {step > 1 && (
                <button onClick={prev} className="btn-secondary" style={{ gap: 6 }}>
                  <ChevronLeft size={14} /> Forrige
                </button>
              )}
              {step < 6 && (
                <button onClick={next} className="btn-primary" style={{ gap: 6 }}>
                  Neste <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
