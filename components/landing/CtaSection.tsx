import Link from 'next/link'
import { ArrowRight, PlusSquare } from 'lucide-react'

export default function CtaSection() {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '96px 0',
      background: 'var(--bg3)',
      borderTop: '1px solid var(--border)',
    }}>
      {/* Background SVG */}
      <div style={{
        position: 'absolute', right: -40, top: '50%',
        transform: 'translateY(-50%)',
        opacity: 0.04, pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 500 300" style={{ width: 600 }} aria-hidden>
          <g fill="var(--gold)">
            <rect x="60" y="100" width="260" height="120" rx="6" />
            <rect x="80" y="40" width="130" height="90" rx="6" />
            <rect x="84" y="44" width="122" height="82" rx="4" fill="#0d0c0a" />
            <rect x="200" y="10" width="16" height="190" rx="6" transform="rotate(-26 200 10)" />
            <rect x="350" y="5" width="12" height="130" rx="5" transform="rotate(18 350 5)" />
            <path d="M375 120 L440 140 L435 175 L365 170 Z" rx="5" />
            <rect x="30" y="218" width="380" height="30" rx="6" />
            {[70,110,150,190,230,270,310,350].map(x => <circle key={x} cx={x} cy={230} r={16} />)}
          </g>
        </svg>
      </div>

      {/* Grid overlay */}
      <div className="grid-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      <div className="container-main" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <p className="section-label" style={{ marginBottom: 16 }}>Kom i gang i dag</p>
        <h2 style={{
          fontFamily: 'Barlow Condensed', fontWeight: 800,
          fontSize: 'clamp(36px, 5vw, 64px)',
          textTransform: 'uppercase', letterSpacing: '0.01em',
          color: 'var(--t1)', marginBottom: 20, lineHeight: 0.95,
        }}>
          Selg din maskin til{' '}
          <span className="text-gold-gradient">norske bedrifter</span>
        </h2>

        <p style={{ color: 'var(--t2)', fontSize: 16, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.65 }}>
          Legg ut annonsen gratis og nå verifiserte norske bedrifter som leter etter maskiner.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/registrer" className="btn-primary" style={{ fontSize: 14, padding: '14px 32px' }}>
            <PlusSquare size={16} />
            Registrer bedrift gratis
          </Link>
          <Link href="/sok" className="btn-secondary" style={{ padding: '14px 32px' }}>
            Se maskiner <ArrowRight size={14} />
          </Link>
        </div>

        <p style={{ color: 'var(--t3)', fontSize: 12, marginTop: 20 }}>
          Ingen binding · Gratis å registrere · Ingen provisjon
        </p>
      </div>
    </section>
  )
}
