'use client'

import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ArrowRight, TrendingUp, Clock, Shield } from 'lucide-react'
import { useEffect, useRef } from 'react'

// Lazy-load: HeroCarousel fetches data client-side. Splitting it keeps the
// hero text + LCP image in the main bundle, carousel code in a separate chunk.
const HeroCarousel = dynamic(() => import('./HeroCarousel'), {
  ssr: false,
  loading: () => <div className="card shimmer" style={{ borderRadius: 16, height: 480 }} />,
})

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
      {/* Background photo — Next.js Image for WebP + preload (LCP candidate) */}
      <div ref={bgRef} style={{
        position: 'absolute', inset: 0, zIndex: 0,
        opacity: 0.28, willChange: 'transform',
      }}>
        <Image
          src="/url.jpg"
          alt=""
          fill
          priority
          quality={85}
          style={{ objectFit: 'cover' }}
        />
      </div>

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 64, alignItems: 'center' }} className="hero-grid">

          {/* Left: Text content */}
          <div>
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

          {/* Right: Live listing carousel */}
          <div style={{ position: 'relative' }} className="hero-carousel-col">
            {/* Decorative SVG behind the card */}
            <svg viewBox="0 0 400 280" style={{
              width: '100%', opacity: 0.12,
              filter: 'sepia(1) brightness(0.8)',
              position: 'absolute', top: -40, right: -20,
              pointerEvents: 'none',
            }} aria-hidden>
              <g fill="var(--gold)">
                <rect x="80" y="140" width="200" height="80" rx="4" />
                <rect x="100" y="100" width="100" height="60" rx="4" />
                <rect x="110" y="108" width="80" height="44" rx="2" fill="#0d0c0a" opacity="0.5" />
                <rect x="195" y="60" width="16" height="110" rx="4" transform="rotate(-30 195 60)" />
                <rect x="285" y="50" width="12" height="90" rx="4" transform="rotate(20 285 50)" />
                <path d="M310 120 L340 130 L335 150 L305 148 Z" />
                <rect x="60" y="218" width="240" height="24" rx="4" />
                <rect x="50" y="212" width="260" height="8" rx="4" />
                <rect x="50" y="226" width="260" height="8" rx="4" />
                {[80, 120, 160, 200, 240, 280].map(x => (
                  <circle key={x} cx={x} cy={222} r={10} />
                ))}
              </g>
            </svg>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <HeroCarousel />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-grid { grid-template-columns: 1fr 480px !important; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-carousel-col { display: none !important; }
        }
        @media (max-width: 768px) {
          .hero-carousel-col { display: none !important; }
        }
      `}</style>
    </section>
  )
}
