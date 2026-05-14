import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, BookOpen, ChevronRight } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { articles } from '@/lib/guides/articles'

export const metadata: Metadata = {
  title: 'Guider og eksperttips for kjøp av anleggsmaskiner – Anleggstorget',
  description: 'Praktiske guider for kjøp, salg og vedlikehold av brukte anleggsmaskiner i Norge. Sjekklister, prisguider og eksperttips fra bransjen.',
  keywords: ['guide kjøpe gravemaskin', 'anleggsmaskin tips', 'prisguide anleggsmaskiner', 'vedlikehold gravemaskin guide', 'kjøpe brukt maskin Norge'],
  openGraph: {
    title: 'Guider for kjøp av anleggsmaskiner | Anleggstorget',
    description: 'Praktiske guider og eksperttips for kjøp, salg og vedlikehold av brukte anleggsmaskiner.',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Kjøpsguider': 'var(--gold)',
  'Prisoversikter': '#4ade80',
  'Vedlikehold': '#60a5fa',
}

export default function GuidePage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>

        {/* Hero */}
        <section style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '56px 0 48px',
        }}>
          <div className="container-main">
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'var(--t3)' }}>
              <Link href="/" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Hjem</Link>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--t2)' }}>Guider</span>
            </nav>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12,
            }}>
              Ekspertguider
            </p>
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 'clamp(28px, 4vw, 46px)',
              color: 'var(--t1)', letterSpacing: '0.02em', marginBottom: 16,
            }}>
              Guider for kjøp og vedlikehold av anleggsmaskiner
            </h1>
            <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.7, maxWidth: 640 }}>
              Praktiske guider skrevet for norske anleggsbedrifter. Lær hva du bør sjekke før kjøp, hva maskinene bør koste og hvordan du forlenger levetiden på utstyret ditt.
            </p>
          </div>
        </section>

        {/* Article grid */}
        <section style={{ padding: '56px 0' }}>
          <div className="container-main">
            <div className="guide-grid">
              {articles.map(article => (
                <Link
                  key={article.slug}
                  href={`/guide/${article.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                  className="guide-card"
                >
                  <article style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    padding: '28px 28px 24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.15s',
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <span style={{
                        display: 'inline-block',
                        background: 'var(--bg3)',
                        border: `1px solid ${CATEGORY_COLORS[article.category] ?? 'var(--border)'}`,
                        color: CATEGORY_COLORS[article.category] ?? 'var(--t3)',
                        fontSize: 10,
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '3px 10px',
                        borderRadius: 2,
                      }}>
                        {article.category}
                      </span>
                    </div>
                    <h2 style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700, fontSize: 20,
                      color: 'var(--t1)', letterSpacing: '0.01em',
                      lineHeight: 1.25, marginBottom: 12, flexGrow: 1,
                    }}>
                      {article.title}
                    </h2>
                    <p style={{
                      color: 'var(--t2)', fontSize: 13, lineHeight: 1.65,
                      marginBottom: 20,
                    }}>
                      {article.description}
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t3)', fontSize: 12 }}>
                          <Clock size={11} />
                          {article.readingMinutes} min
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t3)', fontSize: 12 }}>
                          <BookOpen size={11} />
                          {new Date(article.updatedAt).toLocaleDateString('nb-NO', { year: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: 'var(--gold)', fontSize: 12,
                        fontFamily: 'Barlow Condensed', fontWeight: 600,
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>
                        Les guide <ArrowRight size={12} />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          padding: '48px 0',
        }}>
          <div className="container-main" style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700, fontSize: 22,
              color: 'var(--t1)', marginBottom: 8,
            }}>
              Klar til å finne riktig maskin?
            </p>
            <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 24 }}>
              Søk blant maskiner fra verifiserte norske bedrifter.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/gravemaskiner" className="btn-primary" style={{ fontSize: 13, padding: '11px 24px' }}>
                <ArrowRight size={14} /> Gravemaskiner
              </Link>
              <Link href="/hjullastere" className="btn-secondary" style={{ fontSize: 13, padding: '11px 24px' }}>
                Hjullastere
              </Link>
              <Link href="/dumpere" className="btn-secondary" style={{ fontSize: 13, padding: '11px 24px' }}>
                Dumpere
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        .guide-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .guide-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .guide-grid { grid-template-columns: 1fr; } }
        .guide-card article:hover { border-color: rgba(200,149,58,0.4) !important; }
      `}</style>
    </>
  )
}
