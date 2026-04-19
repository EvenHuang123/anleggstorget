'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Mail, Phone, Calendar, CheckCircle2, Circle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeDate, formatPrice, getListingImageUrl, getListingFallbackImage } from '@/lib/utils/format'
import toast from 'react-hot-toast'

export interface InquiryWithContext {
  id: string
  message: string
  email: string | null
  phone: string | null
  status: 'new' | 'read' | 'replied'
  created_at: string
  listing: {
    id: string
    title: string
    price: number
    category: string
    images: string[]
  }
  sender: {
    company_name: string
    contact_person: string | null
    phone: string | null
  }
}

export default function InquiriesList({ inquiries: initial }: { inquiries: InquiryWithContext[] }) {
  const [inquiries, setInquiries] = useState(initial)
  const supabase = createClient()

  const updateStatus = async (id: string, status: 'read' | 'replied') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('inquiries').update({ status }).eq('id', id)
    if (error) { toast.error('Kunne ikke oppdatere status'); return }
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq))
    toast.success(status === 'read' ? 'Markert som lest' : 'Markert som besvart')
  }

  if (!inquiries.length) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px', textAlign: 'center',
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--bg3)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <MessageSquare size={22} style={{ color: 'var(--t3)' }} />
        </div>
        <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--t1)', marginBottom: 8 }}>
          Ingen forespørsler ennå
        </p>
        <p style={{ color: 'var(--t3)', fontSize: 14 }}>
          Når noen sender forespørsel på annonsene dine vil de vises her.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {inquiries.map(inq => {
        const isNew = inq.status === 'new'
        const isReplied = inq.status === 'replied'
        const imgSrc = inq.listing.images?.[0]
          ? getListingImageUrl(inq.listing.images[0])
          : getListingFallbackImage(inq.listing.category)

        return (
          <div
            key={inq.id}
            style={{
              background: 'var(--bg2)',
              border: `1px solid ${isNew ? 'rgba(200,149,58,0.4)' : 'var(--border)'}`,
              borderRadius: 4,
              padding: '20px 24px',
              position: 'relative',
              transition: 'border-color 0.15s',
            }}
          >
            {/* New badge */}
            {isNew && (
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.4)',
                borderRadius: 12, padding: '3px 10px',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span className="live-dot" style={{ width: 5, height: 5 }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  Ny
                </span>
              </div>
            )}

            {/* Listing row */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 18, paddingRight: isNew ? 70 : 0 }}>
              <Link href={`/annonse/${inq.listing.id}`} style={{
                width: 100, height: 68, borderRadius: 3, overflow: 'hidden',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                flexShrink: 0, display: 'block',
              }}>
                <img src={imgSrc} alt={inq.listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Link>

              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/annonse/${inq.listing.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16,
                      color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {inq.listing.title}
                    </span>
                    <ExternalLink size={12} style={{ color: 'var(--t3)', flexShrink: 0 }} />
                  </div>
                </Link>
                <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--gold)', margin: 0 }}>
                  {formatPrice(inq.listing.price)}
                </p>
              </div>
            </div>

            {/* Sender info + contact */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '14px 18px', marginBottom: 14,
            }} className="inq-grid">
              <div>
                <p className="label-sm" style={{ marginBottom: 5 }}>Fra bedrift</p>
                <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--t1)', margin: '0 0 2px' }}>
                  {inq.sender.company_name}
                </p>
                {inq.sender.contact_person && (
                  <p style={{ color: 'var(--t3)', fontSize: 12, margin: 0 }}>{inq.sender.contact_person}</p>
                )}
              </div>
              <div>
                <p className="label-sm" style={{ marginBottom: 5 }}>Mottatt</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={11} style={{ color: 'var(--t3)' }} />
                  <span style={{ color: 'var(--t2)', fontSize: 13 }}>{formatRelativeDate(inq.created_at)}</span>
                </div>
              </div>
              {inq.email && (
                <a href={`mailto:${inq.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', fontSize: 13, textDecoration: 'none' }}>
                  <Mail size={12} />{inq.email}
                </a>
              )}
              {inq.phone && (
                <a href={`tel:${inq.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', fontSize: 13, textDecoration: 'none' }}>
                  <Phone size={12} />{inq.phone}
                </a>
              )}
            </div>

            {/* Message */}
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '14px 18px', marginBottom: 16,
            }}>
              <p className="label-sm" style={{ marginBottom: 8 }}>Melding</p>
              <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                {inq.message}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {isReplied ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 3,
                }}>
                  <CheckCircle2 size={12} style={{ color: '#4ade80' }} />
                  <span style={{ color: '#4ade80', fontSize: 13 }}>Besvart</span>
                </div>
              ) : (
                <>
                  {isNew && (
                    <button
                      onClick={() => updateStatus(inq.id, 'read')}
                      className="btn-ghost"
                      style={{ fontSize: 13, gap: 6, height: 34 }}
                    >
                      <Circle size={12} /> Merk som lest
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(inq.id, 'replied')}
                    style={{
                      background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.4)',
                      borderRadius: 3, padding: '7px 16px', fontSize: 13, color: 'var(--gold)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      fontFamily: 'Barlow', fontWeight: 500, transition: 'all 0.15s',
                    }}
                  >
                    <CheckCircle2 size={12} /> Merk som besvart
                  </button>
                </>
              )}
              {inq.email && (
                <a href={`mailto:${inq.email}?subject=Re: ${inq.listing.title}&body=Hei ${inq.sender.company_name},%0A%0ATakk for din henvendelse vedr. ${inq.listing.title}.%0A%0A`}
                  className="btn-secondary"
                  style={{ fontSize: 13, gap: 6, height: 34, textDecoration: 'none' }}
                >
                  <Mail size={12} /> Svar via e-post
                </a>
              )}
            </div>
          </div>
        )
      })}

      <style>{`
        @media (max-width: 560px) { .inq-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
