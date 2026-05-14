import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    key: 'gravemaskin', label: 'Gravemaskiner', count: 342,
    description: 'Bandgravemaskiner, hjulgravemaskiner og minigravere',
    svgPath: (
      <svg viewBox="0 0 48 32" style={{ width: 36, height: 24 }} aria-hidden>
        <g fill="currentColor" opacity="0.9">
          <rect x="4" y="16" width="28" height="12" rx="2" />
          <rect x="8" y="8" width="14" height="10" rx="2" />
          <rect x="9.5" y="9.5" width="11" height="7" rx="1" fill="var(--bg4)" />
          <rect x="20" y="2" width="4" height="20" rx="1.5" transform="rotate(-28 20 2)" />
          <rect x="33" y="1" width="3" height="14" rx="1.5" transform="rotate(18 33 1)" />
          <path d="M37 15 L46 18 L45 24 L35 23 Z" rx="1" />
          <rect x="2" y="27" width="36" height="4" rx="2" />
          {[7,13,19,25,31].map(x => <circle key={x} cx={x} cy={28.5} r={2.5} />)}
        </g>
      </svg>
    ),
  },
  {
    key: 'traktor', label: 'Traktorer', count: 218,
    description: 'Jordbrukstraktorer, teleskoptraktorer og spesialmaskiner',
    svgPath: (
      <svg viewBox="0 0 48 32" style={{ width: 36, height: 24 }} aria-hidden>
        <g fill="currentColor" opacity="0.9">
          <rect x="6" y="12" width="22" height="14" rx="2" />
          <rect x="9" y="6" width="10" height="10" rx="2" />
          <rect x="10.5" y="7.5" width="7" height="7" rx="1" fill="var(--bg4)" />
          <circle cx="12" cy="24" r="7" />
          <circle cx="12" cy="24" r="4" fill="var(--bg4)" />
          <circle cx="34" cy="26" r="5" />
          <circle cx="34" cy="26" r="3" fill="var(--bg4)" />
          <rect x="16" y="10" width="18" height="4" rx="2" />
          <rect x="28" y="6" width="4" height="12" rx="1" />
        </g>
      </svg>
    ),
  },
  {
    key: 'hjullaster', label: 'Hjullastere', count: 156,
    description: 'Kompaktlastere, hjullastere og teleskoplastere',
    svgPath: (
      <svg viewBox="0 0 48 32" style={{ width: 36, height: 24 }} aria-hidden>
        <g fill="currentColor" opacity="0.9">
          <rect x="6" y="12" width="30" height="14" rx="2" />
          <rect x="10" y="6" width="14" height="10" rx="2" />
          <rect x="11.5" y="7.5" width="11" height="7" rx="1" fill="var(--bg4)" />
          <rect x="2" y="18" width="12" height="4" rx="1.5" />
          <path d="M2 14 L8 14 L8 22 L2 20 Z" />
          <circle cx="12" cy="26" r="5" />
          <circle cx="12" cy="26" r="3" fill="var(--bg4)" />
          <circle cx="34" cy="26" r="5" />
          <circle cx="34" cy="26" r="3" fill="var(--bg4)" />
        </g>
      </svg>
    ),
  },
  {
    key: 'dumper', label: 'Dumpere', count: 89,
    description: 'Artikulerte dumpere, rigide dumpere og minidumpere',
    svgPath: (
      <svg viewBox="0 0 48 32" style={{ width: 36, height: 24 }} aria-hidden>
        <g fill="currentColor" opacity="0.9">
          <rect x="4" y="8" width="28" height="16" rx="2" />
          <path d="M4 8 L20 4 L32 4 L32 8 Z" />
          <rect x="8" y="14" width="10" height="8" rx="1.5" />
          <rect x="8.5" y="14.5" width="9" height="7" rx="1" fill="var(--bg4)" />
          <circle cx="10" cy="26" r="5" />
          <circle cx="10" cy="26" r="3" fill="var(--bg4)" />
          <circle cx="30" cy="26" r="5" />
          <circle cx="30" cy="26" r="3" fill="var(--bg4)" />
          <circle cx="40" cy="26" r="5" />
          <circle cx="40" cy="26" r="3" fill="var(--bg4)" />
        </g>
      </svg>
    ),
  },
  {
    key: 'kranbil', label: 'Kranbiler', count: 67,
    description: 'Mobilkraner, lastebilkraner og selvgående kraner',
    svgPath: (
      <svg viewBox="0 0 48 32" style={{ width: 36, height: 24 }} aria-hidden>
        <g fill="currentColor" opacity="0.9">
          <rect x="4" y="16" width="32" height="12" rx="2" />
          <rect x="8" y="8" width="10" height="10" rx="2" />
          <rect x="9.5" y="9.5" width="7" height="7" rx="1" fill="var(--bg4)" />
          <rect x="17" y="4" width="3" height="24" rx="1.5" />
          <rect x="17" y="4" width="28" height="2" rx="1" />
          <rect x="43" y="4" width="2" height="16" rx="1" />
          <rect x="17" y="8" width="28" height="1.5" opacity="0.5" />
          {[22,28,34,40].map(x => <line key={x} x1={x} y1={5} x2={x + 2} y2={17} stroke="currentColor" strokeWidth="0.8" opacity="0.4" />)}
          {[8,16,24,32].map(x => <circle key={x} cx={x} cy={28} r={3} />)}
        </g>
      </svg>
    ),
  },
  {
    key: 'skogsutstyr', label: 'Skogsutstyr', count: 43,
    description: 'Hogstmaskiner, lassbærere og skogstraktorer',
    svgPath: (
      <svg viewBox="0 0 48 32" style={{ width: 36, height: 24 }} aria-hidden>
        <g fill="currentColor" opacity="0.9">
          <rect x="6" y="14" width="28" height="12" rx="2" />
          <rect x="10" y="6" width="12" height="10" rx="2" />
          <rect x="11.5" y="7.5" width="9" height="7" rx="1" fill="var(--bg4)" />
          <circle cx="34" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="34" cy="10" r="3" />
          {[0,60,120,180,240,300].map(a => {
            const rad = a * Math.PI / 180
            return <line key={a} x1={34} y1={10} x2={34 + Math.cos(rad)*7} y2={10 + Math.sin(rad)*7} stroke="currentColor" strokeWidth="1.5" />
          })}
          <circle cx="12" cy="26" r="5" />
          <circle cx="12" cy="26" r="3" fill="var(--bg4)" />
          <circle cx="28" cy="26" r="5" />
          <circle cx="28" cy="26" r="3" fill="var(--bg4)" />
        </g>
      </svg>
    ),
  },
  {
    key: 'betong', label: 'Betongmaskiner',
    description: 'Betongbiler, betongpumper, betongmiksere og glattmaskiner',
    svgPath: (
      <svg viewBox="0 0 48 32" style={{ width: 36, height: 24 }} aria-hidden>
        <g fill="currentColor" opacity="0.9">
          <rect x="4" y="16" width="30" height="12" rx="2" />
          <rect x="8" y="8" width="10" height="10" rx="2" />
          <rect x="9.5" y="9.5" width="7" height="7" rx="1" fill="var(--bg4)" />
          <ellipse cx="32" cy="12" rx="8" ry="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <ellipse cx="32" cy="12" rx="5" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <line x1="32" y1="3" x2="32" y2="21" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="24" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <rect x="28" y="20" width="8" height="3" rx="1" />
          <circle cx="10" cy="28" r="3.5" />
          <circle cx="10" cy="28" r="1.8" fill="var(--bg4)" />
          <circle cx="28" cy="28" r="3.5" />
          <circle cx="28" cy="28" r="1.8" fill="var(--bg4)" />
        </g>
      </svg>
    ),
  },
  {
    key: 'annet', label: 'Annet utstyr', count: 332,
    description: 'Kompressorer, aggregater, vegvalsere og mer',
    svgPath: (
      <svg viewBox="0 0 48 32" style={{ width: 36, height: 24 }} aria-hidden>
        <g fill="currentColor" opacity="0.9">
          <circle cx="24" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="24" cy="16" r="4" />
          {[0,45,90,135,180,225,270,315].map(a => {
            const rad = a * Math.PI / 180
            return <line key={a} x1={24 + Math.cos(rad)*5.5} y1={16 + Math.sin(rad)*5.5} x2={24 + Math.cos(rad)*9} y2={16 + Math.sin(rad)*9} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          })}
        </g>
      </svg>
    ),
  },
]

export default function Categories() {
  return (
    <section className="section" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
      <div className="container-main">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Kategorier</p>
          <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}>
            Bla etter type maskin
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }} className="cat-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.key} href={`/sok?category=${cat.key}`} style={{ textDecoration: 'none' }}>
              <div className="cat-card card" style={{ padding: '24px 20px', height: '100%' }}>
                <div style={{
                  width: 56, height: 56,
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                  color: 'var(--gold)',
                  transition: 'all 0.2s ease',
                }} className="cat-icon-wrap">
                  {cat.svgPath}
                </div>

                <div style={{ marginBottom: 6 }}>
                  <h3 className="cat-label" style={{
                    fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15,
                    color: 'var(--t2)', letterSpacing: '0.02em', transition: 'color 0.2s',
                  }}>
                    {cat.label}
                  </h3>
                </div>

                <p style={{ color: 'var(--t3)', fontSize: 12, lineHeight: 1.5 }}>
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .cat-grid { grid-template-columns: repeat(4,1fr) !important; }
        @media (max-width: 1024px) { .cat-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 700px) { .cat-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </section>
  )
}
