import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      flexDirection: 'column',
      gap: 24,
      padding: 24,
      textAlign: 'center',
    }}>
      <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 120, color: 'var(--bg4)', letterSpacing: '0.02em', lineHeight: 1 }}>
        404
      </p>
      <div style={{ marginTop: -40 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 32, color: 'var(--t1)', marginBottom: 10 }}>
          Side ikke funnet
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: 15, marginBottom: 28 }}>
          Siden du leter etter eksisterer ikke eller er blitt fjernet.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/" className="btn-primary">Til forsiden</Link>
          <Link href="/sok" className="btn-secondary">Søk maskiner</Link>
        </div>
      </div>
    </div>
  )
}
