import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

export default function VilkarPage() {
  const updated = new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
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
            Vilkår for bruk
          </h1>
          <p style={{ color: 'var(--t3)', fontSize: 13 }}>Sist oppdatert: {updated}</p>
        </div>
      </div>

      <div className="container-main" style={{ maxWidth: 860, padding: '60px 24px 100px' }}>
        <Section title="1. Aksept av vilkår">
          <p>Ved å bruke Anleggstorget aksepterer du disse vilkårene. Hvis du ikke aksepterer vilkårene, skal du ikke bruke tjenesten.</p>
        </Section>

        <Section title="2. Bruk av tjenesten">
          <p>Anleggstorget er kun for:</p>
          <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Registrerte norske bedrifter (AS, ANS, ENK, osv.)',
              'Kjøp, salg og utleie av tunge maskiner og anleggsutstyr',
              'Kommersiell bruk mellom bedrifter (B2B)',
            ].map(t => <li key={t}>{t}</li>)}
          </ul>
          <p style={{ marginTop: 16 }}><strong style={{ color: 'var(--t1)' }}>Ikke tillatt:</strong></p>
          <ul style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Privatsalg (bruk Finn.no i stedet)',
              'Svindel, falske annonser eller villedende informasjon',
              'Spam eller uønsket kommunikasjon',
              'Automatisert scraping eller datainnsamling',
            ].map(t => <li key={t}>{t}</li>)}
          </ul>
        </Section>

        <Section title="3. Bedriftsverifisering">
          <p>Alle bedrifter må verifiseres mot Brønnøysundregisteret før de kan legge ut annonser. Vi forbeholder oss retten til å avvise eller slette kontoer som ikke kan verifiseres.</p>
        </Section>

        <Section title="4. Annonser">
          <p>Ved å legge ut en annonse garanterer du at:</p>
          <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Du har rett til å selge maskinen',
              'All informasjon er sannferdig og korrekt',
              'Bilder er dine egne eller du har rett til å bruke dem',
              'Du vil respondere på henvendelser innen rimelig tid',
            ].map(t => <li key={t}>{t}</li>)}
          </ul>
          <p style={{ marginTop: 16 }}>Vi forbeholder oss retten til å slette annonser som bryter vilkårene.</p>
        </Section>

        <Section title="5. Betaling og transaksjoner">
          <p>Anleggstorget er kun en plattform for å koble bedrifter. Vi er <strong>ikke</strong> part i transaksjoner og tar <strong>ikke</strong> provisjon.</p>
          <p style={{ marginTop: 12 }}>All betaling og levering avtales direkte mellom partene. Anleggstorget har intet ansvar for tvister, betalingsproblemer eller kvalitet på maskiner kjøpt, solgt eller leid via plattformen.</p>
        </Section>

        <Section title="6. Ansvarsbegrensning">
          <p>Anleggstorget tilbys &quot;som den er&quot; uten garantier av noe slag. Vi garanterer ikke at:</p>
          <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Tjenesten alltid vil være tilgjengelig',
              'Alle annonser er sannferdige',
              'Transaksjoner vil gå som planlagt',
              'Tjenesten er fri for feil eller sikkerhetshull',
            ].map(t => <li key={t}>{t}</li>)}
          </ul>
          <p style={{ marginTop: 16 }}>Anleggstorget er ikke ansvarlig for tap eller skade som følge av bruk av tjenesten.</p>
        </Section>

        <Section title="7. Immaterielle rettigheter">
          <p>Alt innhold på Anleggstorget (logo, design, kode) eies av Anleggstorget. Du beholder rettighetene til bilder og tekst du laster opp, men gir oss rett til å vise dette på plattformen.</p>
        </Section>

        <Section title="8. Oppsigelse">
          <p>Du kan når som helst slette kontoen din via innstillinger. Vi forbeholder oss retten til å stenge kontoer som bryter vilkårene.</p>
        </Section>

        <Section title="9. Endringer i vilkår">
          <p>Vi kan oppdatere disse vilkårene. Ved vesentlige endringer vil vi varsle deg via e-post. Fortsatt bruk av tjenesten etter endringer betyr at du aksepterer de nye vilkårene.</p>
        </Section>

        <Section title="10. Lovvalg">
          <p>Disse vilkårene er underlagt norsk lov. Tvister løses i norske domstoler.</p>
        </Section>

        <Section title="11. Kontakt">
          <p>
            Spørsmål om vilkårene?<br />
            E-post: <a href="mailto:kontakt@anleggstorget.no" style={{ color: 'var(--gold)' }}>kontakt@anleggstorget.no</a>
          </p>
        </Section>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/personvern" style={{ color: 'var(--gold)', fontSize: 14, textDecoration: 'none' }}>Les personvernerklæring →</Link>
          <Link href="/" style={{ color: 'var(--t3)', fontSize: 14, textDecoration: 'none' }}>Tilbake til forsiden</Link>
        </div>
      </div>
    </div>
  )
}
