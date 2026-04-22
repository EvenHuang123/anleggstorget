import Link from 'next/link'
import { Shield, Zap, MapPin, CheckCircle2, ArrowRight } from 'lucide-react'

const VALUES = [
  {
    icon: Shield,
    title: 'Trygghet',
    text: 'Alle bedrifter er verifisert mot Brønnøysundregisteret før de kan legge ut annonser. Du handler kun med legitime norske selskaper.',
  },
  {
    icon: Zap,
    title: 'Effektivitet',
    text: 'Finn riktig maskin på minutter, ikke uker. Send forespørsler direkte til selger og få svar samme dag.',
  },
  {
    icon: CheckCircle2,
    title: 'Åpenhet',
    text: 'Ingen skjulte kostnader eller provisjoner. Helt gratis å kjøpe, selge og leie ut. Vi tar ikke betalt av transaksjoner.',
  },
  {
    icon: MapPin,
    title: 'Norsk',
    text: 'Bygget for norske bedrifter, med norsk support og lokal forståelse av anleggsbransjen. Vi snakker ditt språk.',
  },
]

const STEPS = [
  {
    n: 1,
    title: 'Registrer bedriften',
    text: 'Opprett konto med ditt organisasjonsnummer. Vi verifiserer automatisk mot Brønnøysundregisteret.',
  },
  {
    n: 2,
    title: 'Søk eller legg ut',
    text: 'Søk blant hundrevis av maskiner, eller legg ut ditt eget utstyr helt gratis.',
  },
  {
    n: 3,
    title: 'Send forespørsel',
    text: 'Fant du noe interessant? Send melding direkte til selger med ett klikk.',
  },
  {
    n: 4,
    title: 'Inngå avtale',
    text: 'Selger kontakter deg direkte. Dere blir enige om pris, levering og betaling.',
  },
]

const VERIFY_STEPS = [
  'Ved registrering oppgir bedriften sitt organisasjonsnummer',
  'Vi sjekker automatisk mot Brønnøysundregisteret (brreg.no)',
  'Bedriftsnavn og informasjon hentes direkte fra registeret',
  'Kun verifiserte bedrifter kan legge ut annonser',
]

const VERIFY_GUARANTEES = [
  'Du handler med legitime norske bedrifter',
  'Kontaktinformasjon er riktig og oppdatert',
  'Bedriften er aktivt registrert i Norge',
  'Du slipper svindel og falske annonser',
]

export default function OmOssPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>

      {/* Hero */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(200,149,58,0.05) 0%, transparent 100%)',
      }}>
        <p style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 11,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--gold)', marginBottom: 16,
        }}>
          Om oss
        </p>
        <h1 style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800, fontSize: 'clamp(36px, 6vw, 56px)',
          letterSpacing: '0.02em', textTransform: 'uppercase',
          color: 'var(--t1)', marginBottom: 20, lineHeight: 1.05,
        }}>
          Anleggstorget
        </h1>
        <p style={{
          color: 'var(--t2)', fontSize: 17, lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto',
        }}>
          Norges B2B-markedsplass for tunge maskiner — vi kobler verifiserte
          norske bedrifter for trygg og effektiv handel. Helt gratis.
        </p>
      </section>

      {/* Vår historie */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 11,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: 12,
          }}>
            Bakgrunn
          </p>
          <h2 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 800, fontSize: 32,
            letterSpacing: '0.02em', textTransform: 'uppercase',
            color: 'var(--t1)', marginBottom: 32,
          }}>
            Hvorfor vi bygde Anleggstorget
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              'Maskinbransjen i Norge har i årevis manglet en moderne, pålitelig plattform for kjøp, salg og utleie av tunge maskiner mellom bedrifter.',
              'Vi så at små og mellomstore entreprenører brukte uker på å finne riktig utstyr til kjøp eller leie, mens bedrifter med ledige maskiner slet med å nå riktige kjøpere og leietakere. Tradisjonelle metoder som Facebook-grupper og telefonsamtaler var ineffektive og utrygge.',
              'Anleggstorget løser dette. Vi verifiserer alle bedrifter mot Brønnøysundregisteret, sikrer direkte kommunikasjon mellom bedrifter, og gjør hele prosessen raskere og enklere.',
            ].map((p, i) => (
              <p key={i} style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Verdier */}
      <section style={{
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 24px',
      }}>
        <div className="container-main">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 11,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12,
            }}>
              Det vi står for
            </p>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 32,
              letterSpacing: '0.02em', textTransform: 'uppercase',
              color: 'var(--t1)', margin: 0,
            }}>
              Våre verdier
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}>
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '32px 28px',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 4,
                  background: 'var(--gold3)',
                  border: '1px solid rgba(200,149,58,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon size={22} style={{ color: 'var(--gold)' }} />
                </div>
                <h3 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 18, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: 'var(--t1)', marginBottom: 10,
                }}>
                  {title}
                </h3>
                <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bedriftsverifisering */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 11,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12,
            }}>
              Sikkerhet
            </p>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 32,
              letterSpacing: '0.02em', textTransform: 'uppercase',
              color: 'var(--t1)', marginBottom: 12,
            }}>
              Slik fungerer bedriftsverifisering
            </h2>
            <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              Vi bruker Brønnøysundregisteret for å sikre at alle bedrifter
              på plattformen er ekte og aktive.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
          }} className="verify-grid">
            {/* Prosess */}
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid rgba(200,149,58,0.4)',
              borderRadius: 4, padding: '32px 28px',
            }}>
              <p style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700, fontSize: 12,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: 20,
              }}>
                Verifiseringsprosess
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {VERIFY_STEPS.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 11,
                      color: 'var(--gold)',
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Garantier */}
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 4, padding: '32px 28px',
            }}>
              <p style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700, fontSize: 12,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--t2)', marginBottom: 20,
              }}>
                Dette sikrer at
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {VERIFY_GUARANTEES.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                      {g}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slik funker det */}
      <section style={{
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 24px',
      }}>
        <div className="container-main">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 11,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12,
            }}>
              Kom i gang
            </p>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 32,
              letterSpacing: '0.02em', textTransform: 'uppercase',
              color: 'var(--t1)', margin: 0,
            }}>
              Slik bruker du Anleggstorget
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}>
            {STEPS.map(({ n, title, text }) => (
              <div key={n} style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '28px 24px',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--gold)', color: '#0d0c0a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 16,
                  marginBottom: 18,
                }}>
                  {n}
                </div>
                <h3 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 17, textTransform: 'uppercase',
                  letterSpacing: '0.04em', color: 'var(--t1)', marginBottom: 10,
                }}>
                  {title}
                </h3>
                <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt / CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 11,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: 12,
          }}>
            Kontakt
          </p>
          <h2 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 800, fontSize: 32,
            letterSpacing: '0.02em', textTransform: 'uppercase',
            color: 'var(--t1)', marginBottom: 16,
          }}>
            Har du spørsmål?
          </h2>
          <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
            Vi hjelper gjerne! Ta kontakt på:
          </p>
          <a
            href="mailto:kontakt@anleggstorget.no"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: 'var(--gold)', fontSize: 16, fontWeight: 500,
              textDecoration: 'none', marginBottom: 40,
              fontFamily: 'Barlow, sans-serif',
            }}
          >
            kontakt@anleggstorget.no
          </a>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:kontakt@anleggstorget.no" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Kontakt oss
            </a>
            <Link href="/sok" className="btn-primary">
              Finn maskiner
              <ArrowRight size={14} />
            </Link>
          </div>

          <p style={{
            color: 'var(--t3)', fontSize: 12, marginTop: 56,
            borderTop: '1px solid var(--border)', paddingTop: 32,
          }}>
            Anleggstorget · Norges B2B-markedsplass for tunge maskiner · Oslo, Norge
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .verify-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
