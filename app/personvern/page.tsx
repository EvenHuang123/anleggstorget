import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 700, fontSize: 22,
        color: 'var(--t1)', marginBottom: 14,
        letterSpacing: '0.02em',
      }}>
        {title}
      </h2>
      <div style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  )
}

export default function PersonvernPage() {
  const updated = new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
      <div style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px',
      }}>
        <div className="container-main" style={{ maxWidth: 860 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--t3)', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
            <ArrowLeft size={14} /> Tilbake til forsiden
          </Link>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>
            Juridisk
          </p>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 40, color: 'var(--t1)', letterSpacing: '0.02em', marginBottom: 10 }}>
            Personvernerklæring
          </h1>
          <p style={{ color: 'var(--t3)', fontSize: 13 }}>Sist oppdatert: {updated}</p>
        </div>
      </div>

      <div className="container-main" style={{ maxWidth: 860, padding: '60px 24px 100px' }}>
        <Section title="1. Informasjon vi samler inn">
          <p>Anleggstorget samler inn følgende informasjon når du bruker tjenesten:</p>
          <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Bedriftsinformasjon', 'Organisasjonsnummer, bedriftsnavn, kontaktperson'],
              ['Kontaktinformasjon', 'E-postadresse, telefonnummer'],
              ['Annonsedata', 'Bilder, beskrivelser og tekniske spesifikasjoner for maskiner du legger ut'],
              ['Kommunikasjon', 'Meldinger sendt via plattformen'],
              ['Teknisk data', 'IP-adresse, nettlesertype, besøkstid'],
            ].map(([k, v]) => (
              <li key={k}><strong style={{ color: 'var(--t1)' }}>{k}:</strong> {v}</li>
            ))}
          </ul>
        </Section>

        <Section title="2. Hvordan vi bruker informasjonen">
          <p>Vi bruker informasjonen til å:</p>
          <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Verifisere bedrifter mot Brønnøysundregisteret',
              'Legge til rette for kommunikasjon mellom kjøpere og selgere',
              'Sende varslinger om nye forespørsler og meldinger',
              'Forbedre plattformen og brukeropplevelsen',
              'Forhindre svindel og misbruk av tjenesten',
            ].map(t => <li key={t}>{t}</li>)}
          </ul>
        </Section>

        <Section title="3. Deling av informasjon">
          <p>Vi selger <strong>aldri</strong> dine personopplysninger til tredjeparter. Informasjon deles kun når det er nødvendig for tjenesten:</p>
          <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Bedriftsnavn og kontaktinfo vises i dine annonser',
              'Brønnøysundregisteret brukes for bedriftsverifisering',
              'E-posttjenesten Resend sender varslinger på våre vegne',
              'Supabase lagrer data sikkert i EU-regionen',
            ].map(t => <li key={t}>{t}</li>)}
          </ul>
        </Section>

        <Section title="4. Dine rettigheter">
          <p>Du har rett til å:</p>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Se hvilken informasjon vi har om deg',
              'Rette feil eller utdatert informasjon',
              'Slette kontoen din og all tilhørende data',
              'Trekke tilbake samtykke til behandling av personopplysninger',
              'Klage til Datatilsynet hvis du mener vi bryter personvernregler',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CheckCircle2 size={15} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16 }}>
            For å utøve dine rettigheter, kontakt oss på:{' '}
            <a href="mailto:kontakt@anleggstorget.no" style={{ color: 'var(--gold)' }}>kontakt@anleggstorget.no</a>
          </p>
        </Section>

        <Section title="5. Cookies og sporing">
          <p>Anleggstorget bruker minimalt med cookies. Vi bruker kun nødvendige cookies for autentisering (innlogging) og grunnleggende funksjonalitet.</p>
          <p style={{ marginTop: 12 }}>Vi bruker <strong>ikke</strong> sporings-cookies eller tredjeparts analyseverktøy.</p>
        </Section>

        <Section title="6. Datasikkerhet">
          <p>All data lagres kryptert hos Supabase (PostgreSQL) i EU-regionen. Vi bruker HTTPS for all kommunikasjon, og passord er hashet med bcrypt.</p>
        </Section>

        <Section title="7. Endringer i personvernerklæringen">
          <p>Vi kan oppdatere denne personvernerklæringen. Ved vesentlige endringer vil vi varsle deg via e-post.</p>
        </Section>

        <Section title="8. Kontakt">
          <p>
            Spørsmål om personvern?<br />
            E-post: <a href="mailto:kontakt@anleggstorget.no" style={{ color: 'var(--gold)' }}>kontakt@anleggstorget.no</a>
          </p>
        </Section>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/vilkar" style={{ color: 'var(--gold)', fontSize: 14, textDecoration: 'none' }}>Les vilkår for bruk →</Link>
          <Link href="/" style={{ color: 'var(--t3)', fontSize: 14, textDecoration: 'none' }}>Tilbake til forsiden</Link>
        </div>
      </div>
    </div>
  )
}
