import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Velkommen til Anleggstorget',
  description: 'Din bedrift er nå registrert og verifisert på Anleggstorget. Start med å legge ut din første maskinannonse gratis og nå kjøpere i hele Norge.',
  robots: { index: false },
}

export default function VelkommenPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border2)',
        borderRadius: 4,
        padding: '56px 48px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Gold glow */}
        <div style={{
          position: 'absolute', top: -100, left: '50%',
          transform: 'translateX(-50%)',
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(200,149,58,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Check icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--gold3)', border: '2px solid rgba(200,149,58,0.5)',
          margin: '0 auto 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <CheckCircle2 size={38} style={{ color: 'var(--gold)' }} />
        </div>

        <h1 style={{
          fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 32,
          color: 'var(--t1)', marginBottom: 14, letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>
          Kontoen er bekreftet!
        </h1>

        <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          Velkommen til Anleggstorget! Du kan nå kjøpe, selge og leie tunge maskiner
          med verifiserte norske bedrifter.
        </p>

        {/* Feature list */}
        <div style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '20px 24px', marginBottom: 32, textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sparkles size={13} style={{ color: 'var(--gold)' }} />
            <span style={{
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 12,
              color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Hva du kan gjøre nå
            </span>
          </div>
          {[
            'Legg ut maskiner for salg — helt gratis',
            'Søk blant annonser fra hele Norge',
            'Send forespørsler til verifiserte bedrifter',
            'Lagre favoritter og se dine innboks-meldinger',
          ].map((item, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: i < arr.length - 1 ? 9 : 0,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--gold)', flexShrink: 0,
              }} />
              <span style={{ color: 'var(--t2)', fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{ display: 'inline-flex', justifyContent: 'center', height: 50, fontSize: 14 }}
          >
            Gå til min side →
          </Link>
          <Link
            href="/sok"
            style={{ color: 'var(--t3)', fontSize: 13, textDecoration: 'none' }}
          >
            Eller utforsk markedsplassen
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
