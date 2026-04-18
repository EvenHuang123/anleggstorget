'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, MapPin, Clock, Calendar, Weight, Shield, Heart, Share2, Eye, Phone, Mail, MessageSquare, AlertCircle, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatNumber, formatDate, CATEGORIES, getListingImageUrl } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'
import toast from 'react-hot-toast'

const DEMO_LISTING: Listing = {
  id: 'demo', seller_id: 'a', category: 'gravemaskin',
  title: 'Volvo EC480E Gravemaskin 2021', brand: 'Volvo', model: 'EC480E',
  year: 2021, operating_hours: 3200, weight_class: '40-50 tonn', price: 3850000,
  price_type: 'fast_price', location: 'Vestland', status: 'active',
  images: [], featured: true, views: 142,
  description: 'Velholdt Volvo EC480E gravemaskin fra 2021 med kun 3 200 driftstimer. Maskinen er i meget god stand og har vært grundig vedlikeholdt etter serviceplan. Siste service ble utført mars 2026.\n\nUtstyr inkludert:\n- Hurtigkobling Engcon EC25\n- 2 skuffer (900mm og 1200mm)\n- Hammerfeste\n- LED-lys rundt\n- Ryggekamera\n\nMaskinen kan besøkes etter avtale på vårt anlegg i Vestland.',
  created_at: '2026-04-15T08:00:00Z', updated_at: '2026-04-15T08:00:00Z',
  profiles: { id: 'a', company_name: 'Bergvik Maskin AS', org_number: '123 456 789', contact_person: 'Bjørn Bergvik', phone: '+47 900 00 000', verified: true, created_at: '2026-01-01T00:00:00Z' },
}

export default function AnnonseContent({ id }: { id: string }) {
  const supabase = createClient()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [inquiry, setInquiry] = useState({ message: '', phone: '', email: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('listings')
          .select('*, profiles(company_name, verified, org_number, contact_person, phone)')
          .eq('id', id)
          .single()
        setListing((data as unknown as Listing) || DEMO_LISTING)
      } catch {
        setListing(DEMO_LISTING)
      } finally {
        setLoading(false)
      }
    }
    load()
    // increment views
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).rpc('increment_listing_views', { listing_id: id }).catch(() => {})
  }, [id])

  const sendInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { toast.error('Logg inn for å sende forespørsel'); setSending(false); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('inquiries').insert({
      listing_id: id,
      sender_id: session.user.id,
      message: inquiry.message,
      phone: inquiry.phone || null,
      email: inquiry.email || session.user.email || null,
    })
    setSending(false)
    if (error) {
      toast.error('Kunne ikke sende forespørsel')
    } else {
      setSent(true)
      toast.success('Forespørsel sendt!')
    }
  }

  if (loading) {
    return (
      <div className="container-main" style={{ padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }}>
          <div className="card shimmer" style={{ height: 480 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card shimmer" style={{ height: 200 }} />
            <div className="card shimmer" style={{ height: 280 }} />
          </div>
        </div>
      </div>
    )
  }

  if (!listing) return null

  const images = listing.images?.length
    ? listing.images.map(getListingImageUrl)
    : [null]

  return (
    <div className="container-main" style={{ padding: '32px 24px 80px' }}>
      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }} className="annonse-grid">

        {/* Left: Images + Details */}
        <div>
          {/* Main image */}
          <div style={{
            borderRadius: 4, overflow: 'hidden',
            background: 'var(--bg3)', border: '1px solid var(--border)',
            aspectRatio: '16/9', position: 'relative',
            marginBottom: 8,
          }}>
            {images[activeImg] ? (
              <Image
                src={images[activeImg]!}
                alt={listing.title}
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <svg viewBox="0 0 200 120" style={{ width: 160, opacity: 0.1 }} aria-hidden>
                  <g fill="var(--gold)">
                    <rect x="20" y="38" width="120" height="50" rx="4" />
                    <rect x="28" y="18" width="60" height="32" rx="4" />
                    <rect x="30" y="20" width="56" height="28" rx="2" fill="var(--bg4)" />
                    <rect x="80" y="6" width="10" height="72" rx="4" transform="rotate(-26 80 6)" />
                    <rect x="145" y="3" width="8" height="52" rx="4" transform="rotate(18 145 3)" />
                    <path d="M155 54 L186 63 L182 80 L150 77 Z" />
                    <rect x="8" y="88" width="175" height="18" rx="4" />
                    {[28,52,76,100,124,148].map(x => <circle key={x} cx={x} cy={96} r={9} />)}
                  </g>
                </svg>
              </div>
            )}

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(13,12,10,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--t1)' }}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % images.length)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(13,12,10,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--t1)' }}>
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Status badge */}
            {listing.status === 'sold' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 32, color: 'white', border: '3px solid white', padding: '8px 28px', borderRadius: 4, transform: 'rotate(-8deg)' }}>SOLGT</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: 72, height: 52, borderRadius: 3, overflow: 'hidden', flexShrink: 0,
                  border: `2px solid ${i === activeImg ? 'var(--gold)' : 'transparent'}`,
                  background: 'var(--bg3)', cursor: 'pointer', padding: 0,
                  transition: 'border-color 0.15s',
                }}>
                  {img && <img src={img} alt={`${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </button>
              ))}
            </div>
          )}

          {/* Info section */}
          <div style={{ marginTop: 32 }}>
            {/* Title + actions */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="tag tag-gold" style={{ marginBottom: 10 }}>
                  {CATEGORIES[listing.category]?.label}
                </div>
                <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 32px)', color: 'var(--t1)', letterSpacing: '0.01em', lineHeight: 1.1 }}>
                  {listing.title}
                </h1>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => { setIsFav(!isFav); toast.success(isFav ? 'Fjernet fra favoritter' : 'Lagt til i favoritter') }}
                  style={{
                    background: isFav ? 'var(--gold3)' : 'var(--bg3)',
                    border: `1px solid ${isFav ? 'rgba(200,149,58,0.4)' : 'var(--border)'}`,
                    borderRadius: 3, width: 38, height: 38,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Heart size={16} fill={isFav ? 'var(--gold)' : 'none'} color={isFav ? 'var(--gold)' : 'var(--t2)'} />
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lenke kopiert!') }}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 3, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Share2 size={15} style={{ color: 'var(--t2)' }} />
                </button>
              </div>
            </div>

            {/* Key stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }} className="stats-row">
              {[
                { icon: Calendar, label: 'Årsmodell', value: listing.year || '—' },
                { icon: Clock, label: 'Driftstimer', value: listing.operating_hours != null ? `${formatNumber(listing.operating_hours)} t` : '—' },
                { icon: Weight, label: 'Vektklasse', value: listing.weight_class || '—' },
                { icon: Eye, label: 'Visninger', value: formatNumber(listing.views) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Icon size={11} style={{ color: 'var(--gold)' }} />
                    <span className="label-sm">{label}</span>
                  </div>
                  <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 15, color: 'var(--t1)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--t1)', letterSpacing: '0.02em', marginBottom: 12 }}>
                  Beskrivelse
                </h2>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 24px' }}>
                  {listing.description.split('\n').map((line, i) => (
                    <p key={i} style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.7, marginBottom: line ? 8 : 4 }}>
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Technical specs */}
            <div>
              <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--t1)', letterSpacing: '0.02em', marginBottom: 12 }}>
                Tekniske opplysninger
              </h2>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                {[
                  { label: 'Kategori', value: CATEGORIES[listing.category]?.label },
                  { label: 'Merke', value: listing.brand },
                  { label: 'Modell', value: listing.model },
                  { label: 'Årsmodell', value: listing.year },
                  { label: 'Driftstimer', value: listing.operating_hours != null ? `${formatNumber(listing.operating_hours)} timer` : null },
                  { label: 'Vektklasse', value: listing.weight_class },
                  { label: 'Lokasjon', value: listing.location },
                  { label: 'Annonsedato', value: formatDate(listing.created_at) },
                ].filter(r => r.value).map(({ label, value }, i, arr) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', padding: '12px 20px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ color: 'var(--t3)', fontSize: 13, minWidth: 140, fontFamily: 'Barlow' }}>{label}</span>
                    <span style={{ color: 'var(--t1)', fontSize: 13, fontWeight: 500 }}>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Price card */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 4, padding: '24px 22px' }}>
            <p className="label-sm" style={{ marginBottom: 6 }}>
              {listing.price_type === 'auction' ? 'Startpris' : listing.price_type === 'negotiable' ? 'Prisantydning' : 'Pris'}
            </p>
            <p className="price-display" style={{ fontSize: 30, marginBottom: 4 }}>
              {formatPrice(listing.price)}
            </p>
            {listing.price_type === 'negotiable' && (
              <div className="tag tag-gold" style={{ marginBottom: 4 }}>Forhandlingsbar</div>
            )}
            {listing.price_type === 'auction' && (
              <div className="tag tag-gold" style={{ marginBottom: 4 }}>Auksjon</div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <MapPin size={12} style={{ color: 'var(--t3)' }} />
              <span style={{ color: 'var(--t3)', fontSize: 13 }}>{listing.location || '—'}</span>
            </div>
          </div>

          {/* Seller card */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 4,
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Shield size={10} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontSize: 11, color: 'var(--gold)' }}>Verifisert bedrift</span>
                  </div>
                )}
              </div>
            </div>

            {listing.profiles?.org_number && (
              <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>
                Org.nr: {listing.profiles.org_number}
              </p>
            )}

            {listing.profiles?.phone && (
              <a href={`tel:${listing.profiles.phone}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'var(--t2)', fontSize: 13, textDecoration: 'none',
                padding: '8px 0',
              }}>
                <Phone size={13} style={{ color: 'var(--gold)' }} />
                {listing.profiles.phone}
              </a>
            )}
          </div>

          {/* Inquiry form */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MessageSquare size={15} style={{ color: 'var(--gold)' }} />
              <h3 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: 'var(--t1)', letterSpacing: '0.02em' }}>
                Send forespørsel
              </h3>
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <MessageSquare size={18} style={{ color: '#4ade80' }} />
                </div>
                <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: 'var(--t1)', marginBottom: 4 }}>Forespørsel sendt!</p>
                <p style={{ color: 'var(--t3)', fontSize: 13 }}>Selger vil kontakte deg snart.</p>
              </div>
            ) : (
              <form onSubmit={sendInquiry} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>Melding *</label>
                  <textarea
                    value={inquiry.message}
                    onChange={e => setInquiry(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Jeg er interessert i denne maskinen..."
                    className="input-base"
                    rows={3}
                    style={{ resize: 'vertical', minHeight: 80, fontSize: 13 }}
                    required
                  />
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>E-post</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                    <input type="email" value={inquiry.email} onChange={e => setInquiry(prev => ({ ...prev, email: e.target.value }))} placeholder="din@bedrift.no" className="input-base" style={{ paddingLeft: 30, fontSize: 13 }} />
                  </div>
                </div>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 5 }}>Telefon</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
                    <input type="tel" value={inquiry.phone} onChange={e => setInquiry(prev => ({ ...prev, phone: e.target.value }))} placeholder="+47 000 00 000" className="input-base" style={{ paddingLeft: 30, fontSize: 13 }} />
                  </div>
                </div>
                <button type="submit" disabled={sending} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 13 }}>
                  {sending ? 'Sender...' : 'Send forespørsel'}
                </button>
                <p style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'center' }}>
                  Logg inn for å sende forespørsel
                </p>
              </form>
            )}
          </div>

          {/* Warning */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 14px', background: 'rgba(200,149,58,0.06)', border: '1px solid rgba(200,149,58,0.15)', borderRadius: 4 }}>
            <AlertCircle size={13} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
              Maskintorget er en markedsplass. Verifiser alltid maskinen og selger før kjøp.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .annonse-grid { grid-template-columns: 1fr 360px !important; }
        .stats-row { grid-template-columns: repeat(4, 1fr) !important; }
        @media (max-width: 960px) {
          .annonse-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
