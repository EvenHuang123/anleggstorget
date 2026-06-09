'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, CATEGORIES, getListingImageUrl } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'

export default function HeroCarousel() {
  const [listings, setListings] = useState<Listing[]>([])
  const [current, setCurrent]   = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [loaded, setLoaded]     = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('listings')
      .select('id, title, category, price, price_type, images, year, operating_hours, location, slug')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(16)
      .then(({ data }: { data: Listing[] | null }) => {
        const withImages = (data ?? []).filter(l => l.images && l.images.length > 0).slice(0, 8)
        setListings(withImages)
        setLoaded(true)
      })
  }, [])

  const goNext = useCallback(() =>
    setCurrent(p => (p + 1) % listings.length), [listings.length])

  const goPrev = useCallback(() =>
    setCurrent(p => (p - 1 + listings.length) % listings.length), [listings.length])

  useEffect(() => {
    if (isPaused || listings.length <= 1) return
    const t = setInterval(goNext, 3000)
    return () => clearInterval(t)
  }, [isPaused, goNext, listings.length])

  if (!loaded) {
    return <div className="card shimmer" style={{ borderRadius: 4, height: 340 }} />
  }
  if (listings.length === 0) return null

  const listing = listings[current]
  const imageUrl = listing.images?.[0] ? getListingImageUrl(listing.images[0]) : null
  const categoryLabel = CATEGORIES[listing.category]?.label ?? listing.category
  const href = `/annonse/${listing.slug ?? listing.id}`

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ position: 'relative' }}
    >
      {/* Card */}
      <div
        key={listing.id}
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          animation: 'heroCardIn 0.32s ease',
        }}
      >
        {/* Image area */}
        <div style={{
          height: 160,
          background: 'linear-gradient(135deg, var(--bg3) 0%, var(--bg4) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={listing.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <svg viewBox="0 0 200 120" style={{ width: 180, opacity: 0.15 }} aria-hidden>
                <g fill="var(--gold)">
                  <rect x="30" y="50" width="120" height="45" rx="3" />
                  <rect x="40" y="28" width="60" height="38" rx="3" />
                  <rect x="42" y="30" width="56" height="34" rx="2" fill="var(--bg4)" />
                  <rect x="80" y="10" width="10" height="80" rx="3" transform="rotate(-25 80 10)" />
                  <rect x="135" y="5" width="8" height="60" rx="3" transform="rotate(15 135 5)" />
                  <path d="M155 58 L175 65 L172 80 L150 78 Z" />
                  <rect x="20" y="93" width="160" height="14" rx="3" />
                  {[40,65,90,115,140].map(x => <circle key={x} cx={x} cy={98} r={7} />)}
                </g>
              </svg>
            </div>
          )}

          {/* Darkening overlay for badges */}
          {imageUrl && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />
          )}

          {/* Category badge */}
          <div className="tag tag-gold" style={{ position: 'absolute', top: 12, left: 12 }}>
            {categoryLabel}
          </div>

          {/* Counter */}
          {listings.length > 1 && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.9)',
              fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 11,
              letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 2,
            }}>
              {current + 1} / {listings.length}
            </div>
          )}
        </div>

        {/* Card content */}
        <div style={{ padding: '16px 20px 20px' }}>
          <h3 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 17,
            color: 'var(--t1)', marginBottom: 8, letterSpacing: '0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {listing.title}
          </h3>

          <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
            {listing.year && (
              <div>
                <p className="label-sm" style={{ marginBottom: 2 }}>Årsmodell</p>
                <p style={{ color: 'var(--t1)', fontSize: 13, fontWeight: 500 }}>{listing.year}</p>
              </div>
            )}
            {listing.operating_hours != null && (
              <div>
                <p className="label-sm" style={{ marginBottom: 2 }}>Timer</p>
                <p style={{ color: 'var(--t1)', fontSize: 13, fontWeight: 500 }}>
                  {listing.operating_hours.toLocaleString('nb-NO')} t
                </p>
              </div>
            )}
            {listing.location && (
              <div>
                <p className="label-sm" style={{ marginBottom: 2 }}>Lokasjon</p>
                <p style={{ color: 'var(--t1)', fontSize: 13, fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {listing.location}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="label-sm" style={{ marginBottom: 2 }}>Pris</p>
              <p className="price-display" style={{ fontSize: 22 }}>
                {listing.price > 0 ? formatPrice(listing.price) : 'Pris på forespørsel'}
              </p>
            </div>
            <Link
              href={href}
              style={{
                background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.2)',
                color: 'var(--gold)', borderRadius: 3,
                fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '8px 16px', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              Se annonse <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Footer: seller badge + dot indicators */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={12} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>Verifisert norsk bedrift</span>
          </div>

          {listings.length > 1 && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {listings.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Gå til annonse ${i + 1}`}
                  style={{
                    width: i === current ? 18 : 6,
                    height: 6, borderRadius: 3,
                    background: i === current ? 'var(--gold)' : 'var(--border2)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 0.25s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {listings.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Forrige annonse"
            style={{
              position: 'absolute', left: -14, top: '45%', transform: 'translateY(-50%)',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '50%', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--t2)', zIndex: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={goNext}
            aria-label="Neste annonse"
            style={{
              position: 'absolute', right: -14, top: '45%', transform: 'translateY(-50%)',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '50%', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--t2)', zIndex: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}

      <style>{`
        @keyframes heroCardIn {
          from { opacity: 0.4; transform: translateY(5px); }
          to   { opacity: 1;   transform: translateY(0);   }
        }
      `}</style>
    </div>
  )
}
