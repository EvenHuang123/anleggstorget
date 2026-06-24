'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Heart, MapPin, Clock, Calendar, ArrowRight, Shield } from 'lucide-react'
import { formatPrice, formatNumber, formatRelativeDate, getListingImageUrl, getListingFallbackImage, CATEGORIES } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'

interface Props {
  listing: Listing
  onToggleFavorite?: (id: string) => void
  isFavorite?: boolean
}

export default function ListingCard({ listing, onToggleFavorite, isFavorite }: Props) {
  const fallback = getListingFallbackImage(listing.category)
  const [imgSrc, setImgSrc] = useState(
    listing.images?.[0] ? getListingImageUrl(listing.images[0]) : fallback
  )

  return (
    <Link href={`/annonse/${listing.slug || listing.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article className="card card-gold" style={{ overflow: 'hidden', cursor: 'pointer' }}>
        {/* Image */}
        <div className="listing-img-wrap">
          <Image
            src={imgSrc}
            alt={`${listing.title}${listing.location ? ` – ${listing.location}` : ''} – ${CATEGORIES[listing.category]?.label || listing.category} til salgs`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            onError={() => setImgSrc(fallback)}
            className="listing-img"
            style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
          />

          {/* Overlays */}
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span className="tag tag-category">{CATEGORIES[listing.category]?.label || listing.category}</span>
            {listing.listing_type === 'rent' && (
              <span className="tag" style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>Til leie</span>
            )}
            {listing.listing_type === 'both' && (
              <span className="tag" style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.25)' }}>Salg & leie</span>
            )}
          </div>

          {listing.featured && (
            <div style={{
              position: 'absolute', top: 10, right: 40, zIndex: 2,
              background: 'var(--gold)', color: '#0d0c0a',
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: 2,
            }}>
              Utvalgt
            </div>
          )}

          {onToggleFavorite && (
            <button
              onClick={e => { e.preventDefault(); onToggleFavorite(listing.id) }}
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: 2,
                background: isFavorite ? 'rgba(200,149,58,0.3)' : 'rgba(13,12,10,0.6)',
                border: `1px solid ${isFavorite ? 'rgba(200,149,58,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '50%', width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', backdropFilter: 'blur(4px)',
                transition: 'all 0.15s ease',
              }}
            >
              <Heart size={13} fill={isFavorite ? 'var(--gold)' : 'none'} color={isFavorite ? 'var(--gold)' : 'var(--t1)'} />
            </button>
          )}

          {listing.status === 'sold' && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 3,
              background: 'rgba(13,12,10,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 22,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--t1)', border: '2px solid var(--t1)',
                padding: '6px 20px', borderRadius: 3, transform: 'rotate(-10deg)',
              }}>
                Solgt
              </span>
            </div>
          )}

          {listing.status === 'reserved' && (
            <div className="tag tag-gold" style={{
              position: 'absolute', bottom: 10, left: 10, zIndex: 2,
            }}>
              Reservert
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px' }}>
          <h3 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16,
            color: 'var(--t1)', marginBottom: 10, letterSpacing: '0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {listing.title}
          </h3>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
            {listing.year && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t3)', fontSize: 12 }}>
                <Calendar size={11} />
                <span>{listing.year}</span>
              </div>
            )}
            {listing.operating_hours != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t3)', fontSize: 12 }}>
                <Clock size={11} />
                <span>{formatNumber(listing.operating_hours)} t</span>
              </div>
            )}
            {listing.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t3)', fontSize: 12 }}>
                <MapPin size={11} />
                <span>{listing.location}</span>
              </div>
            )}
          </div>

          {/* Price + brand row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              {listing.brand && (
                <p className="label-sm" style={{ marginBottom: 3 }}>{listing.brand}</p>
              )}
              {/* Primary price — ex VAT if available, else legacy price */}
              <p className="price-display" style={{ fontSize: 17 }}>
                {formatPrice(listing.price_ex_vat ?? listing.price, listing.price_type)}
                {listing.price_ex_vat != null && (
                  <span style={{ fontFamily: 'Barlow', fontSize: 10, fontWeight: 400, color: 'var(--t3)', marginLeft: 4 }}>eks. mva</span>
                )}
              </p>
              {/* Inc-VAT line — only when price_inc_vat is populated */}
              {listing.price_inc_vat != null && (
                <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>
                  {formatPrice(listing.price_inc_vat)} inkl. mva
                </p>
              )}
              {listing.price_type === 'negotiable' && !listing.price_inc_vat && (
                <p style={{ fontSize: 11, color: 'var(--t3)' }}>Forhandlingsbar</p>
              )}
            </div>
            <div style={{
              color: 'var(--gold)', opacity: 0,
              transition: 'opacity 0.15s',
            }} className="card-arrow">
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {listing.profiles?.verified && (
                <Shield size={11} style={{ color: 'var(--gold)' }} />
              )}
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                {listing.profiles?.company_name || 'Selger'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(listing.favorites_count?.[0]?.count ?? 0) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Heart size={10} style={{ color: 'var(--t3)' }} />
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>{listing.favorites_count![0].count}</span>
                </div>
              )}
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                {formatRelativeDate(listing.created_at)}
              </span>
            </div>
          </div>
        </div>
      </article>

      <style>{`
        article:hover .listing-img { transform: scale(1.04) !important; }
        article:hover .card-arrow { opacity: 1 !important; }
      `}</style>
    </Link>
  )
}
