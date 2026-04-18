export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        width: 40, height: 40,
        background: 'var(--gold)',
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'float 1.5s ease-in-out infinite',
      }}>
        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 20, color: '#0d0c0a' }}>M</span>
      </div>
      <p style={{ fontFamily: 'Barlow Condensed', fontSize: 12, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>
        Laster...
      </p>
    </div>
  )
}
