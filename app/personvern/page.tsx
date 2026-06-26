import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'

export const metadata: Metadata = {
  title: 'Personvernerklæring',
  description: 'Les hvordan Anleggstorget behandler personopplysninger, bruker informasjonskapsler og sikrer dataen til bedrifter på plattformen.',
  alternates: { canonical: 'https://anleggstorget.no/personvern' },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 700, fontSize: 22,
        color: 'var(--t1)', marginBottom: 16,
        letterSpacing: '0.01em',
        paddingBottom: 10,
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </h2>
      <div style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ color: 'var(--t3)', fontSize: 14, minWidth: 180, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--t1)', fontSize: 14 }}>{value}</span>
    </div>
  )
}

export default function PersonvernPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
        <div className="container-main" style={{ maxWidth: 800, padding: '64px 24px 96px' }}>

          {/* Header */}
          <div style={{ marginBottom: 56 }}>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12,
            }}>
              GDPR
            </p>
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)',
              color: 'var(--t1)', lineHeight: 1.05,
              letterSpacing: '0.01em', textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Personvernerklæring
            </h1>
            <p style={{ color: 'var(--t3)', fontSize: 14 }}>
              Sist oppdatert: 09.06.2026
            </p>
          </div>

          {/* 1. Behandlingsansvarlig */}
          <Section title="1. Behandlingsansvarlig">
            <p style={{ marginBottom: 12 }}>
              Anleggstorget er behandlingsansvarlig for personopplysninger som behandles i forbindelse med bruk av tjenesten.
            </p>
            <Row label="Navn" value="Anleggstorget" />
            <Row label="E-post" value="kontakt@anleggstorget.no" />
          </Section>

          {/* 2. Hvilke opplysninger */}
          <Section title="2. Hvilke personopplysninger vi behandler">
            <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Navn og e-postadresse ved registrering av brukerkonto',
                'Organisasjonsnummer og bedriftsnavn (innhentet fra Brønnøysundregisteret)',
                'Meldinger og forespørsler sendt via forespørselsskjema',
                'IP-adresse og tekniske loggdata via Vercel (hosting)',
                'Besøksdata og trafikkstatistikk via Google Analytics (kun med samtykke)',
              ].map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>

          {/* 3. Formål og grunnlag */}
          <Section title="3. Formål og rettslig grunnlag">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '16px 20px' }}>
                <p style={{ fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>Levere tjenesten</p>
                <p style={{ color: 'var(--t3)', fontSize: 14 }}>
                  Nødvendig for å opprette og administrere brukerkonto, publisere og vise annonser, og sende meldinger mellom brukere.
                  Rettslig grunnlag: avtale, jf. GDPR artikkel 6 (1) b.
                </p>
              </div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '16px 20px' }}>
                <p style={{ fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>Verifisere bedrifter</p>
                <p style={{ color: 'var(--t3)', fontSize: 14 }}>
                  Vi kontrollerer organisasjonsnummer mot Brønnøysundregisteret for å sikre at kun registrerte norske bedrifter bruker plattformen.
                  Rettslig grunnlag: berettiget interesse, jf. GDPR artikkel 6 (1) f.
                </p>
              </div>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '16px 20px' }}>
                <p style={{ fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>Trafikkanalyse (Google Analytics)</p>
                <p style={{ color: 'var(--t3)', fontSize: 14 }}>
                  Med ditt samtykke bruker vi Google Analytics for å forstå how tjenesten brukes.
                  Rettslig grunnlag: samtykke, jf. GDPR artikkel 6 (1) a og ekomloven § 3-15.
                  Du kan trekke samtykket når som helst ved å klikke «Administrer cookies» i bunnen av siden.
                </p>
              </div>
            </div>
          </Section>

          {/* 4. Lagringstid */}
          <Section title="4. Hvor lenge vi lagrer data">
            <Row label="Brukerkontoer" value="Så lenge kontoen er aktiv" />
            <Row label="Forespørsler og meldinger" value="2 år" />
            <Row label="Tekniske logger (Vercel)" value="90 dager" />
          </Section>

          {/* 5. Databehandlere */}
          <Section title="5. Hvem vi deler data med">
            <p style={{ marginBottom: 16 }}>
              Vi deler personopplysninger med følgende databehandlere. Alle har inngått databehandleravtale med oss.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              {[
                { name: 'Supabase Inc', role: 'Databaser og autentisering', location: 'EU (Frankfurt)' },
                { name: 'Vercel Inc', role: 'Hosting og CDN', location: 'USA (Standard Contractual Clauses)' },
                { name: 'Google LLC', role: 'Google Analytics (kun med samtykke)', location: 'USA (Standard Contractual Clauses)' },
                { name: 'Sentry Inc', role: 'Feillogging og ytelsesovervåkning', location: 'USA (Standard Contractual Clauses)' },
                { name: 'Resend Inc', role: 'E-postutsendelse', location: 'USA (Standard Contractual Clauses)' },
              ].map(p => (
                <div key={p.name} style={{
                  background: 'var(--bg2)', padding: '14px 20px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
                }}>
                  <span style={{ color: 'var(--t1)', fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                  <span style={{ color: 'var(--t3)', fontSize: 13 }}>{p.role}</span>
                  <span style={{ color: 'var(--t3)', fontSize: 13 }}>{p.location}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 6. Rettigheter */}
          <Section title="6. Dine rettigheter">
            <p style={{ marginBottom: 16 }}>
              Du har følgende rettigheter etter GDPR. Ta kontakt på{' '}
              <a href="mailto:kontakt@anleggstorget.no" style={{ color: 'var(--gold)' }}>kontakt@anleggstorget.no</a>{' '}
              — vi svarer innen 30 dager.
            </p>
            <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Rett til innsyn i hvilke opplysninger vi har om deg',
                'Rett til retting av uriktige opplysninger',
                'Rett til sletting («retten til å bli glemt»)',
                'Rett til å trekke samtykke når som helst',
                'Rett til å klage til Datatilsynet (datatilsynet.no)',
              ].map(r => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Section>

          {/* 7. Informasjonskapsler */}
          <section id="cookies" style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 22, color: 'var(--t1)', marginBottom: 16,
              letterSpacing: '0.01em', paddingBottom: 10, borderBottom: '1px solid var(--border)',
            }}>
              7. Informasjonskapsler (cookies)
            </h2>
            <div style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.75 }}>

              <p style={{ marginBottom: 20 }}>
                Anleggstorget bruker informasjonskapsler for å sikre at nettsiden fungerer korrekt og for å
                forbedre brukeropplevelsen. Nedenfor finner du en oversikt over alle informasjonskapsler vi bruker.
              </p>

              <p style={{ fontWeight: 600, color: 'var(--t1)', marginBottom: 10 }}>Nødvendige (alltid aktive)</p>
              <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg3)' }}>
                      {['Navn', 'Formål', 'Varighet', 'Leverandør'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--t1)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'cookie-consent-v2', purpose: 'Lagrer ditt samtykkevalg', duration: '12 måneder', vendor: 'Anleggstorget' },
                      { name: 'sb-access-token', purpose: 'Innloggingssesjon', duration: 'Sesjon', vendor: 'Supabase' },
                      { name: 'sb-refresh-token', purpose: 'Fornyelse av innlogging', duration: '7 dager', vendor: 'Supabase' },
                    ].map(r => (
                      <tr key={r.name} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--t1)' }}>{r.name}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--t2)' }}>{r.purpose}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--t3)' }}>{r.duration}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--t3)' }}>{r.vendor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontWeight: 600, color: 'var(--t1)', marginBottom: 10 }}>Analyse (krever samtykke)</p>
              <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg3)' }}>
                      {['Navn', 'Formål', 'Varighet', 'Leverandør'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--t1)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: '_ga', purpose: 'Skiller mellom brukere for trafikkanalyse', duration: '2 år', vendor: 'Google Analytics' },
                      { name: '_ga_*', purpose: 'Lagrer sesjonsstatus', duration: '2 år', vendor: 'Google Analytics' },
                    ].map(r => (
                      <tr key={r.name} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--t1)' }}>{r.name}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--t2)' }}>{r.purpose}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--t3)' }}>{r.duration}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--t3)' }}>{r.vendor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: 14, color: 'var(--t3)' }}>
                Du kan til enhver tid endre eller trekke tilbake ditt samtykke ved å klikke på
                «Administrer cookies» i bunnen av siden.
              </p>
            </div>
          </section>

          {/* 8. Endringer */}
          <Section title="8. Endringer i personvernerklæringen">
            <p>
              Vi kan oppdatere denne erklæringen ved behov. Vesentlige endringer varsles via e-post til registrerte brukere.
              Datoen for siste oppdatering vises øverst på denne siden.
            </p>
          </Section>

        </div>
      </main>
      <Footer />
    </>
  )
}
