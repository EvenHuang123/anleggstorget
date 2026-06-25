'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getListingImageUrl } from '@/lib/utils/format'
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
      .neq('category', 'Annet')
      .not('images', 'eq', '{}')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }: { data: Listing[] | null }) => {
        setListings((data ?? []).filter(l => l.images && l.images.length > 0))
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
    return <div className="card shimmer" style={{ borderRadius: 16, height: 480 }} />
  }
  if (listings.length === 0) return null

  const listing = listings[current]
  const imageUrl = listing.images?.[0] ? getListingImageUrl(listing.images[0]) : null
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
          background: 'rgba(13, 12, 10, 0.78)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid var(--border2)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)',
          animation: 'heroCardIn 0.32s ease',
        }}
      >
        {/* Image — 280px, edge-to-edge, no padding */}
        <div style={{
          height: 280,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--bg3) 0%, var(--bg4) 100%)',
        }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              sizes="480px"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
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

          {/* Top gradient for badge readability */}
          {imageUrl && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, transparent 45%)' }} />
          )}

          {/* Category badge — skjules for 'Annet' */}
          {listing.category && listing.category !== 'Annet' && (
            <div className="tag tag-category" style={{ position: 'absolute', top: 14, left: 14 }}>
              {listing.category}
            </div>
          )}

          {/* Counter */}
          {listings.length > 1 && (
            <div style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.9)',
              fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 11,
              letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 2,
            }}>
              {current + 1} / {listings.length}
            </div>
          )}
        </div>

        {/* Card content */}
        <div style={{ padding: '18px 22px 14px' }}>
          <h3 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 19,
            color: 'var(--t1)', marginBottom: 14, letterSpacing: '0.01em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.25,
            minHeight: '2.5em',
          }}>
            {listing.title}
          </h3>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
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
              <div style={{ minWidth: 0 }}>
                <p className="label-sm" style={{ marginBottom: 2 }}>Lokasjon</p>
                <p style={{ color: 'var(--t1)', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {listing.location}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer: selger-badge + dot-indikatorer + Se annonse-knapp */}
        <div style={{
          padding: '12px 22px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Shield size={12} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>Verifisert norsk bedrift</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

            <Link
              href={href}
              style={{
                background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.25)',
                color: 'var(--gold)', borderRadius: 6,
                fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '8px 16px', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 5,
                whiteSpace: 'nowrap',
              }}
            >
              Se annonse <ArrowRight size={12} />
            </Link>
          </div>
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
