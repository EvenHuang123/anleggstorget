import Link from 'next/link'
import { TrendingUp, BarChart3, FileText, Bell, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shared/Navbar'
import SubNav from '@/components/shared/SubNav'
import Footer from '@/components/shared/Footer'

export const metadata = {
  title: 'Prisindekser for brukte maskiner – Markedsinnsikt',
  description: 'Kvartalsvise prisindekser, markedstrender og verdivurdering for brukte anleggsmaskiner i Norge. Datadrevet innsikt for smarte kjøp og salg.',
  keywords: ['prisindeks maskin', 'markedspris gravemaskin', 'verdivurdering maskin', 'maskin prisoversikt Norge', 'anleggsutstyr markedsverdi'],
  openGraph: {
    title: 'Markedsinnsikt – Prisindekser for brukte maskiner | Anleggstorget',
    description: 'Kvartalsvise prisindekser og markedstrender for anleggsmaskiner i Norge.',
  },
}

export default async function MarkedsinnsiktPage() {
  let count = 0
  try {
    const supabase = await createClient()
    const result = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    count = result.count ?? 0
  } catch {
    // Supabase unavailable — treat as no data
  }

  const hasEnoughData = count >= 50

  return (
    <>
      <Navbar />
      <SubNav />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '80px 0',
          textAlign: 'center',
        }}>
          <div className="container-main" style={{ maxWidth: 800 }}>
            <div style={{
              display: 'inline-block',
              background: 'var(--gold3)',
              border: '1px solid var(--gold)',
              borderRadius: 16,
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: 24,
            }}>
              {hasEnoughData ? '✓ Nå tilgjengelig' : '⏳ Kommer snart'}
            </div>

            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(36px, 6vw, 56px)',
              color: 'var(--t1)',
              marginBottom: 20,
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}>
              Markedsinnsikt for<br />
              <span style={{ color: 'var(--gold)' }}>tunge maskiner</span>
            </h1>

            <p style={{
              color: 'var(--t2)',
              fontSize: 18,
              lineHeight: 1.7,
              maxWidth: 600,
              margin: '0 auto 40px',
            }}>
              {hasEnoughData
                ? 'Norges mest oppdaterte prisindekser og markedsdata for brukte anleggsmaskiner. Basert på ekte transaksjoner fra verifiserte norske bedrifter.'
                : 'Vi samler data fra maskinsalg for å gi deg Norges mest pålitelige prisindekser og markedstrender for anleggsbransjen.'}
            </p>

            {hasEnoughData ? (
              <Link href="/markedsinnsikt/prisindeks" className="btn-primary" style={{ fontSize: 16 }}>
                Se prisindekser
                <ArrowRight size={18} />
              </Link>
            ) : (
              <div style={{
                display: 'inline-block',
                padding: '14px 28px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: 3,
                color: 'var(--t2)',
                fontSize: 15,
              }}>
                Lanseres når vi har tilstrekkelig data ({count} / 50 annonser)
              </div>
            )}
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ padding: '80px 0' }}>
          <div className="container-main" style={{ maxWidth: 1000 }}>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 32,
              color: 'var(--t1)',
              textAlign: 'center',
              marginBottom: 56,
              letterSpacing: '0.02em',
            }}>
              Hva du får tilgang til
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 32,
            }}>
              {[
                {
                  Icon: TrendingUp,
                  title: 'Kvartalsvise prisindekser',
                  text: 'Gjennomsnittspriser og pristrend per kategori, oppdatert hver 3. måned.',
                },
                {
                  Icon: BarChart3,
                  title: 'Markedstrender',
                  text: 'Se hvilke maskiner som er mest etterspurt og hvordan prisene utvikler seg.',
                },
                {
                  Icon: FileText,
                  title: 'Kvartalsrapporter',
                  text: 'Last ned detaljerte PDF-rapporter med dybdeanalyse av maskinmarkedet.',
                },
              ].map(({ Icon, title, text }) => (
                <div key={title} style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: '32px 28px',
                }}>
                  <div style={{
                    width: 56, height: 56,
                    borderRadius: '50%',
                    background: 'var(--gold3)',
                    border: '2px solid var(--gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <Icon size={28} style={{ color: 'var(--gold)' }} />
                  </div>
                  <h3 style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700, fontSize: 20,
                    color: 'var(--t1)', marginBottom: 12,
                  }}>
                    {title}
                  </h3>
                  <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust section */}
        <div style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '80px 0',
        }}>
          <div className="container-main" style={{ maxWidth: 800, textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 32,
              color: 'var(--t1)', marginBottom: 20,
            }}>
              Hvorfor stole på våre data?
            </h2>
            <p style={{ color: 'var(--t2)', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
              All data kommer fra <strong style={{ color: 'var(--t1)' }}>ekte transaksjoner</strong> mellom{' '}
              <strong style={{ color: 'var(--t1)' }}>verifiserte norske bedrifter</strong> på Anleggstorget.
              Ingen estimater, ingen gjetninger — kun faktiske priser fra det norske markedet.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: 4, padding: '16px 24px',
            }}>
              <div style={{ fontSize: 32, lineHeight: 1 }}>🔐</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 15,
                  color: 'var(--t1)', marginBottom: 2,
                }}>
                  100% verifiserte bedrifter
                </div>
                <div style={{ fontSize: 13, color: 'var(--t3)' }}>
                  Alle priser kommer fra Brønnøysund-verifiserte selskaper
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '80px 0' }}>
          <div className="container-main" style={{ maxWidth: 600, textAlign: 'center' }}>
            {hasEnoughData ? (
              <>
                <h2 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 28,
                  color: 'var(--t1)', marginBottom: 16,
                }}>
                  Klar til å utforske markedet?
                </h2>
                <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 32 }}>
                  Helt gratis for alle registrerte brukere på Anleggstorget.
                </p>
                <Link href="/markedsinnsikt/prisindeks" className="btn-primary">
                  Se prisindekser nå
                  <ArrowRight size={18} />
                </Link>
              </>
            ) : (
              <>
                <h2 style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 28,
                  color: 'var(--t1)', marginBottom: 16,
                }}>
                  Få beskjed når vi lanserer
                </h2>
                <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 32 }}>
                  Vi varsler deg så snart markedsinnsikt er tilgjengelig. Helt gratis for registrerte brukere.
                </p>
                <Link href="/registrer" className="btn-primary">
                  <Bell size={18} />
                  Registrer deg nå
                </Link>
              </>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
