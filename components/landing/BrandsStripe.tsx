const BRANDS = [
  'Volvo', 'Caterpillar', 'Komatsu', 'Liebherr', 'Hitachi',
  'Doosan', 'JCB', 'Mecalac', 'Terex', 'Kobelco',
  'John Deere', 'Case', 'New Holland', 'Claas', 'Fendt',
]

export default function BrandsStripe() {
  const doubled = [...BRANDS, ...BRANDS]

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
          {doubled.map((brand, i) => (
            <div key={i} style={{
              padding: '0 32px',
              borderRight: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'Barlow Condensed', fontWeight: 700,
                fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--t3)', whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}>
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
