import Link from 'next/link'
import Logo from '@/components/shared/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Auth navbar */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Logo size="sm" />
        <Link href="/" className="btn-ghost" style={{ fontSize: 13 }}>
          ← Tilbake til forsiden
        </Link>
      </nav>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        {children}
      </div>

      {/* Auth footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--t3)', fontSize: 12 }}>
          © 2026 Anleggstorget AS ·{' '}
          <Link href="/personvern" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Personvern</Link>
          {' · '}
          <Link href="/vilkar" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Vilkår</Link>
        </p>
      </div>
    </div>
  )
}
