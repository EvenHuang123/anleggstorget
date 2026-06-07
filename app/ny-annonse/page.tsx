'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { Upload, X, ChevronRight, ChevronLeft, Check, Image as ImageIcon, AlertCircle, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, CATEGORY_TREE, WEIGHT_CLASSES, NORWEGIAN_COUNTIES, POPULAR_BRANDS, slugify, getListingImageUrl } from '@/lib/utils/format'
import toast from 'react-hot-toast'
import type { Category, PriceType, ListingType } from '@/lib/supabase/types'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  gravemaskin: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="4" y="16" width="28" height="12" rx="2" />
        <rect x="8" y="8" width="14" height="10" rx="2" />
        <rect x="9.5" y="9.5" width="11" height="7" rx="1" fill="var(--bg4)" />
        <rect x="20" y="2" width="4" height="20" rx="1.5" transform="rotate(-28 20 2)" />
        <rect x="33" y="1" width="3" height="14" rx="1.5" transform="rotate(18 33 1)" />
        <path d="M37 15 L46 18 L45 24 L35 23 Z" />
        <rect x="2" y="27" width="36" height="4" rx="2" />
        {[7,13,19,25,31].map(x => <circle key={x} cx={x} cy={28.5} r={2.5} />)}
      </g>
    </svg>
  ),
  traktor: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="6" y="12" width="22" height="14" rx="2" />
        <rect x="9" y="6" width="10" height="10" rx="2" />
        <rect x="10.5" y="7.5" width="7" height="7" rx="1" fill="var(--bg4)" />
        <circle cx="12" cy="24" r="7" /><circle cx="12" cy="24" r="4" fill="var(--bg4)" />
        <circle cx="34" cy="26" r="5" /><circle cx="34" cy="26" r="3" fill="var(--bg4)" />
        <rect x="16" y="10" width="18" height="4" rx="2" />
        <rect x="28" y="6" width="4" height="12" rx="1" />
      </g>
    </svg>
  ),
  hjullaster: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="6" y="12" width="30" height="14" rx="2" />
        <rect x="10" y="6" width="14" height="10" rx="2" />
        <rect x="11.5" y="7.5" width="11" height="7" rx="1" fill="var(--bg4)" />
        <rect x="2" y="18" width="12" height="4" rx="1.5" />
        <path d="M2 14 L8 14 L8 22 L2 20 Z" />
        <circle cx="12" cy="26" r="5" /><circle cx="12" cy="26" r="3" fill="var(--bg4)" />
        <circle cx="34" cy="26" r="5" /><circle cx="34" cy="26" r="3" fill="var(--bg4)" />
      </g>
    </svg>
  ),
  dumper: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="4" y="8" width="28" height="16" rx="2" />
        <path d="M4 8 L20 4 L32 4 L32 8 Z" />
        <rect x="8" y="14" width="10" height="8" rx="1.5" />
        <rect x="8.5" y="14.5" width="9" height="7" rx="1" fill="var(--bg4)" />
        <circle cx="10" cy="26" r="5" /><circle cx="10" cy="26" r="3" fill="var(--bg4)" />
        <circle cx="30" cy="26" r="5" /><circle cx="30" cy="26" r="3" fill="var(--bg4)" />
        <circle cx="40" cy="26" r="5" /><circle cx="40" cy="26" r="3" fill="var(--bg4)" />
      </g>
    </svg>
  ),
  kranbil: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="4" y="16" width="32" height="12" rx="2" />
        <rect x="8" y="8" width="10" height="10" rx="2" />
        <rect x="9.5" y="9.5" width="7" height="7" rx="1" fill="var(--bg4)" />
        <rect x="17" y="4" width="3" height="24" rx="1.5" />
        <rect x="17" y="4" width="28" height="2" rx="1" />
        <rect x="43" y="4" width="2" height="16" rx="1" />
        {[8,16,24,32].map(x => <circle key={x} cx={x} cy={28} r={3} />)}
      </g>
    </svg>
  ),
  skogsutstyr: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="6" y="14" width="28" height="12" rx="2" />
        <rect x="10" y="6" width="12" height="10" rx="2" />
        <rect x="11.5" y="7.5" width="9" height="7" rx="1" fill="var(--bg4)" />
        <circle cx="34" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="34" cy="10" r="3" />
        {[0,60,120,180,240,300].map(a => {
          const r = a * Math.PI / 180
          return <line key={a} x1={34} y1={10} x2={34+Math.cos(r)*7} y2={10+Math.sin(r)*7} stroke="currentColor" strokeWidth="1.5" />
        })}
        <circle cx="12" cy="26" r="5" /><circle cx="12" cy="26" r="3" fill="var(--bg4)" />
        <circle cx="28" cy="26" r="5" /><circle cx="28" cy="26" r="3" fill="var(--bg4)" />
      </g>
    </svg>
  ),
  betong: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="4" y="16" width="30" height="12" rx="2" />
        <rect x="8" y="8" width="10" height="10" rx="2" />
        <rect x="9.5" y="9.5" width="7" height="7" rx="1" fill="var(--bg4)" />
        <ellipse cx="32" cy="12" rx="8" ry="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <ellipse cx="32" cy="12" rx="5" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <line x1="32" y1="3" x2="32" y2="21" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <line x1="24" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <circle cx="10" cy="28" r="3.5" /><circle cx="10" cy="28" r="1.8" fill="var(--bg4)" />
        <circle cx="28" cy="28" r="3.5" /><circle cx="28" cy="28" r="1.8" fill="var(--bg4)" />
      </g>
    </svg>
  ),
  annet: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <circle cx="24" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="24" cy="16" r="4" />
        {[0,45,90,135,180,225,270,315].map(a => {
          const r = a * Math.PI / 180
          return <line key={a} x1={24+Math.cos(r)*5.5} y1={16+Math.sin(r)*5.5} x2={24+Math.cos(r)*9} y2={16+Math.sin(r)*9} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        })}
      </g>
    </svg>
  ),
  teleskoplaster: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="6" y="14" width="22" height="12" rx="2" />
        <rect x="8" y="8" width="10" height="8" rx="2" />
        <rect x="9.5" y="9.5" width="7" height="5" rx="1" fill="var(--bg4)" />
        <rect x="14" y="4" width="24" height="3" rx="1.5" transform="rotate(-18 14 4)" />
        <rect x="28" y="1" width="14" height="2" rx="1" transform="rotate(-18 28 1)" />
        <path d="M39 6 L44 8 L43 12 L38 11 Z" />
        <circle cx="12" cy="26" r="5" /><circle cx="12" cy="26" r="3" fill="var(--bg4)" />
        <circle cx="26" cy="26" r="5" /><circle cx="26" cy="26" r="3" fill="var(--bg4)" />
      </g>
    </svg>
  ),
  kompaktlaster: (
    <svg viewBox="0 0 48 32" style={{ width: 28, height: 19 }} aria-hidden>
      <g fill="currentColor" opacity="0.9">
        <rect x="10" y="12" width="22" height="14" rx="2" />
        <rect x="14" y="14" width="10" height="7" rx="1" fill="var(--bg4)" />
        <rect x="8" y="9" width="3" height="13" rx="1.5" />
        <rect x="31" y="9" width="3" height="13" rx="1.5" />
        <rect x="6" y="7" width="30" height="4" rx="1.5" />
        <circle cx="14" cy="26" r="5" /><circle cx="14" cy="26" r="3" fill="var(--bg4)" />
        <circle cx="30" cy="26" r="5" /><circle cx="30" cy="26" r="3" fill="var(--bg4)" />
      </g>
    </svg>
  ),
}

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
  subcategory: string
  title: string
  description: string
  brand: string
  model: string
  year: string
  operating_hours: string
  weight_class: string
  location: string
  price_ex_vat: string
  price_type: PriceType
  listing_type: ListingType
  images: File[]
  imagePreviewUrls: string[]
  existingImages: string[]  // paths already stored in Supabase
}

const INIT: FormState = {
  category: '',
  subcategory: '',
  title: '',
  description: '',
  brand: '',
  model: '',
  year: '',
  operating_hours: '',
  weight_class: '',
  location: '',
  price_ex_vat: '',
  price_type: 'fast_price',
  listing_type: 'sale',
  images: [],
  imagePreviewUrls: [],
  existingImages: [],
}

const CATEGORY_LIST = Object.entries(CATEGORIES) as [Category, { label: string; icon: string }][]

// Maps Nominatim state/county strings → official Norwegian fylke names
const COUNTY_MAP: Record<string, string> = {
  'agder': 'Agder', 'aust-agder': 'Agder', 'vest-agder': 'Agder',
  'innlandet': 'Innlandet', 'hedmark': 'Innlandet', 'oppland': 'Innlandet',
  'møre og romsdal': 'Møre og Romsdal', 'more og romsdal': 'Møre og Romsdal',
  'nordland': 'Nordland',
  'oslo': 'Oslo',
  'rogaland': 'Rogaland',
  'troms og finnmark': 'Troms og Finnmark', 'troms': 'Troms og Finnmark', 'finnmark': 'Troms og Finnmark',
  'trøndelag': 'Trøndelag', 'trondelag': 'Trøndelag', 'nord-trøndelag': 'Trøndelag', 'sør-trøndelag': 'Trøndelag',
  'vestfold og telemark': 'Vestfold og Telemark', 'vestfold': 'Vestfold og Telemark', 'telemark': 'Vestfold og Telemark',
  'vestland': 'Vestland', 'hordaland': 'Vestland', 'bergen': 'Vestland', 'sogn og fjordane': 'Vestland',
  'viken': 'Viken', 'akershus': 'Viken', 'buskerud': 'Viken', 'østfold': 'Viken', 'ostfold': 'Viken',
}

interface NominatimResult {
  display_name: string
  address: Record<string, string>
}

export default function NyAnnonsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(INIT)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(!!editId)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [editSlug, setEditSlug] = useState<string | null>(null)

  // Load existing listing when editing
  useEffect(() => {
    if (!editId) return
    supabase.from('listings').select('*').eq('id', editId).single()
      .then(({ data }) => {
        if (!data) { setInitLoading(false); return }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = data as any
        setEditSlug(d.slug || null)
        setForm({
          category: d.category || '',
          subcategory: d.subcategory || '',
          title: d.title || '',
          description: d.description || '',
          brand: d.brand || '',
          model: d.model || '',
          year: d.year?.toString() || '',
          operating_hours: d.operating_hours?.toString() || '',
          weight_class: d.weight_class || '',
          location: d.location || '',
          price_ex_vat: (d.price_ex_vat ?? d.price)?.toString() || '',
          price_type: d.price_type || 'fast_price',
          listing_type: d.listing_type || 'sale',
          images: [],
          imagePreviewUrls: [],
          existingImages: d.images || [],
        })
        setInitLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  // Address autocomplete (Nominatim / OpenStreetMap)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [detectedCounty, setDetectedCounty] = useState('')
  const addressDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleAddressInput = (val: string) => {
    setAddressQuery(val)
    if (!val) { set('location', ''); setDetectedCounty(''); setAddressSuggestions([]); return }
    clearTimeout(addressDebounce.current)
    if (val.length < 2) { setAddressSuggestions([]); return }
    addressDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=no&addressdetails=1&limit=6&q=${encodeURIComponent(val)}`,
          { headers: { 'Accept-Language': 'no' } }
        )
        const data: NominatimResult[] = await res.json()
        setAddressSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch { setAddressSuggestions([]) }
    }, 380)
  }

  const selectAddress = (item: NominatimResult) => {
    const stateRaw = (item.address.state || item.address.county || '').toLowerCase()
    const county = COUNTY_MAP[stateRaw] || ''
    const city = item.address.city || item.address.town || item.address.municipality || item.address.village || item.display_name.split(',')[0]
    const locationStr = county ? (city ? `${city}, ${county}` : county) : city
    set('location', locationStr)
    setAddressQuery(city)
    setDetectedCounty(county)
    setShowSuggestions(false)
    setAddressSuggestions([])
  }

  const set = (field: keyof FormState, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const totalImages = form.existingImages.length + form.images.length

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const allowed = Math.min(files.length, 20 - totalImages)
    const newFiles = Array.from(files).slice(0, allowed)
    const newUrls = newFiles.map(f => URL.createObjectURL(f))
    set('images', [...form.images, ...newFiles])
    set('imagePreviewUrls', [...form.imagePreviewUrls, ...newUrls])
  }

  const removeExistingImage = (i: number) => {
    set('existingImages', form.existingImages.filter((_, idx) => idx !== i))
  }

  const removeNewImage = (i: number) => {
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
    if (step === 4 && !form.price_ex_vat) { setError('Pris er påkrevd'); return false }
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
      if (!session) { setLoading(false); router.push('/logg-inn'); return }

      const price = Number(form.price_ex_vat)
      if (!form.price_ex_vat || isNaN(price) || price <= 0) {
        setError('Ugyldig pris. Gå tilbake og fyll inn et gyldig beløp.')
        setLoading(false)
        return
      }
      const priceIncVat = Math.round(price * 1.25)

      // Ensure profile exists
      const meta = session.user.user_metadata ?? {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileErr } = await (supabase as any).from('profiles').upsert({
        id: session.user.id,
        company_name: meta.company_name ?? session.user.email?.split('@')[0] ?? 'Ukjent bedrift',
        org_number: meta.org_number ?? null,
        contact_person: meta.contact_person ?? null,
        phone: meta.phone ?? null,
      }, { onConflict: 'id', ignoreDuplicates: true })

      if (profileErr) {
        setError('Profil mangler. Gå til Innstillinger og fyll inn bedriftsinfo.')
        setLoading(false)
        return
      }

      // Upload any new images
      const uploadedUrls: string[] = []
      for (const file of form.images) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('listing-images')
          .upload(path, file, { contentType: file.type, upsert: false })
        if (!uploadErr) uploadedUrls.push(path)
      }

      const allImages = [...form.existingImages, ...uploadedUrls]

      const listingPayload = {
        category: form.category as Category,
        title: form.title,
        description: form.description || null,
        brand: form.brand || null,
        model: form.model || null,
        year: form.year ? parseInt(form.year) : null,
        operating_hours: form.operating_hours ? parseInt(form.operating_hours) : null,
        weight_class: form.weight_class || null,
        subcategory: form.subcategory || null,
        price,
        price_ex_vat: price,
        price_inc_vat: priceIncVat,
        vat_rate: 25,
        price_type: form.price_type,
        listing_type: form.listing_type,
        location: form.location || null,
        status,
        images: allImages,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any

      if (editId) {
        // ── EDIT MODE: update existing listing ──
        const { error: updateErr } = await sb.from('listings').update(listingPayload).eq('id', editId)
        setLoading(false)
        if (updateErr) { setError(`Lagring feilet: ${updateErr.message}`); return }

        if (status === 'active') {
          const slug = editSlug || `${slugify(form.title)}-${editId.slice(0, 6)}`
          if (!editSlug) await sb.from('listings').update({ slug }).eq('id', editId)
          toast.success('Annonse publisert!')
          router.push(`/annonse/${slug}`)
        } else {
          toast.success('Kladd lagret.')
          router.push('/dashboard/annonser')
        }
      } else {
        // ── CREATE MODE: insert new listing ──
        const { data: newListing, error: insertErr } = await sb
          .from('listings')
          .insert({ seller_id: session.user.id, ...listingPayload })
          .select('id')
          .single() as { data: { id: string } | null; error: { message: string; code: string } | null }

        setLoading(false)
        if (insertErr) { setError(`Publisering feilet: ${insertErr.message}`); return }

        toast.success(status === 'active' ? 'Annonsen er publisert!' : 'Lagret som kladd.')

        if (status === 'active' && newListing?.id) {
          const slug = `${slugify(form.title)}-${newListing.id.slice(0, 6)}`
          await sb.from('listings').update({ slug }).eq('id', newListing.id)
          router.push(`/annonse/${slug}`)
        } else {
          router.push('/dashboard/annonser')
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('En uventet feil oppstod. Prøv igjen.')
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
        <div className="container-main" style={{ padding: '48px 24px' }}>
          {/* Page header */}
          <div style={{ marginBottom: 40 }}>
            <p className="section-label" style={{ marginBottom: 8 }}>{editId ? 'Rediger kladd' : 'Ny annonse'}</p>
            <h1 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
              {initLoading ? 'Laster...' : editId ? form.title || 'Rediger annonse' : 'Legg ut maskin'}
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

            {/* Step 1: Category + subcategory */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)', marginBottom: 24 }}>
                  Velg kategori
                </h2>

                {/* Main categories — based on CATEGORY_TREE */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: form.category ? 20 : 0 }}>
                  {Object.entries(CATEGORY_TREE).map(([treeKey, node]) => {
                    // Map tree key to DB category key (use first dbValue as the stored category)
                    const dbKey = node.dbValues[0] as Category
                    const isSelected = form.category === dbKey ||
                      node.dbValues.includes(form.category as string)
                    return (
                      <button
                        key={treeKey}
                        onClick={() => {
                          set('category', dbKey)
                          set('subcategory', '') // reset subcategory when main changes
                        }}
                        style={{
                          background: isSelected ? 'var(--gold3)' : 'var(--bg2)',
                          border: `1px solid ${isSelected ? 'rgba(200,149,58,0.4)' : 'var(--border)'}`,
                          borderRadius: 4, padding: '14px 18px',
                          textAlign: 'left', cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex', alignItems: 'center', gap: 12,
                        }}
                      >
                        <span style={{ color: isSelected ? 'var(--gold)' : 'var(--t3)', display: 'flex' }}>
                          {CATEGORY_ICONS[dbKey] ?? CATEGORY_ICONS['annet']}
                        </span>
                        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 14, color: isSelected ? 'var(--gold)' : 'var(--t1)' }}>
                          {node.label}
                        </span>
                        {isSelected && <Check size={14} style={{ color: 'var(--gold)', marginLeft: 'auto' }} />}
                      </button>
                    )
                  })}
                </div>

                {/* Subcategories — appear when a main category is selected */}
                {form.category && (() => {
                  const treeNode = Object.values(CATEGORY_TREE).find(n => n.dbValues.includes(form.category as string))
                  if (!treeNode || Object.keys(treeNode.subcategories).length === 0) return null
                  return (
                    <div>
                      <p className="label-sm" style={{ marginBottom: 8 }}>Underkategori (valgfritt)</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {Object.entries(treeNode.subcategories).map(([subKey, subLabel]) => {
                          const isActive = form.subcategory === subKey
                          return (
                            <button
                              key={subKey}
                              onClick={() => set('subcategory', isActive ? '' : subKey)}
                              style={{
                                background: isActive ? 'var(--bg3)' : 'var(--bg)',
                                border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                                borderRadius: 3, padding: '10px 14px',
                                textAlign: 'left', cursor: 'pointer',
                                transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              }}
                            >
                              <span style={{ fontSize: 13, color: isActive ? 'var(--gold)' : 'var(--t2)', fontFamily: 'Barlow', fontWeight: isActive ? 600 : 400 }}>
                                {subLabel}
                              </span>
                              {isActive && <Check size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
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
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={addressQuery}
                      onChange={e => handleAddressInput(e.target.value)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                      onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Søk by eller sted i Norge..."
                      className="input-base"
                      autoComplete="off"
                    />
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        background: 'var(--bg2)', border: '1px solid var(--border2)',
                        borderRadius: 4, marginTop: 3, overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                      }}>
                        {addressSuggestions.map((s, i) => {
                          const city = s.address.city || s.address.town || s.address.municipality || s.address.village || s.display_name.split(',')[0]
                          const county = COUNTY_MAP[(s.address.state || s.address.county || '').toLowerCase()] || ''
                          return (
                            <button
                              key={i}
                              type="button"
                              onMouseDown={() => selectAddress(s)}
                              style={{
                                width: '100%', textAlign: 'left', background: 'none', border: 'none',
                                padding: '10px 14px', cursor: 'pointer',
                                borderBottom: i < addressSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                                display: 'flex', alignItems: 'center', gap: 8,
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >
                              <MapPin size={11} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: 'var(--t1)' }}>{city}</span>
                              {county && <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 2 }}>{county}</span>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  {detectedCounty && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                      <MapPin size={11} style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                        Fylke: <strong style={{ color: 'var(--gold)' }}>{detectedCounty}</strong>
                      </span>
                    </div>
                  )}
                  <select
                    value={detectedCounty || (NORWEGIAN_COUNTIES.includes(form.location) ? form.location : '')}
                    onChange={e => { set('location', e.target.value); setDetectedCounty(e.target.value) }}
                    className="input-base"
                    style={{ cursor: 'pointer', marginTop: 8, fontSize: 12, color: 'var(--t3)' }}
                  >
                    <option value="">Velg fylke manuelt</option>
                    {NORWEGIAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Type + Price */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)' }}>
                  Type annonse og pris
                </h2>

                {/* Listing type */}
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 10 }}>Hva tilbyr du?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {([
                      { value: 'sale', label: 'Til salgs', desc: 'Maskinen selges' },
                      { value: 'rent', label: 'Til leie',  desc: 'Maskinen leies ut' },
                      { value: 'both', label: 'Begge',     desc: 'Salg og utleie' },
                    ] as const).map(lt => (
                      <label key={lt.value} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        background: form.listing_type === lt.value ? 'var(--gold4)' : 'var(--bg3)',
                        border: `1px solid ${form.listing_type === lt.value ? 'rgba(200,149,58,0.4)' : 'var(--border)'}`,
                        borderRadius: 4, padding: '14px 10px', cursor: 'pointer',
                        transition: 'all 0.15s', textAlign: 'center',
                      }}>
                        <input
                          type="radio" name="listing_type" value={lt.value}
                          checked={form.listing_type === lt.value}
                          onChange={() => set('listing_type', lt.value)}
                          style={{ accentColor: 'var(--gold)' }}
                        />
                        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: form.listing_type === lt.value ? 'var(--gold)' : 'var(--t1)' }}>{lt.label}</span>
                        <span style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3 }}>{lt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>
                    {form.listing_type === 'rent' ? 'Pris ekskl. MVA (NOK per dag/uke/måned) *' : 'Pris ekskl. MVA (NOK) *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--t3)', fontSize: 14, pointerEvents: 'none',
                    }}>kr</span>
                    <input
                      type="number"
                      value={form.price_ex_vat}
                      onChange={e => set('price_ex_vat', e.target.value)}
                      placeholder="0" min="0"
                      className="input-base"
                      style={{ paddingLeft: 36 }}
                      required
                    />
                  </div>
                  {form.price_ex_vat && Number(form.price_ex_vat) > 0 && (
                    <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--t3)' }}>Ekskl. MVA (25 %)</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', fontFamily: 'Barlow Condensed' }}>
                          {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(Number(form.price_ex_vat))}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--gold)' }}>+ MVA 25 % = Inkl. MVA</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Barlow Condensed' }}>
                          {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(Math.round(Number(form.price_ex_vat) * 1.25))}
                        </span>
                      </div>
                    </div>
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
                  Bilder ({totalImages}/20)
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
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} style={{ display: 'none' }} />
                  <Upload size={28} style={{ color: isDragging ? 'var(--gold)' : 'var(--t3)', marginBottom: 12 }} />
                  <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 16, color: 'var(--t1)', marginBottom: 6 }}>
                    Dra og slipp bilder her
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--t3)' }}>
                    eller klikk for å velge · JPEG, PNG, WebP · Maks 20 bilder
                  </p>
                </div>

                {/* Preview grid: existing + new */}
                {totalImages > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {/* Existing images from storage */}
                    {form.existingImages.map((path, i) => (
                      <div key={`ex-${path}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: 3, overflow: 'hidden' }}>
                        <img src={getListingImageUrl(path)} alt={`Bilde ${i + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && <div style={{ position: 'absolute', bottom: 4, left: 4 }}><span className="tag tag-gold" style={{ fontSize: 9 }}>Hovedbilde</span></div>}
                        <button onClick={() => removeExistingImage(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {/* New images (not yet uploaded) */}
                    {form.imagePreviewUrls.map((url, i) => (
                      <div key={`new-${url}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: 3, overflow: 'hidden' }}>
                        <img src={url} alt={`Nytt bilde ${i + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {form.existingImages.length === 0 && i === 0 && <div style={{ position: 'absolute', bottom: 4, left: 4 }}><span className="tag tag-gold" style={{ fontSize: 9 }}>Hovedbilde</span></div>}
                        <button onClick={() => removeNewImage(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {totalImages < 20 && (
                      <button onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '1', borderRadius: 3, border: '2px dashed var(--border)', background: 'var(--bg3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4, color: 'var(--t3)' }}>
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
                  {(form.existingImages[0] || form.imagePreviewUrls[0]) ? (
                    <img
                      src={form.existingImages[0] ? getListingImageUrl(form.existingImages[0]) : form.imagePreviewUrls[0]}
                      alt={form.title} loading="lazy" style={{ width: '100%', height: 200, objectFit: 'cover' }}
                    />
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
                      <p className="price-display" style={{ fontSize: 22 }}>
                        {form.price_ex_vat ? new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(Number(form.price_ex_vat)) : '—'}
                        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--t3)', marginLeft: 4 }}>eks. mva</span>
                      </p>
                      {form.price_ex_vat && Number(form.price_ex_vat) > 0 && (
                        <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                          {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(Math.round(Number(form.price_ex_vat) * 1.25))} inkl. mva
                        </p>
                      )}
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
