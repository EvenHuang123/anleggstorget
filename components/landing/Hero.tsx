'use client'

import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { useEffect, useRef } from 'react'

const FEATURED_PREVIEW = {
  title: 'Volvo EC480E Gravemaskin',
  year: 2021,
  hours: 3200,
  price: 3850000,
  location: 'Vestland',
  category: 'Gravemaskin',
}

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      // Parallax is skipped on mobile — saves CPU and avoids LCP regression
      if (!bgRef.current || window.innerWidth < 768) return
      bgRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Background photo — parallax */}
      <div ref={bgRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        backgroundImage: 'url("/url.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.28,
        willChange: 'transform',
      }} />

      {/* Gradient overlay for readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: 'linear-gradient(135deg, var(--bg) 0%, transparent 40%, var(--bg) 100%)',
      }} />

      {/* Grid overlay */}
      <div className="grid-overlay" style={{
        position: 'absolute', inset: 0,
        opacity: 0.6,
      }} />

      {/* Radial gradient spotlight */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 70% at 30% 50%, rgba(200,149,58,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
        background: 'linear-gradient(to top, var(--bg), transparent)',
        pointerEvents: 'none',
      }} />

      <div className="container-main" style={{ position: 'relative', zIndex: 1, padding: '80px 0 100px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }} className="hero-grid">

          {/* Left: Text content */}
          <div>
            {/* Top label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '6px 14px',
              }}>
                <span className="live-dot" />
                <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t1)' }}>
                  Live markedsplass
                </span>
              </div>
              <div className="tag tag-gold">Ny plattform 2025</div>
            </div>

            {/* Main heading */}
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(52px, 7vw, 96px)',
              lineHeight: 0.92,
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              color: 'var(--t1)',
              marginBottom: 28,
            }}>
              Norges{' '}
              <span style={{
                display: 'block',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                B2B Maskin
              </span>
              markedsplass
            </h1>

            {/* Subheading — t1 on light bg: ~15:1 contrast */}
            <p style={{
              color: 'var(--t1)',
              fontSize: 17,
              lineHeight: 1.65,
              maxWidth: 480,
              marginBottom: 40,
              fontWeight: 400,
            }}>
              Kjøp, selg og leie tunge maskiner direkte mellom verifiserte norske bedrifter —
              trygt, effektivt og uten mellomledd.
            </p>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
              {[
                { icon: Shield, text: 'Verifiserte bedrifter' },
                { icon: TrendingUp, text: 'Markedspris-innsikt' },
                { icon: Clock, text: 'Rask saksbehandling' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={14} aria-hidden="true" style={{ color: 'var(--gold)' }} />
                  <span style={{ fontSize: 14, color: 'var(--t1)', fontFamily: 'Barlow', fontWeight: 400 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/sok" className="btn-primary" style={{ fontSize: 14, padding: '14px 28px' }}>
                Finn maskiner
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/ny-annonse" className="btn-secondary" style={{ padding: '14px 28px' }}>
                Legg ut gratis
              </Link>
            </div>
          </div>

          {/* Right: Featured card + SVG illustration */}
          <div style={{ position: 'relative' }}>
            {/* Machine SVG illustration (sepia-toned) */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <svg viewBox="0 0 400 280" style={{
                width: '100%', opacity: 0.18,
                filter: 'sepia(1) brightness(0.8)',
                position: 'absolute', top: -40, right: -20,
              }} aria-hidden>
                {/* Excavator silhouette */}
                <g fill="var(--gold)">
                  {/* Body */}
                  <rect x="80" y="140" width="200" height="80" rx="4" />
                  {/* Cabin */}
                  <rect x="100" y="100" width="100" height="60" rx="4" />
                  <rect x="110" y="108" width="80" height="44" rx="2" fill="#0d0c0a" opacity="0.5" />
                  {/* Boom arm */}
                  <rect x="195" y="60" width="16" height="110" rx="4" transform="rotate(-30 195 60)" />
                  {/* Stick */}
                  <rect x="285" y="50" width="12" height="90" rx="4" transform="rotate(20 285 50)" />
                  {/* Bucket */}
                  <path d="M310 120 L340 130 L335 150 L305 148 Z" rx="2" />
                  {/* Undercarriage */}
                  <rect x="60" y="218" width="240" height="24" rx="4" />
                  {/* Tracks */}
                  <rect x="50" y="212" width="260" height="8" rx="4" />
                  <rect x="50" y="226" width="260" height="8" rx="4" />
                  {/* Track rollers */}
                  {[80, 120, 160, 200, 240, 280].map(x => (
                    <circle key={x} cx={x} cy={222} r={10} />
                  ))}
                </g>
              </svg>
            </div>

            {/* Featured listing card */}
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border2)',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 2,
            }}>
              {/* Card top: image area */}
              <div style={{
                height: 160,
                background: 'linear-gradient(135deg, var(--bg3) 0%, var(--bg4) 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
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

                {/* Category badge */}
                <div className="tag tag-gold" style={{ position: 'absolute', top: 12, left: 12 }}>
                  {FEATURED_PREVIEW.category}
                </div>

                {/* Featured badge */}
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'var(--gold)', color: '#0d0c0a',
                  fontFamily: 'Barlow Condensed', fontWeight: 700,
                  fontSize: 10, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2,
                }}>
                  Utvalgt
                </div>
              </div>

              {/* Card content */}
              <div style={{ padding: '16px 20px 20px' }}>
                <h3 style={{
                  fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 17,
                  color: 'var(--t1)', marginBottom: 8, letterSpacing: '0.01em',
                }}>
                  {FEATURED_PREVIEW.title}
                </h3>

                <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                  {[
                    { label: 'Årsmodell', value: FEATURED_PREVIEW.year },
                    { label: 'Timer', value: `${FEATURED_PREVIEW.hours.toLocaleString('nb-NO')} t` },
                    { label: 'Lokasjon', value: FEATURED_PREVIEW.location },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="label-sm" style={{ marginBottom: 2 }}>{label}</p>
                      <p style={{ color: 'var(--t1)', fontSize: 13, fontWeight: 500 }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p className="label-sm" style={{ marginBottom: 2 }}>Pris</p>
                    <p className="price-display" style={{ fontSize: 22 }}>
                      {formatPrice(FEATURED_PREVIEW.price)}
                    </p>
                  </div>
                  <Link href="/sok" style={{
                    background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.2)',
                    color: 'var(--gold)', borderRadius: 3,
                    fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 12,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '8px 16px', textDecoration: 'none',
                    transition: 'all 0.15s ease', display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    Se annonse <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Seller info strip */}
              <div style={{
                padding: '10px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Shield size={12} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 12, color: 'var(--t3)' }}>
                  Verifisert norsk bedrift
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .hero-grid { grid-template-columns: 1fr 420px !important; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  )
}
