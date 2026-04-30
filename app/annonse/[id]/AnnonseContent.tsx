'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronRight, ChevronLeft, MapPin, Clock, Calendar, Weight,
  Shield, Heart, Share2, Phone, Mail, MessageSquare,
  AlertCircle, X, ZoomIn, Building2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatNumber, formatDate, formatRelativeDate, CATEGORIES, getListingImageUrl } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'
import ListingCard from '@/components/listings/ListingCard'
import toast from 'react-hot-toast'

interface Props {
  listing: Listing
  related: Listing[]
}

const PRICE_TYPE_LABELS: Record<string, string> = {
  fast_price: 'Fast pris',
  negotiable: 'Prisantydning',
  auction: 'Auksjon',
}

export default function AnnonseContent({ listing, related }: Props) {
  const supabase = createClient()

  const images = listing.images?.length
    ? listing.images.map(getListingImageUrl)
    : []

  const [activeImg, setActiveImg] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [inquiry, setInquiry] = useState({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Pre-fill inquiry form + check favorite status
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session?.user) return
      setInquiry(prev => ({ ...prev, email: data.session!.user.email || '' }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: fav } = await (supabase as any)
        .from('favorites')
        .select('id')
        .eq('user_id', data.session!.user.id)
        .eq('listing_id', listing.id)
        .maybeSingle()
      if (fav) setIsFav(true)
    })
  }, [listing.id])

  // Keyboard navigation for lightbox
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!lightbox) return
    if (e.key === 'Escape') setLightbox(false)
    if (e.key === 'ArrowRight') setActiveImg(i => (i + 1) % images.length)
    if (e.key === 'ArrowLeft') setActiveImg(i => (i - 1 + images.length) % images.length)
  }, [lightbox, images.length])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const sendInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiry.message.trim()) return
    setSending(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Logg inn for å sende forespørsel')
      setSending(false)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newInquiry, error } = await (supabase as any).from('inquiries').insert({
      listing_id: listing.id,
      sender_id: session.user.id,
      message: inquiry.message,
      phone: inquiry.phone || null,
      email: inquiry.email || session.user.email || null,
    }).select('id').single() as { data: { id: string } | null; error: unknown }

    setSending(false)
    if (error || !newInquiry) {
      toast.error('Kunne ikke sende forespørsel. Prøv igjen.')
    } else {
      setSent(true)
      setInquiryOpen(false)
      toast.success('Forespørsel sendt! Selger vil kontakte deg.')
      // Fire-and-forget email to seller
      fetch('/api/send-inquiry-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId: newInquiry.id }),
      }).catch(err => console.warn('Email notify failed:', err))
    }
  }

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setActiveImg(i => (i + 1) % images.length)

  return (
    <>
      <div className="container-main" style={{ padding: '32px 24px 80px' }}>
        {/* Breadcrumbs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--t3)', fontSize: 12, textDecoration: 'none' }}>Hjem</Link>
          <ChevronRight size={12} style={{ color: 'var(--t3)' }} />
          <Link href="/sok" style={{ color: 'var(--t3)', fontSize: 12, textDecoration: 'none' }}>Maskiner</Link>
          <ChevronRight size={12} style={{ color: 'var(--t3)' }} />
          <Link href={`/sok?category=${listing.category}`} style={{ color: 'var(--t3)', fontSize: 12, textDecoration: 'none' }}>
            {CATEGORIES[listing.category]?.label}
          </Link>
          <ChevronRight size={12} style={{ color: 'var(--t3)' }} />
          <span style={{ color: 'var(--t2)', fontSize: 12 }}>{listing.title}</span>
        </nav>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'flex-start' }} className="annonse-grid">

          {/* LEFT: Images + Details */}
          <div>
            {/* Gallery */}
            <div style={{ marginBottom: 24 }}>
              {/* Main image */}
              <div
                style={{
                  borderRadius: 4, overflow: 'hidden',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  aspectRatio: '16/9', position: 'relative', marginBottom: 8,
                  cursor: images.length ? 'zoom-in' : 'default',
                }}
                onClick={() => images.length && setLightbox(true)}
              >
                {images[activeImg] ? (
                  <Image
                    src={images[activeImg]}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 960px) 100vw, 60vw"
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                    <svg viewBox="0 0 200 120" style={{ width: 160, opacity: 0.1 }} aria-hidden>
                      <g fill="var(--gold)">
                        <rect x="20" y="38" width="120" height="50" rx="4" />
                        <rect x="28" y="18" width="60" height="32" rx="4" />
                        <rect x="30" y="20" width="56" height="28" rx="2" fill="var(--bg4)" />
                        <rect x="80" y="6" width="10" height="72" rx="4" transform="rotate(-26 80 6)" />
                        <rect x="145" y="3" width="8" height="52" rx="4" transform="rotate(18 145 3)" />
                        <path d="M155 54 L186 63 L182 80 L150 77 Z" />
                        <rect x="8" y="88" width="175" height="18" rx="4" />
                        {[28, 52, 76, 100, 124, 148].map(x => <circle key={x} cx={x} cy={96} r={9} />)}
                      </g>
                    </svg>
                    <p style={{ color: 'var(--t3)', fontSize: 13 }}>Ingen bilder</p>
                  </div>
                )}

                {/* Zoom hint */}
                {images.length > 0 && (
                  <div style={{
                    position: 'absolute', bottom: 10, right: 10,
                    background: 'rgba(13,12,10,0.7)', borderRadius: 3, padding: '5px 8px',
                    display: 'flex', alignItems: 'center', gap: 5,
                    backdropFilter: 'blur(4px)',
                  }}>
                    <ZoomIn size={12} style={{ color: 'var(--t2)' }} />
                    <span style={{ color: 'var(--t2)', fontSize: 11 }}>
                      {activeImg + 1} / {images.length}
                    </span>
                  </div>
                )}

                {/* Prev/next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); prevImg() }}
                      style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(13,12,10,0.7)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3, width: 36, height: 36,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--t1)', backdropFilter: 'blur(4px)',
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); nextImg() }}
                      style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(13,12,10,0.7)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3, width: 36, height: 36,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--t1)', backdropFilter: 'blur(4px)',
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Sold overlay */}
                {listing.status === 'sold' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 36, color: 'white', border: '3px solid white', padding: '8px 32px', borderRadius: 4, transform: 'rotate(-8deg)' }}>SOLGT</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      style={{
                        width: 76, height: 54, borderRadius: 3, overflow: 'hidden', flexShrink: 0,
                        border: `2px solid ${i === activeImg ? 'var(--gold)' : 'transparent'}`,
                        background: 'var(--bg3)', cursor: 'pointer', padding: 0,
                        transition: 'border-color 0.15s', position: 'relative',
                      }}
                    >
                      <img src={img} alt={`${listing.title} – bilde ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + actions */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className="tag tag-gold">{CATEGORIES[listing.category]?.label}</span>
                  {listing.featured && (
                    <span style={{
                      background: 'var(--gold)', color: '#0d0c0a',
                      fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 10,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '3px 8px', borderRadius: 2,
                    }}>Utvalgt</span>
                  )}
                  {listing.status === 'reserved' && <span className="tag tag-gold">Reservert</span>}
                </div>
                <h1 style={{
                  fontFamily: 'Barlow Condensed', fontWeight: 800,
                  fontSize: 'clamp(22px, 3vw, 34px)',
                  color: 'var(--t1)', letterSpacing: '0.01em', lineHeight: 1.1,
                }}>
                  {listing.title}
                </h1>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={async () => {
                    if (favLoading) return
                    const { data: { session } } = await supabase.auth.getSession()
                    if (!session) { toast.error('Logg inn for å lagre favoritter'); return }
                    setFavLoading(true)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const sb = supabase as any
                    if (isFav) {
                      await sb.from('favorites').delete().eq('user_id', session.user.id).eq('listing_id', listing.id)
                      setIsFav(false)
                      toast.success('Fjernet fra favoritter')
                    } else {
                      await sb.from('favorites').insert({ user_id: session.user.id, listing_id: listing.id })
                      setIsFav(true)
                      toast.success('Lagt til i favoritter')
                    }
                    setFavLoading(false)
                  }}
                  style={{
                    background: isFav ? 'var(--gold3)' : 'var(--bg3)',
                    border: `1px solid ${isFav ? 'rgba(200,149,58,0.4)' : 'var(--border)'}`,
                    borderRadius: 3, width: 38, height: 38,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <Heart size={16} fill={isFav ? 'var(--gold)' : 'none'} color={isFav ? 'var(--gold)' : 'var(--t2)'} />
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lenke kopiert!') }}
                  style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 3, width: 38, height: 38,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <Share2 size={15} style={{ color: 'var(--t2)' }} />
                </button>
              </div>
            </div>

            {/* Key stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 32 }} className="stats-row">
              {[
                { icon: Calendar, label: 'Årsmodell', value: listing.year || '—' },
                { icon: Clock, label: 'Driftstimer', value: listing.operating_hours != null ? `${formatNumber(listing.operating_hours)} t` : '—' },
                { icon: Weight, label: 'Vektklasse', value: listing.weight_class || '—' },
                { icon: Heart, label: 'Favoritter', value: String(listing.favorites_count?.[0]?.count ?? 0) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Icon size={11} style={{ color: 'var(--gold)' }} />
                    <span className="label-sm">{label}</span>
                  </div>
                  <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: 32 }}>
                <h2 className="section-title" style={{ fontSize: 18, marginBottom: 14 }}>Beskrivelse</h2>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 24px' }}>
                  {listing.description.split('\n').map((line, i) => (
                    <p key={i} style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.8, marginBottom: line ? 6 : 4 }}>
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Technical specs */}
            <div style={{ marginBottom: 40 }}>
              <h2 className="section-title" style={{ fontSize: 18, marginBottom: 14 }}>Tekniske opplysninger</h2>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                {[
                  { label: 'Kategori', value: CATEGORIES[listing.category]?.label },
                  { label: 'Merke', value: listing.brand },
                  { label: 'Modell', value: listing.model },
                  { label: 'Årsmodell', value: listing.year },
                  { label: 'Driftstimer', value: listing.operating_hours != null ? `${formatNumber(listing.operating_hours)} timer` : null },
                  { label: 'Vektklasse', value: listing.weight_class },
                  { label: 'Lokasjon', value: listing.location },
                  { label: 'Pristype', value: PRICE_TYPE_LABELS[listing.price_type] },
                  { label: 'Annonsedato', value: formatDate(listing.created_at) },
                ].filter(r => r.value != null).map(({ label, value }, i, arr) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', padding: '12px 20px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ color: 'var(--t3)', fontSize: 13, minWidth: 160 }}>{label}</span>
                    <span style={{ color: 'var(--t1)', fontSize: 13, fontWeight: 500 }}>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related listings */}
            {related.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 className="section-title" style={{ fontSize: 18 }}>Lignende annonser</h2>
                  <Link href={`/sok?category=${listing.category}`} style={{ color: 'var(--gold)', fontSize: 13, textDecoration: 'none' }}>
                    Se alle →
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="related-grid">
                  {related.map(r => <ListingCard key={r.id} listing={r} />)}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>
            {/* Price card */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 4, padding: '24px 22px' }}>
              <p className="label-sm" style={{ marginBottom: 6 }}>{PRICE_TYPE_LABELS[listing.price_type]}</p>
              <p className="price-display" style={{ fontSize: 32, marginBottom: 8 }}>
                {formatPrice(listing.price)}
              </p>
              {listing.price_type === 'negotiable' && <div className="tag tag-gold" style={{ marginBottom: 8 }}>Forhandlingsbar</div>}
              {listing.price_type === 'auction' && <div className="tag tag-gold" style={{ marginBottom: 8 }}>Auksjon</div>}

              {listing.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <MapPin size={12} style={{ color: 'var(--t3)' }} />
                  <span style={{ color: 'var(--t3)', fontSize: 13 }}>{listing.location}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Clock size={12} style={{ color: 'var(--t3)' }} />
                <span style={{ color: 'var(--t3)', fontSize: 13 }}>Lagt ut {formatRelativeDate(listing.created_at)}</span>
              </div>
            </div>

            {/* Inquiry CTA */}
            {!sent ? (
              <button
                onClick={() => setInquiryOpen(true)}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: 50, fontSize: 14 }}
              >
                <MessageSquare size={16} />
                Send forespørsel til selger
              </button>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 4,
              }}>
                <MessageSquare size={15} style={{ color: '#4ade80' }} />
                <span style={{ color: '#4ade80', fontSize: 14 }}>Forespørsel sendt!</span>
              </div>
            )}

            {/* Seller card */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 22px' }}>
              <p className="label-sm" style={{ marginBottom: 14 }}>Selger</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 4, flexShrink: 0,
                  background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 18, color: 'var(--gold)',
                }}>
                  {(listing.profiles?.company_name || 'S')[0]}
                </div>
                <div>
                  <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>
                    {listing.profiles?.company_name || 'Selger'}
                  </p>
                  {listing.profiles?.verified && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <Shield size={10} style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: 11, color: 'var(--gold)' }}>Verifisert bedrift</span>
                    </div>
                  )}
                </div>
              </div>

              {listing.profiles?.org_number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Building2 size={12} style={{ color: 'var(--t3)' }} />
                  <span style={{ fontSize: 12, color: 'var(--t3)' }}>Org.nr: {listing.profiles.org_number}</span>
                </div>
              )}

              {listing.profiles?.contact_person && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Mail size={12} style={{ color: 'var(--t3)' }} />
                  <span style={{ fontSize: 13, color: 'var(--t2)' }}>{listing.profiles.contact_person}</span>
                </div>
              )}

              {listing.profiles?.phone && (
                <a
                  href={`tel:${listing.profiles.phone}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--t2)', fontSize: 13, textDecoration: 'none', marginTop: 4 }}
                >
                  <Phone size={12} style={{ color: 'var(--gold)' }} />
                  {listing.profiles.phone}
                </a>
              )}
            </div>

            {/* Safety notice */}
            <div style={{
              display: 'flex', gap: 8, padding: '12px 14px',
              background: 'rgba(200,149,58,0.06)', border: '1px solid rgba(200,149,58,0.15)', borderRadius: 4,
            }}>
              <AlertCircle size={13} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.6 }}>
                Anleggstorget er en markedsplass. Verifiser alltid maskinen og selger før kjøp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && images.length > 0 && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 3, width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--t1)',
            }}
          >
            <X size={18} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prevImg() }}
                style={{
                  position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 3, width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--t1)',
                }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); nextImg() }}
                style={{
                  position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 3, width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--t1)',
                }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative', maxWidth: '90vw', maxHeight: '85vh',
              width: '100%', aspectRatio: '16/9',
            }}
          >
            <Image
              src={images[activeImg]}
              alt={listing.title}
              fill
              sizes="90vw"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          <p style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.5)', fontSize: 13,
          }}>
            {activeImg + 1} / {images.length}
          </p>
        </div>
      )}

      {/* Inquiry modal */}
      {inquiryOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={() => setInquiryOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 4, padding: '32px 28px', width: '100%', maxWidth: 480,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 22, color: 'var(--t1)', letterSpacing: '0.02em' }}>
                  Send forespørsel
                </h2>
                <p style={{ color: 'var(--t3)', fontSize: 13, marginTop: 2 }}>
                  Til: {listing.profiles?.company_name || 'Selger'}
                </p>
              </div>
              <button
                onClick={() => setInquiryOpen(false)}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3,
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--t3)',
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3, padding: '10px 14px', marginBottom: 20 }}>
              <p style={{ color: 'var(--t3)', fontSize: 12 }}>
                <span style={{ color: 'var(--t2)' }}>{listing.title}</span>
                {' — '}
                <span style={{ color: 'var(--gold)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                  {formatPrice(listing.price)}
                </span>
              </p>
            </div>

            <form onSubmit={sendInquiry} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>E-post</label>
                  <input
                    type="email"
                    value={inquiry.email}
                    onChange={e => setInquiry(p => ({ ...p, email: e.target.value }))}
                    placeholder="din@bedrift.no"
                    className="input-base"
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>Telefon</label>
                  <input
                    type="tel"
                    value={inquiry.phone}
                    onChange={e => setInquiry(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+47 000 00 000"
                    className="input-base"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>Melding *</label>
                <textarea
                  value={inquiry.message}
                  onChange={e => setInquiry(p => ({ ...p, message: e.target.value }))}
                  placeholder={`Hei, jeg er interessert i ${listing.title}. Er maskinen fortsatt tilgjengelig?`}
                  className="input-base"
                  rows={4}
                  style={{ resize: 'vertical', minHeight: 100, fontSize: 13 }}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={sending || !inquiry.message.trim()}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: 13 }}
              >
                {sending ? 'Sender...' : 'Send forespørsel'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center' }}>
                Du må være innlogget for å sende forespørsel.
              </p>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .annonse-grid { grid-template-columns: 1fr 380px !important; }
        .stats-row { grid-template-columns: repeat(4, 1fr) !important; }
        .related-grid { grid-template-columns: repeat(3, 1fr) !important; }
        @media (max-width: 960px) {
          .annonse-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
          .related-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
