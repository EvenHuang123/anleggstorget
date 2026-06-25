'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
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
      .select('id, title, category, price, price_type, images, year, location, slug')
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
    return <div className="card shimmer" style={{ borderRadius: 16, height: 400 }} />
  }
  if (listings.length === 0) return null

  const listing = listings[current]
  const imageUrl = listing.images?.[0] ? getListingImageUrl(listing.images[0]) : null
  const href = `/annonse/${listing.slug ?? listing.id}`

  // Adjacent listing images for preloading
  const prevUrl = listings.length > 1
    ? getListingImageUrl(listings[(current - 1 + listings.length) % listings.length].images?.[0] ?? '')
    : null
  const nextUrl = listings.length > 1
    ? getListingImageUrl(listings[(current + 1) % listings.length].images?.[0] ?? '')
    : null

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ position: 'relative' }}
    >
      {/* Preload adjacent images so karusellbytte ikke gir grå flash */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }} aria-hidden>
        {prevUrl && <img src={prevUrl} alt="" style={{ width: 1, height: 1 }} />}
        {nextUrl && <img src={nextUrl} alt="" style={{ width: 1, height: 1 }} />}
      </div>

      {/* Card */}
      <div
        key={listing.id}
        style={{
          background: 'rgba(13, 12, 10, 0.82)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid var(--border2)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)',
          animation: 'heroCardIn 0.32s ease',
        }}
      >
        {/* Image — 70% av kortets høyde, edge-to-edge */}
        <div style={{
          height: 300,
          position: 'relative',
          overflow: 'hidden',
          background: '#0d0c0a',
        }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              sizes="480px"
              priority={current === 0}
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'opacity 0.2s ease-in-out',
              }}
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

        {/* Informasjonsboks — 30% av kortets høyde */}
        <div style={{ padding: '12px 16px 0' }}>
          <h3 style={{
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18,
            color: '#fff', marginBottom: 8, letterSpacing: '0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {listing.title}
          </h3>

          <div style={{ display: 'flex', gap: 16 }}>
            {listing.year && (
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1 }}>Årsmodell</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500 }}>{listing.year}</p>
              </div>
            )}
            {listing.location && (
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1 }}>Lokasjon</p>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {listing.location}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer: pil-knapper + dots til venstre, SE ANNONSE til høyre */}
        <div style={{
          padding: '10px 16px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {listings.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  aria-label="Forrige annonse"
                  className="hero-nav-btn"
                  style={{
                    width: 32, height: 32,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: current === 0 ? 'default' : 'pointer',
                    opacity: current === 0 ? 0.3 : 1,
                    pointerEvents: current === 0 ? 'none' : 'auto',
                    padding: 0, flexShrink: 0,
                  }}
                >
                  <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 12L6 8l4-4"/>
                  </svg>
                </button>
                <button
                  onClick={goNext}
                  aria-label="Neste annonse"
                  className="hero-nav-btn"
                  style={{
                    width: 32, height: 32,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: current === listings.length - 1 ? 'default' : 'pointer',
                    opacity: current === listings.length - 1 ? 0.3 : 1,
                    pointerEvents: current === listings.length - 1 ? 'none' : 'auto',
                    padding: 0, flexShrink: 0,
                  }}
                >
                  <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 4l4 4-4 4"/>
                  </svg>
                </button>

                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {listings.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      aria-label={`Gå til annonse ${i + 1}`}
                      style={{
                        width: i === current ? 16 : 5,
                        height: 5, borderRadius: 3,
                        background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                        border: 'none', cursor: 'pointer', padding: 0,
                        transition: 'all 0.25s ease',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <Link
            href={href}
            style={{
              background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.25)',
              color: 'var(--gold)', borderRadius: 6,
              fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 12,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '7px 14px', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            Se annonse <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes heroCardIn {
          from { opacity: 0.4; transform: translateY(5px); }
          to   { opacity: 1;   transform: translateY(0);   }
        }
        .hero-nav-btn { transition: all 0.15s ease; }
        .hero-nav-btn:hover { background: rgba(255,255,255,0.22) !important; color: white !important; }
      `}</style>
    </div>
  )
}
