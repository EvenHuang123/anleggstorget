import Link from 'next/link'

interface BrandCount {
  name: string
  count: number
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: 8,
  padding: '8px 14px',
  border: '1px solid var(--border)',
  borderRadius: 2,
  background: 'var(--bg)',
  textDecoration: 'none',
  fontFamily: 'Barlow Condensed, sans-serif',
  fontWeight: 700,
  fontSize: 15,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--t2)',
  whiteSpace: 'nowrap',
}

/**
 * Merker som faktisk har aktive annonser — generert fra databasen, sortert etter
 * antall. Statisk rad (ingen marquee). Rendrer ingenting hvis under 4 merker,
 * for ikke å love et utvalg vi ikke har.
 */
export default function BrandsStripe({ brands }: { brands: BrandCount[] }) {
  if (!brands || brands.length < 4) return null

  return (
    <section style={{
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '48px 0',
    }}>
      <div className="container-main">
        <p className="label-sm" style={{ marginBottom: 16 }}>Merker med annonser nå</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {brands.map(b => (
            <Link key={b.name} href={`/sok?brand=${encodeURIComponent(b.name)}`} className="brand-chip" style={chipStyle}>
              <span>{b.name}</span>
              <span style={{ color: 'var(--t3)', fontWeight: 600, fontSize: 13, letterSpacing: 0 }}>{b.count}</span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .brand-chip:hover { border-color: var(--gold) !important; color: var(--gold) !important; }
      `}</style>
    </section>
  )
}
