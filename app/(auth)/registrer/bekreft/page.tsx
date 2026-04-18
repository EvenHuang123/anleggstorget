import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function BekreftPage() {
  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 4, padding: '48px 40px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%',
          background: 'var(--gold3)', border: '2px solid rgba(200,149,58,0.4)',
          margin: '0 auto 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mail size={28} style={{ color: 'var(--gold)' }} />
        </div>

        <h1 style={{
          fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 28,
          color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Sjekk e-posten din!
        </h1>

        <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
          Vi har sendt en bekreftelseslenke til din e-postadresse. Klikk på lenken for å aktivere kontoen din.
        </p>

        <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 32 }}>
          Finner du ikke e-posten? Sjekk spam-mappen.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/logg-inn" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            Gå til innlogging
          </Link>
          <Link href="/" className="btn-ghost" style={{ justifyContent: 'center', color: 'var(--t3)' }}>
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  )
}
