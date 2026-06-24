import Link from 'next/link'

const BRANDS = [
  'Volvo', 'Caterpillar', 'Komatsu', 'Liebherr', 'Hitachi',
  'Doosan', 'JCB', 'Mecalac', 'Terex', 'Kobelco',
  'John Deere', 'Case', 'New Holland', 'Claas', 'Fendt',
]

const brandStyle = {
  fontFamily: 'Barlow Condensed', fontWeight: 700,
  fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
  color: 'var(--t3)', whiteSpace: 'nowrap' as const,
  transition: 'color 0.15s', textDecoration: 'none',
}

export default function BrandsStripe() {
  return (
    <div style={{
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '40px 0',
      overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p className="label-sm">Populære merker på plattformen</p>
      </div>

      <div style={{ overflow: 'hidden', position: 'relative' }}>
        {/* Gradient fades */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 120,
          background: 'linear-gradient(to right, var(--bg2), transparent)',
          zIndex: 1, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
          background: 'linear-gradient(to left, var(--bg2), transparent)',
          zIndex: 1, pointerEvents: 'none',
        }} />

        <div
          className="animate-ticker"
          style={{ display: 'flex', alignItems: 'center', gap: 0, whiteSpace: 'nowrap' }}
        >
          {/* First set — real links for SEO */}
          {BRANDS.map(brand => (
            <div key={brand} style={{ padding: '0 32px', borderRight: '1px solid var(--border)', flexShrink: 0 }}>
              <Link href={`/sok?brand=${encodeURIComponent(brand)}`} style={brandStyle}>
                {brand}
              </Link>
            </div>
          ))}
          {/* Second set — visual duplicate for seamless loop, hidden from crawlers */}
          {BRANDS.map(brand => (
            <div key={`dup-${brand}`} aria-hidden="true" style={{ padding: '0 32px', borderRight: '1px solid var(--border)', flexShrink: 0 }}>
              <span style={brandStyle}>{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
