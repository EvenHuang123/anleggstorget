import { Shield, Search, TrendingUp } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: 'Verifiserte bedrifter',
    description:
      'Alle selgere er verifisert mot Brønnøysundregistrene. Vi kontrollerer organisasjonsnummer og bedriftsstatus før publisering.',
    metric: '100%',
    metricLabel: 'verifiserte selgere',
  },
  {
    icon: Search,
    title: 'Transparent handel',
    description:
      'Se fullstendige maskinopplysninger, servicehistorikk og selgerinformasjon. Ingen skjulte avgifter eller provisjoner.',
    metric: '0 kr',
    metricLabel: 'i kjøperprovisjon',
  },
  {
    icon: TrendingUp,
    title: 'Markedsinnsikt',
    description:
      'Få tilgang til prisdata, markedstrender og sammenligning med lignende maskiner. Ta informerte beslutninger.',
    metric: '2 400+',
    metricLabel: 'annonser analysert',
  },
]

export default function TrustSection() {
  return (
    <section className="section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div className="container-main">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Hvorfor Maskintorget</p>
          <h2 className="section-title" style={{ fontSize: 'clamp(24px, 3vw, 40px)', marginBottom: 14 }}>
            Bygget for norsk næringsliv
          </h2>
          <p style={{ color: 'var(--t2)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
            Vi har designet plattformen spesifikt for B2B maskinhandel i Norge — med de kravene det stiller til dokumentasjon, tillit og effektivitet.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }} className="trust-grid">
          {TRUST_ITEMS.map(({ icon: Icon, title, description, metric, metricLabel }) => (
            <div key={title} className="card card-gold" style={{ padding: '32px 28px' }}>
              {/* Icon */}
              <div style={{
                width: 48, height: 48,
                background: 'var(--gold4)',
                border: '1px solid rgba(200,149,58,0.2)',
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Icon size={20} style={{ color: 'var(--gold)' }} />
              </div>

              <h3 style={{
                fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20,
                color: 'var(--t1)', marginBottom: 12, letterSpacing: '0.02em',
              }}>
                {title}
              </h3>

              <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                {description}
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <p style={{
                  fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 28,
                  color: 'var(--gold2)',
                }}>
                  {metric}
                </p>
                <p style={{ color: 'var(--t3)', fontSize: 12, fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {metricLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .trust-grid { grid-template-columns: repeat(3,1fr) !important; }
        @media (max-width: 900px) { .trust-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
